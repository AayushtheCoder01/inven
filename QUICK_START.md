# Quick Start - Localhost Development

## TL;DR - Just Want to Run It?

### One-Time Setup
```bash
# 1. Create .env file with your Supabase credentials
copy api\.env.example api\.env
# Now edit api\.env and add:
#   SUPABASE_URL=https://...
#   SUPABASE_SERVICE_KEY=...

# 2. Install frontend dependencies (if not already done)
npm install
```

### Every Time You Want to Develop
```bash
# Option A: Use the startup script (easiest)
start-dev.bat

# Option B: Manually open 2 terminals and run these commands:

# Terminal 1 - Backend
./venv/Scripts/python -m uvicorn api.index:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## Why You're Having Issues

### ❌ The Problem
- The **production** version uses Supabase directly (works fine)
- The **localhost** version needs to go through your local backend API (which wasn't running before)

### ✅ The Solution
Now that the backend is running, the architecture is:

```
Your Browser (localhost:5173)
     ↓
Vite Dev Server (proxies /api requests)
     ↓
FastAPI Backend (localhost:8000) 
     ↓
Supabase Database
```

The key is that **BOTH servers must be running**:
- **Frontend**: `npm run dev` on port 5173
- **Backend**: `uvicorn` on port 8000

---

## Troubleshooting

### ❌ "Failed to fetch" or "Cannot connect to backend"
Check:
1. Is the backend running? (Terminal 1 should show "Uvicorn running on...")
2. Does `api/.env` exist and have your Supabase credentials?
3. Is the backend listening on port 8000?

### ❌ "CORS error"
This shouldn't happen because Vite proxies all `/api` requests, so there's no cross-origin issue.

### ❌ "Empty product list" or "Loading forever"
1. Check browser DevTools > Network tab - do you see API requests?
2. Check backend terminal - are there error messages?
3. Do you have data in Supabase?

### ❌ Backend fails to start with "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
You forgot to create the `api/.env` file. Do this:
```bash
copy api\.env.example api\.env
# Then edit api\.env with your credentials
```

---

## File Structure

```
inventory-management-system/
├── api/                          # Python FastAPI backend
│   ├── .env                      # ← CREATE THIS with your Supabase creds
│   ├── .env.example              # ← Copy this to .env
│   ├── index.py                  # Main app
│   ├── db.py                     # Supabase client
│   ├── models.py                 # Request/response models
│   ├── routes/
│   │   ├── products.py
│   │   ├── adjustments.py
│   │   ├── profits.py
│   │   └── settings.py
│   └── requirements.txt           # Python dependencies
│
├── src/                          # React/TypeScript frontend
│   ├── lib/api.ts                # API client (auto-detects dev mode)
│   ├── context/                  # State management
│   └── pages/                    # Components
│
├── venv/                         # Python virtual environment (3.11)
├── package.json                  # npm config
├── vite.config.ts                # Frontend proxy config
├── start-dev.bat                 # ← One-click development startup
├── BACKEND_SETUP.md              # Detailed setup guide
└── QUICK_START.md                # ← You are here
```

---

## How It Works (Technical Details)

### Frontend Code (`src/lib/api.ts`)
```typescript
const BASE = import.meta.env.DEV
  ? "http://localhost:8000/api"
  : "/api";
```

In **development mode** (npm run dev): Uses `http://localhost:8000/api` directly
In **production** (built with npm run build): Uses `/api`

### Vite Proxy (`vite.config.ts`)
```typescript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
    },
  },
}
```

Alternatively, the frontend could just use `/api` and let Vite proxy it. But the current setup is fine.

### Backend (`api/index.py`)
FastAPI app with CORS enabled (allows requests from any origin during dev).
Routes mounted with `/api` prefix, so:
- `GET /api/products` → list products
- `POST /api/products` → create product
- etc.

---

## Next Steps

1. ✅ Backend is installed and can run
2. 👉 Create `api/.env` with your Supabase credentials
3. 👉 Run `start-dev.bat` or manually start both servers
4. 👉 Visit http://localhost:5173
5. 👉 You should see your Supabase data loaded!

Good luck! 🚀
