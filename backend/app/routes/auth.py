from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import supabase
import jwt
from typing import Optional

router = APIRouter()

class MeRequest(BaseModel):
    access_token: str

class CreateUserRequest(BaseModel):
    access_token: str        # admin's JWT for auth check
    email: str
    password: str
    first_name: str
    last_name: str
    role: str                # "admin" or "coach"
    coach_id: Optional[str] = None  # link to coaches table if role=coach

@router.post("/me")
def get_me(req: MeRequest):
    try:
        payload = jwt.decode(req.access_token, options={"verify_signature": False})
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    profile_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not profile_res.data:
        raise HTTPException(status_code=403, detail="No profile found. Contact admin.")

    profile = profile_res.data[0]
    role = profile.get("role")

    if role == "admin":
        return {"role": "admin", "email": email, "profile": profile}

    if role == "coach":
        coach = None
        if profile.get("coach_id"):
            coach_res = supabase.table("coaches").select("*").eq("id", profile["coach_id"]).execute()
            coach = coach_res.data[0] if coach_res.data else None
        return {"role": "coach", "email": email, "profile": profile, "coach": coach}

    raise HTTPException(status_code=403, detail="Unknown role")


@router.post("/create-user")
def create_user(req: CreateUserRequest):
    # 1. Verify requester is an admin
    try:
        payload = jwt.decode(req.access_token, options={"verify_signature": False})
        requester_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    profile_res = supabase.table("profiles").select("role").eq("id", requester_id).execute()
    if not profile_res.data or profile_res.data[0]["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    # 2. Validate role
    if req.role not in ("admin", "coach"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'coach'")

    # 3. Create auth user — trigger auto-creates the profile row
    try:
        user = supabase.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
            "user_metadata": {
                "first_name": req.first_name,
                "last_name": req.last_name,
                "role": req.role,
            }
        })
        new_user_id = user.user.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 4. If coach_id provided, link profile to coaches table
    if req.coach_id:
        supabase.table("profiles").update({
            "coach_id": req.coach_id
        }).eq("id", new_user_id).execute()

    return {
        "message": "User created successfully",
        "user_id": new_user_id,
        "email": req.email,
        "role": req.role
    }