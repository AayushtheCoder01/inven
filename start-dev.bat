@echo off
REM Start both backend and frontend in development mode

echo Starting Inventory Management System - Development Mode
echo.
echo This script will open 2 terminal windows:
echo 1. Backend (FastAPI) on http://localhost:8000
echo 2. Frontend (Vite) on http://localhost:5173
echo.
echo Make sure you have:
echo - Created api\.env with your Supabase credentials
echo - Run: copy api\.env.example api\.env
echo - Then edit api\.env and add your SUPABASE_URL and SUPABASE_SERVICE_KEY
echo.
pause

REM Start backend in a new window
echo Starting backend server on port 8000...
start cmd /k "title Backend Server && venv\Scripts\python -m uvicorn api.index:app --host 0.0.0.0 --port 8000 --reload"

REM Wait a moment for backend to start
timeout /t 2

REM Start frontend in a new window
echo Starting frontend dev server on port 5173...
start cmd /k "title Frontend Dev Server && npm run dev"

echo.
echo Both servers are starting. Check the terminal windows for details.
echo Once both show "ready" messages, open: http://localhost:5173
