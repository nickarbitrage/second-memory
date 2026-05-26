import logging
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload

from app.models.meeting import Meeting
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)


class SearchService:
    def __init__(self, db: AsyncSession, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.ai = AIService()

    async def search_meetings(self, query: str) -> dict:
        """
        Main search method that uses AI to understand user intent and search meetings.

        Returns a dict with:
        - query: original user query
        - summary: AI-generated summary of findings
        - results: list of relevant meetings with snippets and relevance scores
        """
        try:
            # Extract search terms using AI for better intent understanding
            search_terms = await self._extract_search_terms(query)

            # Search the database with extracted terms
            meetings = await self._search_database(search_terms)

            if not meetings:
                return {
                    "query": query,
                    "summary": f"No meetings found matching '{query}'.",
                    "results": [],
                }

            # Generate AI summary of findings
            summary = await self._generate_summary(query, meetings)

            # Format and rank results
            results = []
            for meeting in meetings:
                snippet = self._extract_snippet(query, meeting)
                relevance_score = self._calculate_relevance(query, meeting)

                results.append(
                    {
                        "meeting_id": str(meeting.id),
                        "title": meeting.title or "Untitled Meeting",
                        "snippet": snippet,
                        "relevance_score": relevance_score,
                        "category": meeting.category,
                        "created_at": meeting.created_at.isoformat() if meeting.created_at else None,
                    }
                )

            # Sort by relevance score descending
            results.sort(key=lambda x: x["relevance_score"], reverse=True)

            return {
                "query": query,
                "summary": summary,
                "results": results[:10],  # Limit to 10 most relevant
            }
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return {
                "query": query,
                "summary": f"Search encountered an error: {str(e)}",
                "results": [],
            }

    async def _extract_search_terms(self, query: str) -> list[str]:
        """
        Use AI to extract meaningful search terms from natural language query.
        """
        if not self.ai.client:
            # Fallback: simple tokenization if AI is not available
            return [term.strip() for term in query.lower().split() if len(term.strip()) > 2]

        try:
            response = await self.ai.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": "Extract 3-5 key search terms from the user's query. Return only the terms as a comma-separated list, nothing else.",
                    },
                    {"role": "user", "content": query},
                ],
                temperature=0.3,
                max_tokens=100,
            )

            content = response.choices[0].message.content or query
            terms = [term.strip() for term in content.split(",") if term.strip()]
            return terms if terms else [query]
        except Exception as e:
            logger.error(f"Failed to extract search terms: {e}")
            return [query]

    async def _search_database(self, search_terms: list[str]) -> list[Meeting]:
        """
        Search database using SQLAlchemy for meetings matching search terms.
        Searches across title, summary, transcript, decisions, and action items.
        """
        # Build OR conditions for each search term
        search_conditions = []
        for term in search_terms:
            term_lower = f"%{term}%"
            search_conditions.append(
                or_(
                    Meeting.title.ilike(term_lower),
                    Meeting.summary.ilike(term_lower),
                    Meeting.transcript.ilike(term_lower),
                    # JSON field searches (if the database supports it)
                )
            )

        # Combine all conditions with OR
        combined_filter = or_(*search_conditions) if search_conditions else None

        query = select(Meeting).where(Meeting.user_id == self.user_id)

        if combined_filter is not None:
            query = query.where(combined_filter)

        result = await self.db.execute(query)
        meetings = result.scalars().all()

        return meetings

    async def _generate_summary(self, query: str, meetings: list[Meeting]) -> str:
        """
        Generate an AI summary of search findings.
        """
        if not self.ai.client or not meetings:
            count = len(meetings)
            titles = ", ".join([m.title[:30] for m in meetings[:3]])
            return f"Found {count} meeting(s) matching '{query}': {titles}{'...' if count > 3 else ''}."

        try:
            # Compile meeting information for context
            meeting_context = "\n".join(
                [
                    f"- {m.title} ({m.category}): {(m.summary or '')[:200]}"
                    for m in meetings[:5]
                ]
            )

            response = await self.ai.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a meeting search assistant. Generate a concise summary of search findings.",
                    },
                    {
                        "role": "user",
                        "content": f"""User searched for: "{query}"

Found {len(meetings)} meeting(s):
{meeting_context}

Generate a brief 1-2 sentence summary of the key findings.""",
                    },
                ],
                temperature=0.3,
                max_tokens=200,
            )

            return response.choices[0].message.content or f"Found {len(meetings)} relevant meeting(s)."
        except Exception as e:
            logger.error(f"Failed to generate summary: {e}")
            return f"Found {len(meetings)} relevant meeting(s) matching '{query}'."

    def _extract_snippet(self, query: str, meeting: Meeting) -> str:
        """
        Extract a relevant snippet from meeting data that matches the query.
        """
        query_lower = query.lower()

        # Search in transcript first (most relevant)
        if meeting.transcript and query_lower in meeting.transcript.lower():
            index = meeting.transcript.lower().find(query_lower)
            start = max(0, index - 50)
            end = min(len(meeting.transcript), index + 150)
            return f"...{meeting.transcript[start:end].strip()}..."

        # Fall back to summary
        if meeting.summary:
            return meeting.summary[:200] + ("..." if len(meeting.summary) > 200 else "")

        # Final fallback to title
        return meeting.title[:100] if meeting.title else "No content available"

    def _calculate_relevance(self, query: str, meeting: Meeting) -> float:
        """
        Calculate relevance score between 0 and 1.
        """
        score = 0.0
        query_lower = query.lower()
        query_terms = set(query_lower.split())

        # Title match (highest weight)
        if meeting.title and query_lower in meeting.title.lower():
            score += 0.5
        else:
            title_matches = sum(1 for term in query_terms if term in (meeting.title or "").lower())
            score += (title_matches / max(len(query_terms), 1)) * 0.3

        # Summary match (medium weight)
        if meeting.summary and query_lower in meeting.summary.lower():
            score += 0.3
        else:
            summary_matches = sum(1 for term in query_terms if term in (meeting.summary or "").lower())
            score += (summary_matches / max(len(query_terms), 1)) * 0.2

        # Transcript match (base weight)
        if meeting.transcript and query_lower in meeting.transcript.lower():
            score += 0.2

        # Action items and decisions match
        action_items_str = " ".join(meeting.action_items or [])
        key_decisions_str = " ".join(meeting.key_decisions or [])
        content_str = (action_items_str + " " + key_decisions_str).lower()

        if query_lower in content_str:
            score += 0.15

        # Cap score at 1.0
        return min(score, 1.0)

    async def analyst_query(self, query: str) -> dict:
        """
        Workspace AI analyst: aggregate context across meetings and return structured answer.
        """
        result = await self.db.execute(
            select(Meeting)
            .where(Meeting.user_id == self.user_id, Meeting.is_processed == True)
            .order_by(desc(Meeting.created_at))
            .limit(30)
        )
        meetings = result.scalars().all()

        if not meetings:
            return {
                "query": query,
                "answer": "No processed meetings found in your workspace yet.",
                "key_points": [],
                "results": [],
            }

        search_result = await self.search_meetings(query)
        context_meetings = meetings[:15]
        if search_result["results"]:
            found_ids = {r["meeting_id"] for r in search_result["results"]}
            context_meetings = [
                m for m in meetings if str(m.id) in found_ids
            ] or context_meetings[:8]

        if not self.ai.client:
            return {
                "query": query,
                "answer": search_result.get("summary", f"Found {len(search_result.get('results', []))} related meetings."),
                "key_points": [],
                "results": search_result.get("results", [])[:8],
            }

        blocks = []
        for m in context_meetings[:10]:
            decisions = ", ".join((m.key_decisions or [])[:3])
            actions = ", ".join((m.action_items or [])[:3])
            blocks.append(
                f"Meeting: {m.title}\nCategory: {m.category}\nSummary: {(m.summary or '')[:400]}\n"
                f"Decisions: {decisions}\nActions: {actions}\n"
            )

        try:
            response = await self.ai.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an AI workspace analyst for meeting intelligence. "
                            "Answer using ONLY the provided meetings. Return JSON with: "
                            "answer (2-4 sentences), key_points (array of 3-5 bullets), "
                            "related_meeting_titles (array of meeting titles referenced)."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f'Question: "{query}"\n\nMeetings:\n' + "\n---\n".join(blocks),
                    },
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=500,
            )
            import json

            parsed = json.loads(response.choices[0].message.content or "{}")
            answer = parsed.get("answer", search_result.get("summary", ""))
            key_points = parsed.get("key_points", [])

            results = search_result.get("results", [])[:8]
            if not results:
                results = [
                    {
                        "meeting_id": str(m.id),
                        "title": m.title or "Untitled",
                        "snippet": (m.summary or "")[:180],
                        "relevance_score": 0.7,
                        "category": m.category,
                        "created_at": m.created_at.isoformat() if m.created_at else None,
                    }
                    for m in context_meetings[:5]
                ]

            return {
                "query": query,
                "answer": answer,
                "key_points": key_points if isinstance(key_points, list) else [],
                "results": results,
            }
        except Exception as e:
            logger.error(f"Analyst query failed: {e}")
            return {
                "query": query,
                "answer": search_result.get("summary", "Unable to generate analyst response."),
                "key_points": [],
                "results": search_result.get("results", []),
            }
