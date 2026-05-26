import json
import logging
from typing import Optional
from openai import AsyncOpenAI
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

SYSTEM_PROMPT = """You are an AI meeting analyst. Analyze the following meeting transcript and extract structured information.

Return a JSON object with these fields:
- title: A concise, smart meeting title (max 10 words)
- summary: A 2-3 paragraph executive summary
- category: One of: general, standup, planning, brainstorm, review, one_on_one, client, other
- speakers: Array of unique speaker names found in the transcript
- key_decisions: Array of key decisions made (each a string)
- action_items: Array of action items discussed (each a string)
- insights: Array of key insights or important points (each a string)
- tasks: Array of task objects with: title, assigned_to (or "" if unclear)
- sentiment: Object with: overall (positive/neutral/negative), confidence (0-100), intensity (low/medium/high), collaboration (0-100)
- next_steps: Array of 3-5 smart AI-recommended next actions (each a string)"""
  # noqa: E501


class AIService:
    def __init__(self):
        self.client = (
            AsyncOpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
            if settings.openai_api_key
            else None
        )
        self.model = settings.openai_model

    async def transcribe_audio(self, audio_path: str) -> str:
        if not self.client:
            logger.warning("OpenAI not configured, returning mock transcript")
            return self._mock_transcript()

        try:
            with open(audio_path, "rb") as audio_file:
                transcript = await self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text",
                )
            return transcript
        except Exception as e:
            logger.error(f"Transcription failed: {e}, falling back to mock transcript")
            return self._mock_transcript()

    async def analyze_transcript(self, transcript: str) -> dict:
        if not self.client:
            logger.warning("OpenAI not configured, returning mock analysis")
            return self._mock_analysis(transcript)

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Transcript:\n\n{transcript}"},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )

            content = response.choices[0].message.content
            return json.loads(content) if content else self._mock_analysis(transcript)
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._mock_analysis(transcript)

    def _mock_transcript(self) -> str:
        return """Alex Chen: Hey everyone, thanks for joining. Let's kick off the sprint planning.
Sarah Kim: Sure. I've been looking at the auth module — we need to finalize the middleware before launch.
Mia Patel: Agreed. Also, I think we should defer the sharding decision until we see beta QPS numbers.
Daniel Ross: One concern — connection pooling under 3x traffic could be a risk. We should flag that for launch readiness.
Emma Carter: On the cache layer, I've seen 22% p95 latency improvement in staging. That's ready to ship.
Alex Chen: Great. Let's align on the API v2 surface. Sarah, what's the ETA on auth?
Sarah Kim: If we finalize the spec today, I can have it done by Thursday.
Mia Patel: I'll run the cache benchmarks and report back tomorrow.
Alex Chen: Perfect. Let's document the decisions and share the summary."""

    def _mock_analysis(self, transcript: str) -> dict:
        return {
            "title": "Team Meeting Discussion",
            "summary": f"Meeting transcript analyzed. Key topics discussed: {transcript[:200]}...",
            "category": "general",
            "speakers": ["Speaker 1", "Speaker 2"],
            "key_decisions": ["Proceed with the discussed plan", "Follow up on action items"],
            "action_items": ["Review meeting notes", "Assign tasks to team members"],
            "insights": ["Team alignment achieved on main topics", "Several action items identified"],
            "tasks": [
                {"title": "Review meeting outcomes", "assigned_to": ""},
                {"title": "Follow up on decisions", "assigned_to": ""},
            ],
            "sentiment": {
                "overall": "positive",
                "confidence": 82,
                "intensity": "medium",
                "collaboration": 75,
            },
            "next_steps": [
                "Schedule a follow-up review session",
                "Share meeting summary with all participants",
                "Begin work on identified action items",
            ],
        }

    async def generate_chat_response(
        self, meeting_context: str, messages: list[dict], question: str
    ) -> str:
        if not self.client:
            return "AI chat is available when OpenAI API key is configured."

        system_prompt = f"""You are a meeting assistant AI. You have access to the following meeting transcript and analysis. Answer the user's question based on this context.

Meeting Context:
{meeting_context}

Answer questions accurately based ONLY on the provided meeting context. If the answer isn't in the context, say so politely."""

        try:
            formatted_messages = [{"role": "system", "content": system_prompt}]
            for msg in messages:
                formatted_messages.append({"role": msg["role"], "content": msg["content"]})
            formatted_messages.append({"role": "user", "content": question})

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=formatted_messages,
                temperature=0.3,
                max_tokens=1000,
            )

            return response.choices[0].message.content or "No response generated."
        except Exception as e:
            logger.error(f"Chat failed: {e}")
            return f"Sorry, I encountered an error: {str(e)}"
