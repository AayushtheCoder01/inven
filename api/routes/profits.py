"""
Finance router – daily profit records.
"""

from fastapi import APIRouter, HTTPException
from api.db import get_supabase
from api.models import ProfitCreate

router = APIRouter(prefix="/api/profits", tags=["Finance"])


@router.get("")
def list_profits():
    """Return all profit entries, newest date first."""
    sb = get_supabase()
    res = sb.table("profits").select("*").order("date", desc=True).execute()
    return {"data": res.data}


@router.post("", status_code=201)
def create_profit(body: ProfitCreate):
    """Add a new daily profit entry."""
    sb = get_supabase()
    payload = body.model_dump()
    res = sb.table("profits").insert(payload).execute()
    return {"data": res.data[0]}


@router.delete("/{profit_id}", status_code=204)
def delete_profit(profit_id: str):
    """Delete a profit record."""
    sb = get_supabase()
    sb.table("profits").delete().eq("id", profit_id).execute()
    return
