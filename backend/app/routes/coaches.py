from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import supabase
from typing import Optional, List

router = APIRouter()

class CoachCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    age_groups: Optional[List[str]] = []

class AvailabilityCreate(BaseModel):
    coach_id: str
    date: str
    start_time: str
    end_time: str

@router.get("/")
def get_coaches():
    res = supabase.table("coaches").select("*").eq("is_active", True).execute()
    return res.data

@router.post("/")
def create_coach(coach: CoachCreate):
    res = supabase.table("coaches").insert(coach.dict()).execute()
    return res.data[0]

@router.put("/{coach_id}")
def update_coach(coach_id: str, coach: CoachCreate):
    res = supabase.table("coaches").update(coach.dict()).eq("id", coach_id).execute()
    return res.data[0]

@router.delete("/{coach_id}")
def delete_coach(coach_id: str):
    supabase.table("coaches").update({"is_active": False}).eq("id", coach_id).execute()
    return {"message": "Coach deactivated"}

@router.post("/availability")
def add_availability(avail: AvailabilityCreate):
    res = supabase.table("availability").insert(avail.dict()).execute()
    return res.data[0]

@router.get("/availability/{coach_id}")
def get_availability(coach_id: str):
    res = supabase.table("availability").select("*").eq("coach_id", coach_id).execute()
    return res.data