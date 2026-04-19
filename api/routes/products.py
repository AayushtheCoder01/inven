"""
Products router – CRUD for the `products` table.
"""

from fastapi import APIRouter, HTTPException
from api.db import get_supabase
from api.models import ProductCreate, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("")
def list_products():
    """Return all non-deleted products, newest first."""
    sb = get_supabase()
    res = sb.table("products").select("*").order("created_at", desc=True).execute()
    return {"data": res.data}


@router.get("/{product_id}")
def get_product(product_id: str):
    """Return a single product by ID."""
    sb = get_supabase()
    res = sb.table("products").select("*").eq("id", product_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return res.data


@router.post("", status_code=201)
def create_product(body: ProductCreate):
    """Insert a new product."""
    sb = get_supabase()
    payload = body.model_dump(by_alias=False)
    # Map camelCase frontend fields to snake_case DB columns
    payload["rack_location"] = payload.pop("rack_location", "Main Shelf")
    payload["min_stock"] = payload.pop("min_stock", 1)
    payload["current_qty"] = payload.pop("current_qty", 0)
    res = sb.table("products").insert(payload).execute()
    return {"data": res.data[0]}


@router.put("/{product_id}")
def update_product(product_id: str, body: ProductUpdate):
    """Full update of a product."""
    sb = get_supabase()
    payload = body.model_dump(by_alias=False)
    res = (
        sb.table("products")
        .update(payload)
        .eq("id", product_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"data": res.data[0]}


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str):
    """Permanently delete a product."""
    sb = get_supabase()
    sb.table("products").delete().eq("id", product_id).execute()
    return
