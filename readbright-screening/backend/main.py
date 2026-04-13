"""
ReadBright — FastAPI Backend (Screening Module Only)
=====================================================
Endpoint: POST /screening/submit
- Receives screening data from the frontend
- Creates child record (or finds existing by name+age)
- Creates screening session with WCRS + risk tier
- Creates 3 task results (LNF, PSF, NWF)
- Returns session ID + confirmation

Run:
    cd backend
    uvicorn main:app --reload --port 8000

Or from parent directory:
    python -m uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

from database import get_db, init_db, engine, Base
from models import Child, ScreeningSession, TaskResult
from schemas import (
    ScreeningSubmitRequest,
    ScreeningSubmitResponse,
    TaskResultResponse,
    HealthResponse,
    ErrorResponse
)

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("readbright")

# --- FastAPI App ---
app = FastAPI(
    title="ReadBright Screening API",
    description="Backend for the ReadBright early dyslexia identification screening module.",
    version="1.0.0"
)

# --- CORS (allow frontend at any localhost port) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "null",  # For file:// protocol (local HTML files)
        "*"      # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Startup: Create Tables ---
@app.on_event("startup")
def on_startup():
    """Create all database tables on server start."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("ReadBright Screening API is ready!")


# ============================================
# HEALTH CHECK
# ============================================
@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Check that the API is running and healthy."""
    return HealthResponse()


# ============================================
# ROOT ENDPOINT
# ============================================
@app.get("/", tags=["Health"])
def read_root():
    """Root endpoint to verify API is active."""
    return {"message": "ReadBright Screening API is connected and running! 🚀", "status": "online"}


# ============================================
# POST /screening/submit
# Core endpoint — saves a complete screening
# ============================================
@app.post(
    "/screening/submit",
    response_model=ScreeningSubmitResponse,
    tags=["Screening"],
    summary="Submit a complete screening session"
)
def submit_screening(
    payload: ScreeningSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Receives the complete screening data from the frontend.

    Flow:
    1. Create or find the child record
    2. Create the screening session (WCRS + risk tier)
    3. Create 3 task results (LNF, PSF, NWF)
    4. Return confirmation with session ID

    This is the ONLY endpoint the frontend calls.
    """
    try:
        logger.info(f"[SUBMIT] Screening for child: {payload.child.name}, age: {payload.child.age}")

        # --- 1. Create Child Record ---
        # Check if child already exists (same name + age + parent email)
        existing_child = db.query(Child).filter(
            Child.name == payload.child.name,
            Child.age == payload.child.age,
            Child.parent_email == (payload.child.parent_email or "")
        ).first()

        if existing_child:
            child = existing_child
            logger.info(f"[SUBMIT] Found existing child: id={child.id}")
        else:
            child = Child(
                name=payload.child.name,
                age=payload.child.age,
                grade=payload.child.grade or "",
                parent_email=payload.child.parent_email or "",
                avatar=payload.child.avatar or "knight",
                age_track=payload.child.age_track
            )
            db.add(child)
            db.flush()  # Get the child ID before creating session
            logger.info(f"[SUBMIT] Created new child: id={child.id}")

        # --- 2. Create Screening Session ---
        session = ScreeningSession(
            child_id=child.id,
            wcrs_score=payload.wcrs_score,
            risk_tier=payload.risk_tier,
            risk_label=payload.risk_label,
            age_track=payload.age_track,
            weights_used=payload.weights_used,
            benchmarks_used=payload.benchmarks_used,
            rewards=payload.rewards,
            screening_version=payload.screening_version or "1.0.0",
            completed_at=datetime.now(timezone.utc)
        )
        db.add(session)
        db.flush()  # Get the session ID
        logger.info(f"[SUBMIT] Created session: id={session.id}, WCRS={payload.wcrs_score}, risk={payload.risk_tier}")

        # --- 3. Create Task Results ---
        task_result_objects = []
        for tr in payload.task_results:
            task_result = TaskResult(
                session_id=session.id,
                task_type=tr.task_type,
                task_name=tr.task_name,
                correct=tr.correct,
                total=tr.total,
                time_spent_seconds=tr.time_spent_seconds or 60,
                normalized_score=tr.normalized_score,
                risk_flag=tr.risk_flag,
                details=tr.details
            )
            db.add(task_result)
            task_result_objects.append(task_result)
            logger.info(f"[SUBMIT]   Task {tr.task_type}: correct={tr.correct}, normalized={tr.normalized_score}%, risk={tr.risk_flag}")

        # --- 4. Commit Everything ---
        db.commit()

        # Refresh objects to get auto-generated IDs
        db.refresh(session)
        for tr_obj in task_result_objects:
            db.refresh(tr_obj)

        logger.info(f"[SUBMIT] ✓ Screening saved successfully! Session ID: {session.id}")

        # --- 5. Build Response ---
        return ScreeningSubmitResponse(
            success=True,
            message="Screening saved successfully",
            session_id=session.id,
            child_id=child.id,
            wcrs_score=session.wcrs_score,
            risk_tier=session.risk_tier,
            risk_label=session.risk_label,
            task_results=[
                TaskResultResponse(
                    id=tr_obj.id,
                    task_type=tr_obj.task_type,
                    task_name=tr_obj.task_name,
                    correct=tr_obj.correct,
                    total=tr_obj.total,
                    normalized_score=tr_obj.normalized_score,
                    risk_flag=tr_obj.risk_flag
                )
                for tr_obj in task_result_objects
            ],
            created_at=session.created_at.isoformat() if session.created_at else datetime.now(timezone.utc).isoformat()
        )

    except Exception as e:
        db.rollback()
        logger.error(f"[SUBMIT] ✗ Error saving screening: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save screening: {str(e)}"
        )


# ============================================
# GET /screening/sessions (optional — for debugging)
# ============================================
@app.get("/screening/sessions", tags=["Screening"])
def list_sessions(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """List recent screening sessions (for debugging/admin)."""
    sessions = db.query(ScreeningSession).order_by(
        ScreeningSession.created_at.desc()
    ).offset(skip).limit(limit).all()

    return [
        {
            "session_id": s.id,
            "child_id": s.child_id,
            "child_name": s.child.name if s.child else "Unknown",
            "wcrs_score": s.wcrs_score,
            "risk_tier": s.risk_tier,
            "risk_label": s.risk_label,
            "age_track": s.age_track,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            "task_count": len(s.task_results)
        }
        for s in sessions
    ]


# ============================================
# GET /screening/session/{id} (optional — detailed view)
# ============================================
@app.get("/screening/session/{session_id}", tags=["Screening"])
def get_session(session_id: int, db: Session = Depends(get_db)):
    """Get detailed screening session by ID."""
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.id,
        "child": {
            "id": session.child.id,
            "name": session.child.name,
            "age": session.child.age,
            "grade": session.child.grade,
            "avatar": session.child.avatar,
            "age_track": session.child.age_track,
            "parent_email": session.child.parent_email
        },
        "wcrs_score": session.wcrs_score,
        "risk_tier": session.risk_tier,
        "risk_label": session.risk_label,
        "age_track": session.age_track,
        "weights_used": session.weights_used,
        "benchmarks_used": session.benchmarks_used,
        "rewards": session.rewards,
        "screening_version": session.screening_version,
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
        "task_results": [
            {
                "id": tr.id,
                "task_type": tr.task_type,
                "task_name": tr.task_name,
                "correct": tr.correct,
                "total": tr.total,
                "time_spent_seconds": tr.time_spent_seconds,
                "normalized_score": tr.normalized_score,
                "risk_flag": tr.risk_flag,
                "details": tr.details
            }
            for tr in session.task_results
        ]
    }
