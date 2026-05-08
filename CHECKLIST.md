# Setup Checklist ✅

Use this checklist to get your development environment running.

---

## Pre-Setup Verification

- [ ] You have access to Supabase dashboard (https://app.supabase.com)
- [ ] You have Node.js installed (`npm --version`)
- [ ] You have Python 3.11+ installed (check: `py --version`)

---

## Phase 1: Configure Supabase Connection

### Step 1.1: Get Your Supabase Credentials
- [ ] Go to https://app.supabase.com
- [ ] Select your project
- [ ] Go to **Settings** → **API**
- [ ] Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy the **Service Role Key** (the long JWT-like key)
  - **⚠️ NOT the anon key** - make sure it says "Service Role Key"

### Step 1.2: Create Environment File
```bash
copy api\.env.example api\.env
```
- [ ] File `api/.env` has been created

### Step 1.3: Add Credentials
- [ ] Open `api/.env` in your editor
- [ ] Paste your Supabase URL as `SUPABASE_URL`
- [ ] Paste your Service Role Key as `SUPABASE_SERVICE_KEY`
- [ ] Save the file
- [ ] **⚠️ DO NOT commit this file to git** (it's in .gitignore)

Example of what it should look like:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

---

## Phase 2: Install Frontend Dependencies (if needed)

- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] Check: `npm list` shows packages installed

---

## Phase 3: Start Development

### Option A: Use Startup Script (EASIEST)
- [ ] Run: `start-dev.bat`
- [ ] Two terminal windows will open
- [ ] Wait for both to show "ready" messages

### Option B: Manual Setup

**Terminal 1 - Backend:**
- [ ] Navigate to project root
- [ ] Run: `./venv/Scripts/python -m uvicorn api.index:app --host 0.0.0.0 --port 8000 --reload`
- [ ] Verify: See "Uvicorn running on http://0.0.0.0:8000"
- [ ] ✅ Backend is ready

**Terminal 2 - Frontend:**
- [ ] Navigate to project root
- [ ] Run: `npm run dev`
- [ ] Verify: See "Local: http://localhost:5173" (or similar port)
- [ ] ✅ Frontend is ready

---

## Phase 4: Access Application

- [ ] Open your browser
- [ ] Go to: **http://localhost:5173**
- [ ] Wait for page to load
- [ ] Check: Products appear on the page
- [ ] Verify: Data comes from Supabase (check in Network tab)

---

## Verification Checklist

### Backend Running?
```bash
# In another terminal, test:
curl http://localhost:8000/api/health
# Should return: {"status":"ok"}
```
- [ ] Health check returns success

### Frontend Running?
- [ ] Can access http://localhost:5173
- [ ] No console errors (check DevTools)

### Data Loading?
- [ ] Products display on inventory page
- [ ] Adjustments show in activity
- [ ] Profits display in finance section
- [ ] Settings can be viewed

### API Communication?
- [ ] DevTools > Network tab shows requests to `/api/*`
- [ ] No CORS errors in console
- [ ] No 404 errors for API routes

---

## Troubleshooting Quick Fixes

### Issue: Backend won't start
```
❌ Error: "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"

✅ Fix:
1. Check api/.env exists
2. Check it has SUPABASE_URL and SUPABASE_SERVICE_KEY
3. Restart the backend
```

### Issue: Backend starts but says "Module not found"
```
❌ Error: "No module named supabase" or similar

✅ Fix:
1. Make sure you're using ./venv/Scripts/python
2. Check venv folder exists
3. Reinstall: ./venv/Scripts/python -m pip install -r api/requirements.txt
```

### Issue: Frontend can't reach backend
```
❌ Error: "Failed to fetch" or "API error"

✅ Fix:
1. Verify backend is running on port 8000
2. Test: curl http://localhost:8000/api/health
3. Check that Supabase credentials are correct
4. Restart frontend: Stop npm and run npm run dev again
```

### Issue: Products not loading or list is empty
```
❌ Page loads but no products shown

✅ Check:
1. Backend terminal: any error messages?
2. Browser DevTools > Network: what's the API response?
3. Supabase dashboard: do you have products in the database?
4. Api/.env: are credentials correct?
```

### Issue: CORS error in browser console
```
❌ Error: "Access to XMLHttpRequest blocked by CORS"

✅ Fix:
This shouldn't happen! The Vite proxy handles it.
1. Make sure both servers are running
2. Restart both servers
3. Hard refresh browser (Ctrl+Shift+R)
```

---

## Daily Development Workflow

Every time you start development:

1. [ ] Open two terminals (or use `start-dev.bat`)
2. [ ] Terminal 1: Start backend with `./venv/Scripts/python -m uvicorn api.index:app --port 8000 --reload`
3. [ ] Terminal 2: Start frontend with `npm run dev`
4. [ ] Open http://localhost:5173
5. [ ] Start coding! 💻

To stop:
- [ ] Press Ctrl+C in both terminals
- [ ] Close terminals

---

## Important Files & Locations

| File/Folder | Purpose | Status |
|---|---|---|
| `api/.env` | **MUST CREATE** - Supabase credentials | ⚠️ Create yourself |
| `api/.env.example` | Template for `.env` | ✅ Created |
| `venv/` | Python environment with dependencies | ✅ Ready |
| `src/lib/api.ts` | Frontend API client | ✅ Configured |
| `vite.config.ts` | Frontend proxy config | ✅ Configured |
| `api/index.py` | Backend entry point | ✅ Ready |
| `QUICK_START.md` | Quick reference guide | ✅ Available |
| `BACKEND_SETUP.md` | Detailed setup guide | ✅ Available |
| `ARCHITECTURE.md` | System architecture | ✅ Available |

---

## Quick Commands Reference

```bash
# Start backend
./venv/Scripts/python -m uvicorn api.index:app --port 8000 --reload

# Start frontend
npm run dev

# One-click startup
start-dev.bat

# Test backend health
curl http://localhost:8000/api/health

# Install frontend deps
npm install

# Build for production
npm run build

# Install backend deps (if needed)
./venv/Scripts/python -m pip install -r api/requirements.txt
```

---

## Success Indicators

✅ You'll know everything is working when:

1. Backend terminal shows: `Uvicorn running on http://0.0.0.0:8000`
2. Frontend terminal shows: `Local: http://localhost:5173`
3. Browser shows your app with data loaded
4. No errors in browser console
5. No errors in backend terminal
6. Product list shows items from Supabase

---

## Next Steps After Setup

Once everything is running:

1. **Make changes** to your code (frontend or backend)
2. **Frontend changes** auto-reload (Vite HMR)
3. **Backend changes** auto-reload (uvicorn --reload)
4. **Test your changes** in the browser
5. **Check browser console** for errors
6. **Check backend terminal** for API errors

---

## Getting Help

If something doesn't work:

1. Read the relevant documentation:
   - **Quick setup?** → `QUICK_START.md`
   - **Detailed guide?** → `BACKEND_SETUP.md`
   - **Architecture?** → `ARCHITECTURE.md`
   - **What was fixed?** → `FIXES_APPLIED.md`

2. Check the error messages:
   - Backend terminal: Any Python errors?
   - Frontend terminal: Any build errors?
   - Browser console: JavaScript errors?
   - Network tab: API request failures?

3. Common issues section above

4. If still stuck: You might need to:
   - Restart both servers
   - Hard refresh browser (Ctrl+Shift+R)
   - Clear browser cache
   - Delete `node_modules` and reinstall (`npm install`)

---

## Final Notes

- 🔐 Never commit `api/.env` to git
- 📝 Keep your Supabase credentials safe
- 🔄 Always run both servers together
- 💾 Save often while developing
- 🧹 Clean up before committing code

---

**You're ready! 🚀 Start with step 1 above.**
