from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import supabase
from typing import Optional
from datetime import date

router = APIRouter()

class PaymentUpsert(BaseModel):
    kid_id: str
    month: str          # format: YYYY-MM
    status: str         # "paid" | "unpaid" | "waived"
    amount: Optional[float] = None
    note: Optional[str] = None

@router.get("/")
def get_payments(month: Optional[str] = None):
    """Get all payment records, optionally filtered by month (YYYY-MM)."""
    query = supabase.table("payments").select("*, kids(name, age_group)")
    if month:
        query = query.eq("month", month)
    res = query.execute()
    return res.data

@router.get("/summary/{month}")
def get_month_summary(month: str):
    """Get payment summary stats for a given month."""
    kids_res = supabase.table("kids").select("id, name, age_group").eq("is_active", True).execute()
    payments_res = supabase.table("payments").select("*").eq("month", month).execute()

    payment_map = {p["kid_id"]: p for p in payments_res.data}
    total = len(kids_res.data)
    paid = sum(1 for k in kids_res.data if payment_map.get(k["id"], {}).get("status") == "paid")
    waived = sum(1 for k in kids_res.data if payment_map.get(k["id"], {}).get("status") == "waived")
    unpaid = total - paid - waived

    return {
        "month": month,
        "total": total,
        "paid": paid,
        "waived": waived,
        "unpaid": unpaid,
        "collection_rate": round((paid / total) * 100, 1) if total > 0 else 0
    }

@router.post("/")
def upsert_payment(data: PaymentUpsert):
    """Create or update a payment record for a student for a given month."""
    existing = supabase.table("payments").select("id") \
        .eq("kid_id", data.kid_id).eq("month", data.month).execute()

    record = {
        "kid_id": data.kid_id,
        "month": data.month,
        "status": data.status,
        "amount": data.amount,
        "note": data.note,
        "updated_at": date.today().isoformat()
    }

    if existing.data:
        res = supabase.table("payments").update(record).eq("id", existing.data[0]["id"]).execute()
    else:
        res = supabase.table("payments").insert(record).execute()

    return res.data[0]

@router.get("/kid/{kid_id}")
def get_kid_payments(kid_id: str):
    """Get full payment history for a single student."""
    res = supabase.table("payments").select("*").eq("kid_id", kid_id).order("month", desc=True).execute()
    return res.data