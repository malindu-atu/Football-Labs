from fastapi import APIRouter
from pydantic import BaseModel
from app.database import supabase
from typing import Optional, List
from datetime import date, timedelta

router = APIRouter()

DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

class TemplateCreate(BaseModel):
    location_id: str
    day_of_week: str
    start_time: str
    end_time: str
    age_group: str
    coach_id: Optional[str] = None

class TemplateUpdate(BaseModel):
    coach_id: Optional[str] = None
    day_of_week: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    age_group: Optional[str] = None

class EnrollmentUpdate(BaseModel):
    kid_ids: List[str]

# ── Templates ──────────────────────────────────────────────────────────────

@router.get("/templates")
def get_templates():
    res = supabase.table("session_templates").select(
        "*, coaches(*), locations(*), session_enrollments(*, kids(*))"
    ).eq("is_active", True).execute()
    return res.data

@router.post("/templates")
def create_template(t: TemplateCreate):
    res = supabase.table("session_templates").insert(t.dict()).execute()
    if t.coach_id:
        supabase.table("notifications").insert({
            "coach_id": t.coach_id,
            "message": f"You have been assigned a recurring {t.age_group} session every {t.day_of_week} at {t.start_time}",
            "type": "assignment"
        }).execute()
    return res.data[0]

@router.put("/templates/{template_id}")
def update_template(template_id: str, t: TemplateUpdate):
    update_data = {k: v for k, v in t.dict().items() if v is not None}
    res = supabase.table("session_templates").update(update_data).eq("id", template_id).execute()
    return res.data[0]

@router.delete("/templates/{template_id}")
def delete_template(template_id: str):
    supabase.table("session_templates").update({"is_active": False}).eq("id", template_id).execute()
    return {"message": "Template removed"}

@router.put("/templates/{template_id}/enrollments")
def update_enrollments(template_id: str, data: EnrollmentUpdate):
    supabase.table("session_enrollments").delete().eq("template_id", template_id).execute()
    if data.kid_ids:
        records = [{"template_id": template_id, "kid_id": kid_id} for kid_id in data.kid_ids]
        supabase.table("session_enrollments").insert(records).execute()
    return {"message": "Enrollments updated"}

# ── Weekly generation ──────────────────────────────────────────────────────

@router.post("/generate-week")
def generate_week_sessions():
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    templates_res = supabase.table("session_templates").select("*").eq("is_active", True).execute()
    created = []
    for t in templates_res.data:
        day_offset = DAYS.index(t["day_of_week"])
        session_date = (monday + timedelta(days=day_offset)).isoformat()
        existing = supabase.table("sessions").select("id") \
            .eq("template_id", t["id"]).eq("date", session_date).execute()
        if existing.data:
            continue
        res = supabase.table("sessions").insert({
            "template_id": t["id"],
            "date": session_date,
            "start_time": t["start_time"],
            "end_time": t["end_time"],
            "location_id": t["location_id"],
            "age_group": t["age_group"],
            "coach_id": t["coach_id"],
            "status": "scheduled",
        }).execute()
        created.append(res.data[0])
    return {"message": f"Generated {len(created)} sessions", "sessions": created}

@router.get("/this-week")
def get_this_week_sessions():
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    res = supabase.table("sessions").select(
        "*, coaches(*), locations(*), session_templates(*, session_enrollments(*, kids(*)))"
    ).gte("date", monday.isoformat()).lte("date", sunday.isoformat()).execute()
    return res.data

# ── Standard endpoints ─────────────────────────────────────────────────────

@router.get("/")
def get_sessions():
    res = supabase.table("sessions").select("*, coaches(*), locations(*)").execute()
    return res.data

@router.get("/unassigned")
def get_unassigned_sessions():
    res = supabase.table("sessions").select("*, locations(*)").is_("coach_id", "null").execute()
    return res.data