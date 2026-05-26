import uuid
from sqlalchemy import TypeDecorator, String


class GUID(TypeDecorator):
    """Portable GUID type that works with both PostgreSQL and SQLite."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(value)
