"""
ReadBright Backend — SQLAlchemy Models
Database schema from PBL report:
  - children: stores child profile info
  - screening_sessions: one per screening attempt, contains WCRS + risk tier
  - task_results: per-task scores (LNF, PSF, NWF) linked to a session
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Child(Base):
    """
    children table — stores the child's profile.
    One child can have multiple screening sessions over time.
    """
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    grade = Column(String(20), nullable=True)
    parent_email = Column(String(255), nullable=True)
    avatar = Column(String(50), nullable=True)
    age_track = Column(String(30), nullable=False)  # foundational | decoding | comprehension
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: child → screening sessions
    sessions = relationship("ScreeningSession", back_populates="child", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Child(id={self.id}, name='{self.name}', age={self.age}, track='{self.age_track}')>"


class ScreeningSession(Base):
    """
    screening_sessions table — one record per complete screening.
    Contains the composite WCRS score, risk tier, and metadata.
    """
    __tablename__ = "screening_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)

    # --- WCRS Composite Score ---
    wcrs_score = Column(Float, nullable=False)           # 0–100
    risk_tier = Column(String(20), nullable=False)       # low | some | at_risk
    risk_label = Column(String(50), nullable=False)      # Human-readable label
    age_track = Column(String(30), nullable=False)       # foundational | decoding | comprehension

    # --- Weight configuration used (for audit trail) ---
    weights_used = Column(JSON, nullable=True)           # {"lnf": 0.30, "psf": 0.35, "nwf": 0.35}
    benchmarks_used = Column(JSON, nullable=True)        # Benchmark thresholds used

    # --- Gamification rewards (child-facing only) ---
    rewards = Column(JSON, nullable=True)                # {readingStars, storyGems, ...}

    # --- Metadata ---
    screening_version = Column(String(20), nullable=True, default="1.0.0")
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    child = relationship("Child", back_populates="sessions")
    task_results = relationship("TaskResult", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ScreeningSession(id={self.id}, wcrs={self.wcrs_score}, risk='{self.risk_tier}')>"


class TaskResult(Base):
    """
    task_results table — individual task scores.
    One screening session has exactly 3 task results: LNF, PSF, NWF.
    """
    __tablename__ = "task_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("screening_sessions.id"), nullable=False)

    # --- Task Identification ---
    task_type = Column(String(10), nullable=False)       # LNF | PSF | NWF
    task_name = Column(String(50), nullable=False)       # Letter Park | Sound Tree | Alien Words

    # --- Scores ---
    correct = Column(Integer, nullable=False, default=0)
    total = Column(Integer, nullable=False, default=0)
    time_spent_seconds = Column(Integer, nullable=True, default=60)
    normalized_score = Column(Float, nullable=False, default=0.0)  # 0–100 (%)
    risk_flag = Column(String(20), nullable=False)       # low | some | at_risk

    # --- Detailed breakdown (varies by task type) ---
    details = Column(JSON, nullable=True)
    # LNF: {letters_named, total_letters}
    # PSF: {correct_sounds, total_sounds, words_correct}
    # NWF: {correct_letter_sounds, whole_words_read, total_words}

    # --- Metadata ---
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    session = relationship("ScreeningSession", back_populates="task_results")

    def __repr__(self):
        return f"<TaskResult(id={self.id}, task='{self.task_type}', score={self.normalized_score}%)>"
