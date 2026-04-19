"""
Main FastAPI application.
Vercel discovers this file via vercel.json and serves it as a serverless function.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import products, adjustments, profits, settings

app = FastAPI(
    title="Sitamarhi Sound Stock — API",
    description="Inventory & Finance backend powered by FastAPI + Supabase",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# In production replace "*" with your Vercel frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(products.router)
app.include_router(adjustments.router)
app.include_router(profits.router)
app.include_router(settings.router)


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
