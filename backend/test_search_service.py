#!/usr/bin/env python
"""
Simple test to verify search_service.py structure and imports.
"""
import sys
import asyncio

# Test imports
try:
    from app.services.search_service import SearchService
    print("✓ SearchService imported successfully")
except ImportError as e:
    print(f"✗ Failed to import SearchService: {e}")
    sys.exit(1)

try:
    from app.models.meeting import Meeting
    print("✓ Meeting model imported successfully")
except ImportError as e:
    print(f"✗ Failed to import Meeting model: {e}")
    sys.exit(1)

try:
    from app.services.ai_service import AIService
    print("✓ AIService imported successfully")
except ImportError as e:
    print(f"✗ Failed to import AIService: {e}")
    sys.exit(1)

# Test SearchService class structure
try:
    # Check class methods exist
    assert hasattr(SearchService, 'search_meetings'), "search_meetings method missing"
    assert hasattr(SearchService, '_search_database'), "_search_database method missing"
    assert hasattr(SearchService, '_generate_summary'), "_generate_summary method missing"
    assert hasattr(SearchService, '_extract_search_terms'), "_extract_search_terms method missing"
    assert hasattr(SearchService, '_extract_snippet'), "_extract_snippet method missing"
    assert hasattr(SearchService, '_calculate_relevance'), "_calculate_relevance method missing"
    print("✓ All required SearchService methods present")
except AssertionError as e:
    print(f"✗ {e}")
    sys.exit(1)

# Verify method signatures
import inspect
sig = inspect.signature(SearchService.search_meetings)
assert 'query' in sig.parameters, "search_meetings must have 'query' parameter"
print("✓ search_meetings has correct signature")

sig = inspect.signature(SearchService._search_database)
assert 'search_terms' in sig.parameters, "_search_database must have 'search_terms' parameter"
print("✓ _search_database has correct signature")

print("\n✓ All tests passed! SearchService is ready to use.")
