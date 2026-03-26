from fastapi import APIRouter
from pydantic import BaseModel
from app.database import supabase
from typing import Optional

router = APIRouter()

class KidCreate(BaseModel):
    name: str
    date_of_birth: Optional[str] = None
    age_group: str
    parent_name: Optional[str] = None
    parent_contact: Optional[str] = None

@router.get("/")
def get_kids():
    res = supabase.table("kids").select("*").eq("is_active", True).execute()
    return res.data

@router.get("/age-group/{age_group}")
def get_kids_by_age_group(age_group: str):
    res = supabase.table("kids").select("*").eq("age_group", age_group).eq("is_active", True).execute()
    return res.data

@router.post("/")
def create_kid(kid: KidCreate):
    res = supabase.table("kids").insert(kid.dict()).execute()
    return res.data[0]

@router.put("/{kid_id}")
def update_kid(kid_id: str, kid: KidCreate):
    res = supabase.table("kids").update(kid.dict()).eq("id", kid_id).execute()
    return res.data[0]

@router.delete("/{kid_id}")
def delete_kid(kid_id: str):
    supabase.table("kids").update({"is_active": False}).eq("id", kid_id).execute()
    return {"message": "Kid deactivated"}