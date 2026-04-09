from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.database import supabase
from typing import Optional
import httpx
import base64
import json
import os

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

class KidCreate(BaseModel):
    name: str
    date_of_birth: Optional[str] = None
    age_group: str
    parent_name: Optional[str] = None
    parent_contact: Optional[str] = None
    enrollment_date: Optional[str] = None

class ExtractedStudentData(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    age_group: Optional[str] = None
    parent_name: Optional[str] = None
    parent_contact: Optional[str] = None
    enrollment_date: Optional[str] = None

@router.get("/")
def get_kids():
    res = supabase.table("kids").select("*").eq("is_active", True).execute()
    return res.data

@router.get("/age-group/{age_group}")
def get_kids_by_age_group(age_group: str):
    res = supabase.table("kids").select("*").eq("age_group", age_group).eq("is_active", True).execute()
    return res.data

@router.post("/extract-enrollment")
async def extract_enrollment(file: UploadFile = File(...)):
    """
    Accepts an enrollment document image and uses Groq vision to extract student details.
    """
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured in .env")

    image_bytes = await file.read()
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    content_type = file.content_type or "image/jpeg"
    if content_type not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
        content_type = "image/jpeg"

    prompt = """You are analyzing a football/soccer academy enrollment document.
Extract the following student details from this document and return ONLY valid JSON with these exact keys:
{
  "name": "full name of the student",
  "date_of_birth": "date in YYYY-MM-DD format or null",
  "age_group": "one of U6/U7/U8/U9/U10/U11/U12/U13/U14/U15/U16 based on age, or null",
  "parent_name": "parent or guardian full name or null",
  "parent_contact": "phone number or null",
  "enrollment_date": "date in YYYY-MM-DD format or null"
}

Rules:
- Convert all dates to YYYY-MM-DD format
- If a field is not found, use null
- Infer age_group from date of birth if not explicitly stated
- Return ONLY the JSON object, no explanation or markdown"""

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "max_tokens": 500,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{content_type};base64,{image_b64}"
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt,
                            },
                        ],
                    }
                ],
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Groq API error: {response.text}")

    result = response.json()
    raw_text = result["choices"][0]["message"]["content"].strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        extracted = json.loads(raw_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail=f"Could not parse Groq response: {raw_text}")

    return ExtractedStudentData(**extracted)

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