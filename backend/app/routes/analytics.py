from fastapi import APIRouter
from app.database import supabase

router = APIRouter()

@router.get("/student/{kid_id}")
def student_analytics(kid_id: str):
    attendance = supabase.table("attendance").select("*, sessions(*)").eq("kid_id", kid_id).execute()
    records = attendance.data
    total = len(records)
    present = len([r for r in records if r["status"] == "present"])
    rate = round((present / total) * 100, 1) if total > 0 else 0
    return {"total_sessions": total, "present": present, "attendance_rate": rate, "records": records}

@router.get("/coach/{coach_id}")
def coach_analytics(coach_id: str):
    sessions = supabase.table("sessions").select("*").eq("coach_id", coach_id).execute()
    total = len(sessions.data)
    completed = len([s for s in sessions.data if s["status"] == "completed"])
    return {"total_assigned": total, "completed": completed, "sessions": sessions.data}

@router.get("/overview")
def overview_analytics():
    sessions = supabase.table("sessions").select("*").execute()
    kids = supabase.table("kids").select("*").eq("is_active", True).execute()
    coaches = supabase.table("coaches").select("*").eq("is_active", True).execute()
    attendance = supabase.table("attendance").select("*").execute()
    total_att = len(attendance.data)
    present = len([a for a in attendance.data if a["status"] == "present"])
    return {
        "total_sessions": len(sessions.data),
        "total_kids": len(kids.data),
        "total_coaches": len(coaches.data),
        "overall_attendance_rate": round((present / total_att) * 100, 1) if total_att > 0 else 0
    }

@router.get("/age-group")
def age_group_analytics():
    kids = supabase.table("kids").select("age_group").eq("is_active", True).execute()
    groups = {}
    for k in kids.data:
        g = k["age_group"]
        groups[g] = groups.get(g, 0) + 1
    return groups