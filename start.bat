@echo off
echo Installing Python packages...
py -3.11 -m pip install fastapi==0.111.0 "supabase==2.4.6" python-dotenv pydantic==2.7.1 uvicorn==0.29.0

echo Starting Python backend...
start "Backend" cmd /k "cd /d c:\Users\PC\Desktop\inventory-management-system && py -3.11 -m uvicorn api.index:app --reload --port 8000"

echo Starting Frontend...
start "Frontend" cmd /k "cd /d c:\Users\PC\Desktop\inventory-management-system && npm run dev"

echo Both servers are starting. Open http://localhost:5173 in your browser.
pause
