from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import supabase
from app.config import settings
import jwt, datetime

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

ADMIN_EMAIL = "admin@academy.lk"
ADMIN_PASSWORD = "admin123"

def create_token(data: dict):
    payload = {**data, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

@router.post("/login")
def login(req: LoginRequest):
    if req.email == ADMIN_EMAIL and req.password == ADMIN_PASSWORD:
        token = create_token({"email": req.email, "role": "admin"})
        return {"token": token, "role": "admin"}
    
    res = supabase.table("coaches").select("*").eq("email", req.email).execute()
    if res.data and req.password == "coach123":
        coach = res.data[0]
        token = create_token({"email": req.email, "role": "coach", "coach_id": coach["id"]})
        return {"token": token, "role": "coach", "coach": coach}
    
    raise HTTPException(status_code=401, detail="Invalid credentials")