"""
ReadBright Backend — Pydantic Schemas
Request/response models for the screening API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================
# REQUEST SCHEMAS (Frontend → Backend)
# ============================================

class ChildInfo(BaseModel):
    """Child profile information from the consent screen."""
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=5, le=13)
    grade: Optional[str] = ""
    parent_email: Optional[str] = ""
    avatar: Optional[str] = "knight"
    age_track: str = Field(..., pattern="^(foundational|decoding|comprehension)$")


class TaskResultInput(BaseModel):
    """Individual task result (one of LNF, PSF, NWF)."""
    task_type: str = Field(..., pattern="^(LNF|PSF|NWF)$")
    task_name: str
    correct: int = Field(..., ge=0)
    total: int = Field(..., ge=0)
    time_spent_seconds: Optional[int] = 60
    normalized_score: float = Field(..., ge=0, le=100)
    risk_flag: str = Field(..., pattern="^(low|some|at_risk)$")
    details: Optional[Dict[str, Any]] = None


class ScreeningSubmitRequest(BaseModel):
    """
    Complete screening submission payload.
    Sent from the frontend after all 3 tasks are complete.
    """
    # Child info
    child: ChildInfo

    # Task results (exactly 3: LNF, PSF, NWF)
    task_results: List[TaskResultInput] = Field(..., min_length=3, max_length=3)

    # WCRS composite
    wcrs_score: float = Field(..., ge=0, le=100)
    risk_tier: str = Field(..., pattern="^(low|some|at_risk)$")
    risk_label: str
    age_track: str

    # Audit data
    weights_used: Optional[Dict[str, float]] = None
    benchmarks_used: Optional[Dict[str, Any]] = None

    # Gamification rewards
    rewards: Optional[Dict[str, int]] = None

    # Metadata
    screening_version: Optional[str] = "1.0.0"
    completed_at: Optional[str] = None


# ============================================
# RESPONSE SCHEMAS (Backend → Frontend)
# ============================================

class TaskResultResponse(BaseModel):
    """Task result as returned from the server."""
    id: int
    task_type: str
    task_name: str
    correct: int
    total: int
    normalized_score: float
    risk_flag: str

    class Config:
        from_attributes = True


class ScreeningSubmitResponse(BaseModel):
    """Response after successfully saving a screening session."""
    success: bool = True
    message: str = "Screening saved successfully"
    session_id: int
    child_id: int
    wcrs_score: float
    risk_tier: str
    risk_label: str
    task_results: List[TaskResultResponse]
    created_at: str

    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    service: str = "ReadBright Screening API"
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str
    detail: Optional[str] = None
