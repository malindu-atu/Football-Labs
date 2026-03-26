from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import supabase
from typing import Optional

router = APIRouter()

class SessionCreate(BaseModel):
    date: str
    start_time: str
    end_time: str
    location_id: str
    age_group: str
    coach_id: Optional[str] = None

@router.get("/")
def get_sessions():
    res = supabase.table("sessions").select("*, coaches(*), locations(*)").execute()
    return res.data

@router.post("/")
def create_session(session: SessionCreate):
    res = supabase.table("sessions").insert(session.dict()).execute()
    if session.coach_id:
        supabase.table("notifications").insert({
            "coach_id": session.coach_id,
            "message": f"You have been assigned a session on {session.date} at {session.start_time}",
            "type": "assignment"
        }).execute()
    return res.data[0]

@router.put("/{session_id}")
def update_session(session_id: str, session: SessionCreate):
    res = supabase.table("sessions").update(session.dict()).eq("id", session_id).execute()
    return res.data[0]

@router.delete("/{session_id}")
def delete_session(session_id: str):
    supabase.table("sessions").update({"status": "cancelled"}).eq("id", session_id).execute()
    return {"message": "Session cancelled"}

@router.get("/unassigned")
def get_unassigned_sessions():
    res = supabase.table("sessions").select("*, locations(*)").is_("coach_id", "null").execute()
    return res.data