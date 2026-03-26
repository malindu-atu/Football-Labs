from fastapi import APIRouter
from pydantic import BaseModel
from app.database import supabase
from typing import List, Optional

router = APIRouter()

class AttendanceRecord(BaseModel):
    kid_id: str
    status: str
    notes: Optional[str] = None

class BulkAttendance(BaseModel):
    session_id: str
    records: List[AttendanceRecord]

@router.post("/bulk")
def mark_bulk_attendance(data: BulkAttendance):
    records = [{"session_id": data.session_id, **r.dict()} for r in data.records]
    res = supabase.table("attendance").upsert(records, on_conflict="session_id,kid_id").execute()
    supabase.table("sessions").update({"status": "completed"}).eq("id", data.session_id).execute()
    return {"message": "Attendance marked", "count": len(records)}

@router.get("/session/{session_id}")
def get_session_attendance(session_id: str):
    res = supabase.table("attendance").select("*, kids(*)").eq("session_id", session_id).execute()
    return res.data

@router.get("/kid/{kid_id}")
def get_kid_attendance(kid_id: str):
    res = supabase.table("attendance").select("*, sessions(*)").eq("kid_id", kid_id).execute()
    return res.data