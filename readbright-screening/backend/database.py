"""
ReadBright Backend — Database Configuration
SQLAlchemy engine + session factory for SQLite.
Tables: children, screening_sessions, task_results
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# --- Database URL ---
# Uses SQLite by default (file-based, zero config).
# For production, switch to PostgreSQL:
#   DATABASE_URL = "postgresql://user:pass@localhost:5432/readbright"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./readbright.db")

# --- SQLAlchemy Engine ---
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite only
)

# --- Session Factory ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Base Class for Models ---
Base = declarative_base()


def get_db():
    """
    Dependency: yields a DB session per request.
    Automatically closes the session when done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all tables. Call once at startup.
    """
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
