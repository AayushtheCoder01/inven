"""
Shared Pydantic models that mirror the TypeScript types in src/types.ts.
These are used for request validation and response serialisation.
"""

from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


# ── Product ──────────────────────────────────────────────────────────────────

ProductStatus = Literal["active", "discontinued"]
AdjustmentType = Literal["add", "subtract"]


class ProductBase(BaseModel):
    name: str
    sku: str
    category: str = "General"
    brand: str = "Generic"
    model: str = ""
    supplier: str = "Local Supplier"
    rack_location: str = Field("Main Shelf", alias="rackLocation")
    unit: str = "pcs"
    price: float = 0
    cost: float = 0
    min_stock: int = Field(1, alias="minStock")
    current_qty: int = Field(0, alias="currentQty")
    notes: str = ""
    status: ProductStatus = "active"

    model_config = {"populate_by_name": True}


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class Product(ProductBase):
    id: str
    created_at: str = Field("", alias="createdAt")
    updated_at: str = Field("", alias="updatedAt")


# ── Adjustment ────────────────────────────────────────────────────────────────

class AdjustmentCreate(BaseModel):
    product_id: str = Field(..., alias="productId")
    type: AdjustmentType
    quantity: int
    reason: str = "Manual stock adjustment"

    model_config = {"populate_by_name": True}


class Adjustment(BaseModel):
    id: str
    product_id: str = Field(..., alias="productId")
    product_name: str = Field("", alias="productName")
    sku: str = ""
    type: AdjustmentType
    quantity: int
    previous_qty: int = Field(0, alias="previousQty")
    new_qty: int = Field(0, alias="newQty")
    unit_price: float = Field(0, alias="unitPrice")
    unit_cost: float = Field(0, alias="unitCost")
    reason: str = ""
    created_at: str = Field("", alias="createdAt")

    model_config = {"populate_by_name": True}


# ── Finance ───────────────────────────────────────────────────────────────────

class ProfitCreate(BaseModel):
    date: str           # YYYY-MM-DD
    amount: float
    notes: Optional[str] = ""


class DailyProfit(ProfitCreate):
    id: str
    created_at: str = Field("", alias="createdAt")

    model_config = {"populate_by_name": True}


# ── Settings ──────────────────────────────────────────────────────────────────

class ShopSettings(BaseModel):
    shop_name: str = Field("My Shop", alias="shopName")
    owner_name: str = Field("", alias="ownerName")
    phone: str = ""
    address: str = ""

    model_config = {"populate_by_name": True}
