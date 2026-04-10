from fastapi import APIRouter
from pydantic import BaseModel
from app.database import supabase
from typing import Optional

router = APIRouter()

class LocationCreate(BaseModel):
    name: str
    address: Optional[str] = None

@router.get("/")
def get_locations():
    res = supabase.table("locations").select(
        "*, session_templates(*, coaches(*), session_enrollments(kid_id))"
    ).eq("is_active", True).execute()
    return res.data

@router.post("/")
def create_location(loc: LocationCreate):
    res = supabase.table("locations").insert(loc.dict()).execute()
    return res.data[0]

@router.delete("/{location_id}")
def delete_location(location_id: str):
    supabase.table("locations").update({"is_active": False}).eq("id", location_id).execute()
    return {"message": "Location removed"}