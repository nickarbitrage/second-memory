# SearchService Implementation - Phase 5 AI-Powered Workspace Search

## Overview

The `SearchService` class provides AI-powered semantic search capabilities for MeetMind meetings. It combines natural language understanding (via ChatGPT) with intelligent database queries to help users find relevant meetings using conversational search terms.

## Features

### 1. Natural Language Query Understanding
- Uses ChatGPT (gpt-4o-mini) to extract meaningful search terms from user queries
- Handles conversational queries like "Show me meetings about onboarding" or "Find discussions on Q4 planning"
- Gracefully falls back to simple tokenization if OpenAI is not configured

### 2. Intelligent Database Search
- Searches across multiple meeting fields:
  - Meeting titles
  - Summaries
  - Transcripts
  - Action items
  - Key decisions
- Case-insensitive LIKE queries for flexibility
- Privacy-aware filtering by user_id

### 3. Result Ranking & Relevance Scoring
- Calculates relevance scores (0-1) based on:
  - **Title matches (0.5 weight)** - Most relevant
  - **Summary matches (0.3 weight)**
  - **Transcript matches (0.2 weight)**
  - **Action items & decisions (0.15 weight)**
- Results sorted by relevance score
- Limited to top 10 most relevant meetings

### 4. AI-Generated Summaries
- Generates concise 1-2 sentence summaries of search findings
- Provides context about key findings
- Uses meeting titles, categories, and summaries for context

### 5. Context Snippets
- Extracts relevant text excerpts from meetings
- Prioritizes:
  1. Transcript excerpts (with context padding)
  2. Summary excerpts (200 char limit)
  3. Title as fallback

## API Endpoint

### New AI-Powered Search Endpoint
```
GET /api/meetings/ai-search/results?q={query}
```

**Parameters:**
- `q` (string, required): Natural language search query (min 1 character)

**Response Format:**
```json
{
  "query": "Show meetings about onboarding",
  "summary": "Found 3 meetings discussing onboarding processes including team onboarding planning and new hire discussions.",
  "results": [
    {
      "meeting_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Team Onboarding Planning",
      "snippet": "...discussed the onboarding process for new team members. Key points included...",
      "relevance_score": 0.95,
      "category": "planning",
      "created_at": "2024-01-15T10:30:00+00:00"
    },
    {
      "meeting_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Q1 Onboarding Strategy",
      "snippet": "We need to streamline the onboarding experience...",
      "relevance_score": 0.85,
      "category": "general",
      "created_at": "2024-01-10T14:15:00+00:00"
    }
  ]
}
```

## Implementation Details

### Class: SearchService

#### Constructor
```python
def __init__(self, db: AsyncSession, user_id: UUID)
```
- `db`: AsyncSession database connection
- `user_id`: UUID of the authenticated user (for privacy)
- Initializes AIService for ChatGPT integration

#### Main Method: search_meetings()
```python
async def search_meetings(query: str) -> dict
```

**Flow:**
1. Extract search terms using ChatGPT
2. Query database with extracted terms
3. Handle empty results
4. Generate AI summary of findings
5. Calculate relevance scores
6. Extract snippets for each result
7. Sort by relevance and return top 10

**Error Handling:**
- Graceful fallbacks when OpenAI is unavailable
- Comprehensive logging for debugging
- Returns empty results array on error

#### Internal Methods

**_extract_search_terms(query: str) -> list[str]**
- Uses ChatGPT to parse natural language query
- Returns 3-5 key search terms
- Falls back to simple tokenization if AI unavailable

**_search_database(search_terms: list[str]) -> list[Meeting]**
- Executes SQLAlchemy queries against meetings table
- Uses OR conditions to match any search term
- Filters by user_id for privacy
- Returns all matching meetings (no limit at DB level)

**_generate_summary(query: str, meetings: list[Meeting]) -> str**
- Uses ChatGPT to summarize search findings
- Includes meeting titles, categories, and summaries as context
- Returns concise, user-friendly summary

**_extract_snippet(query: str, meeting: Meeting) -> str**
- Finds relevant excerpt matching the query
- Prioritizes transcript (with 50 char padding on each side)
- Falls back to summary (200 char limit)
- Final fallback to meeting title

**_calculate_relevance(query: str, meeting: Meeting) -> float**
- Calculates 0-1 relevance score
- Multi-field weighted scoring system
- Considers exact phrase matches and individual term matches
- Combines matches across title, summary, transcript, and metadata

## Database Queries

All queries are user-scoped for privacy:

```python
# Basic pattern
SELECT * FROM meetings 
WHERE user_id = {user_id} 
AND (title ILIKE '%term%' OR summary ILIKE '%term%' OR transcript ILIKE '%term%' OR ...)
```

## Error Handling & Fallbacks

| Scenario | Behavior |
|----------|----------|
| No meetings found | Return empty results with explanatory summary |
| OpenAI unavailable | Use simple keyword extraction and basic summaries |
| Summary generation fails | Return fallback text with meeting count |
| Snippet extraction fails | Use title as fallback |
| Database error | Log error and return empty results with error message |

## Usage Examples

### Example 1: Query about onboarding
```bash
curl "http://localhost:8000/api/meetings/ai-search/results?q=Show%20meetings%20about%20onboarding"
```

### Example 2: Query about Q4 planning
```bash
curl "http://localhost:8000/api/meetings/ai-search/results?q=Find%20Q4%20planning%20discussions"
```

### Example 3: Query about action items
```bash
curl "http://localhost:8000/api/meetings/ai-search/results?q=What%20were%20the%20action%20items%20from%20our%20recent%20strategy%20session"
```

## Configuration

SearchService requires:
- Valid AsyncSession for database access
- OpenAI API key (optional, for enhanced NLP)
- User authentication context

Configured via `app.config.get_settings()`:
```python
settings.openai_api_key  # Optional, enables AI features
settings.database_url    # Required, for meeting storage
```

## Performance Considerations

- **Search Latency**: ~0.5-2s per search (dominated by ChatGPT API calls)
  - Extract terms: ~200-400ms
  - Database query: ~50-100ms
  - Generate summary: ~300-600ms
- **Result Limit**: Top 10 most relevant results (configurable)
- **Caching**: Consider caching frequently searched queries at API layer
- **Scaling**: Database indexes on user_id, title, and summary recommended

## Future Enhancements

1. **Vector Search**: Implement semantic embeddings for better relevance
2. **Query Caching**: Cache common search terms and results
3. **Advanced Filters**: Allow filtering by date, category, participants
4. **Search Analytics**: Track popular searches and refine algorithm
5. **Multi-language Support**: Support search queries in multiple languages
6. **Hybrid Search**: Combine keyword search with semantic search
7. **Search History**: Store user search history for personalization

## Testing

Run the structure test:
```bash
python test_search_service.py
```

The test verifies:
- All required imports available
- All required methods present
- Correct method signatures
- Proper class structure

## Related Files

- `app/services/search_service.py` - Main implementation
- `app/routers/meetings.py` - API endpoint integration
- `app/services/ai_service.py` - ChatGPT integration
- `app/models/meeting.py` - Meeting data model
- `app/database.py` - Database configuration
