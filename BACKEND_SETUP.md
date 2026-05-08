# Backend Setup Guide

## Problem & Solution

The backend is now working, but you need to configure the Supabase connection and run both the frontend and backend simultaneously for the localhost development environment.

## ✅ What's Been Fixed

1. **Installed Python dependencies** - All required packages are now in the `venv` virtual environment with Python 3.11
2. **Backend is running on port 8000** - FastAPI server is ready to handle requests

## 🔧 Setup Steps

### Step 1: Configure Supabase Credentials

1. Copy the `.env.example` file in the `api` folder to create a `.env` file:
   ```bash
   copy api\.env.example api\.env
   ```

2. Edit `api/.env` and add your Supabase credentials:
   - Go to https://app.supabase.com
   - Select your project
   - Go to **Settings > API**
   - Copy the **Project URL** and paste it as `SUPABASE_URL`
   - Copy the **Service Role Key** (NOT the anon key) and paste it as `SUPABASE_SERVICE_KEY`

Example `.env` file:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Run the Backend

In one terminal, run:
```bash
./venv/Scripts/python -m uvicorn api.index:app --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Started server process
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Run the Frontend

In a **second terminal**, run:
```bash
npm run dev
```

The Vite dev server will start on `http://localhost:5173` (or similar).

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

The frontend will automatically proxy API requests to `http://localhost:8000/api` via the Vite proxy configuration.

## 🔍 Architecture

```
Browser (http://localhost:5173)
    ↓
Vite Dev Server (http://localhost:5173)
    ↓ [proxies /api requests]
FastAPI Backend (http://localhost:8000)
    ↓
Supabase Database
```

## 📝 Notes

- **Production**: On Vercel, the frontend directly calls `/api/*` which is routed to the serverless Python function at `api/index.py`
- **Development**: The Vite proxy in `vite.config.ts` forwards `/api` requests to the local backend on port 8000
- **Frontend Code**: The `src/lib/api.ts` file automatically detects dev mode and uses `http://localhost:8000/api`

## ✔️ Testing the Connection

Once both servers are running, you should see:
1. Products loading on the inventory page
2. No CORS errors in the browser console
3. Network requests going to `http://localhost:5173/api/*` (which proxy to the backend)

If you see errors like "Failed to fetch" or "CORS error", check:
- Both servers are running
- `.env` file has correct Supabase credentials
- Backend shows no errors when processing requests
