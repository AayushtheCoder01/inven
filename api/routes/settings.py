"""
Settings router – single-row shop settings stored in the `settings` table.
"""

from fastapi import APIRouter
from api.db import get_supabase
from api.models import ShopSettings

router = APIRouter(prefix="/api/settings", tags=["Settings"])

SETTINGS_ROW_ID = "singleton"   # We only ever keep one row


@router.get("")
def get_settings():
    """Return current shop settings (or defaults if none saved yet)."""
    sb = get_supabase()
    res = sb.table("settings").select("*").eq("id", SETTINGS_ROW_ID).execute()
    if res.data:
        return res.data[0]
    # Return sensible defaults if row doesn't exist yet
    return {"shopName": "My Shop", "ownerName": "", "phone": "", "address": ""}


@router.put("")
def upsert_settings(body: ShopSettings):
    """Create or update the singleton settings row."""
    sb = get_supabase()
    payload = {
        "id": SETTINGS_ROW_ID,
        **body.model_dump(by_alias=True),
    }
    res = sb.table("settings").upsert(payload).execute()
    return {"data": res.data[0]}
