from fastapi import APIRouter
from app.database import supabase

router = APIRouter()

@router.get("/{coach_id}")
def get_notifications(coach_id: str):
    res = supabase.table("notifications").select("*").eq("coach_id", coach_id).order("created_at", desc=True).execute()
    return res.data

@router.put("/{notification_id}/read")
def mark_as_read(notification_id: str):
    supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
    return {"message": "Marked as read"}