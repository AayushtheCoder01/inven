"""
Adjustments router – stock add/subtract operations.
Every adjustment automatically updates the parent product's current_qty.
"""

from fastapi import APIRouter, HTTPException
from api.db import get_supabase
from api.models import AdjustmentCreate

router = APIRouter(prefix="/api/adjustments", tags=["Adjustments"])


@router.get("")
def list_adjustments(product_id: str | None = None):
    """Return all adjustments, optionally filtered by product."""
    sb = get_supabase()
    q = sb.table("adjustments").select("*").order("created_at", desc=True)
    if product_id:
        q = q.eq("product_id", product_id)
    res = q.execute()
    return {"data": res.data}


@router.post("", status_code=201)
def create_adjustment(body: AdjustmentCreate):
    """
    Record a stock adjustment and atomically update the product quantity.
    Returns an error if the subtraction would result in negative stock.
    """
    sb = get_supabase()

    # Fetch current product
    prod_res = (
        sb.table("products")
        .select("id, name, sku, current_qty, price, cost")
        .eq("id", body.product_id)
        .single()
        .execute()
    )
    if not prod_res.data:
        raise HTTPException(status_code=404, detail="Product not found")

    product = prod_res.data
    prev_qty: int = product["current_qty"]

    if body.quantity <= 0:
        raise HTTPException(status_code=422, detail="Quantity must be greater than zero")

    if body.type == "subtract" and body.quantity > prev_qty:
        raise HTTPException(
            status_code=422,
            detail=f"Cannot remove {body.quantity} — only {prev_qty} in stock",
        )

    new_qty = prev_qty + body.quantity if body.type == "add" else prev_qty - body.quantity

    # Write adjustment record
    adj_payload = {
        "product_id": product["id"],
        "product_name": product["name"],
        "sku": product["sku"],
        "type": body.type,
        "quantity": body.quantity,
        "previous_qty": prev_qty,
        "new_qty": new_qty,
        "unit_price": product["price"],
        "unit_cost": product["cost"],
        "reason": body.reason,
    }
    adj_res = sb.table("adjustments").insert(adj_payload).execute()

    # Update product stock
    sb.table("products").update({"current_qty": new_qty}).eq("id", product["id"]).execute()

    return {"data": adj_res.data[0], "new_qty": new_qty}
