# System Architecture

## Overview

This is a full-stack inventory management system with:
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (frontend + serverless backend)

---

## Development Architecture (Localhost)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                   http://localhost:5173                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│               Vite Dev Server (Port 5173)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React/TypeScript Frontend                                │  │
│  │ - Components, Pages, State Management                    │  │
│  │ - API Client (src/lib/api.ts)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Proxy Configuration (vite.config.ts)                     │  │
│  │ All /api/* requests → http://localhost:8000              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Proxied HTTP Requests
                    /api/products → /products
                             │
┌────────────────────────────▼────────────────────────────────────┐
│           FastAPI Backend Server (Port 8000)                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes:                                                  │  │
│  │  - /api/products (CRUD)                                  │  │
│  │  - /api/adjustments (Stock adjustments)                  │  │
│  │  - /api/profits (Finance tracking)                       │  │
│  │  - /api/settings (Configuration)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Environment Configuration (api/.env)                     │  │
│  │  - SUPABASE_URL                                          │  │
│  │  - SUPABASE_SERVICE_KEY                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Supabase Client Library
                    (Authenticated via Service Key)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Supabase Cloud Database                             │
│                   PostgreSQL Tables:                             │
│                   - products                                     │
│                   - adjustments                                  │
│                   - profits                                      │
│                   - settings                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Production Architecture (Vercel)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                   https://yourdomain.com                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                       HTTPS Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Vercel Edge Network                           │
│                   (Caches static assets)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌───────────────────┬──────────────────┐
        │                   │                  │
   Static Files        API Routes          Assets
        │                   │                  │
        │          /api/*   │                  │
        │                   │                  │
        ▼                   ▼                  ▼
   ┌─────────┐    ┌──────────────────┐   ┌──────────┐
   │ React   │    │ Serverless Fn.   │   │ Images & │
   │ Bundle  │    │ (api/index.py)   │   │ Fonts    │
   │ (HTML/  │    │ FastAPI App      │   │          │
   │ CSS/JS) │    │ + Routes         │   │          │
   └─────────┘    └────────┬─────────┘   └──────────┘
                           │
                    Supabase Client
                   (Service Role Key)
                           │
          ┌────────────────▼────────────────┐
          │   Supabase Cloud Database       │
          │        PostgreSQL               │
          └────────────────────────────────┘
```

---

## Data Flow

### Reading Data (GET Request)

```
1. Browser
   └─> User clicks "Products" page
   
2. Frontend (React)
   └─> useInventory() hook calls refreshAll()
   └─> Calls apiGetProducts()
   
3. API Client (src/lib/api.ts)
   └─> In DEV: fetch('http://localhost:8000/api/products')
   └─> In PROD: fetch('/api/products')
   
4. Dev Server (Vite) or Edge Network (Vercel)
   └─> Proxies request to backend
   
5. Backend (FastAPI)
   └─> @router.get("/products") in routes/products.py
   └─> get_supabase() gets authenticated Supabase client
   └─> sb.table("products").select("*").execute()
   
6. Supabase
   └─> Queries PostgreSQL database
   └─> Returns JSON: { data: [...] }
   
7. Backend Response
   └─> Returns to frontend: { data: [...] }
   
8. Frontend
   └─> normalizeProduct() converts snake_case to camelCase
   └─> Updates React state with setProducts()
   └─> UI re-renders with data
```

### Writing Data (POST Request)

```
1. Browser
   └─> User submits new product form
   
2. Frontend
   └─> Calls addProduct(productDraft)
   └─> Calls apiCreateProduct(draft)
   
3. API Client
   └─> snakeProduct(draft) converts camelCase to snake_case
   └─> fetch('POST', 'http://localhost:8000/api/products')
   └─> body: JSON.stringify(snake_case_product)
   
4. Backend
   └─> @router.post("/products") in routes/products.py
   └─> Validates body with ProductCreate model
   └─> sb.table("products").insert(payload).execute()
   
5. Supabase
   └─> Inserts new row into products table
   └─> Returns inserted record with generated ID and timestamps
   
6. Backend Response
   └─> Returns: { data: { id, name, ... } }
   
7. Frontend
   └─> normalizeProduct() converts response
   └─> setProducts(prev => [created, ...prev])
   └─> UI shows new product at top of list
```

---

## Key Components

### Frontend

```
src/
├── main.tsx
│   └─> ReactDOM.render()
│
├── App.tsx
│   └─> Routes definition (inventory, activity, finance, settings)
│
├── context/
│   └─> InventoryContext.tsx
│       └─> Central state management
│       └─> Hooks: useInventory()
│       └─> Calls to api functions
│
├── lib/
│   ├─> api.ts (API client)
│   │   ├─> request() - Generic fetch wrapper
│   │   ├─> apiGetProducts()
│   │   ├─> apiCreateProduct()
│   │   ├─> apiUpdateProduct()
│   │   ├─> apiDeleteProduct()
│   │   └─> Similar functions for adjustments, profits, settings
│   │
│   ├─> csv.ts - CSV import/export utilities
│   ├─> format.ts - Number/date formatting
│   └─> storage.ts - Local storage helpers
│
├── pages/
│   ├─> InventoryPage.tsx
│   ├─> ActivityPage.tsx
│   ├─> FinancePage.tsx
│   ├─> ProductDetailPage.tsx
│   └─> SettingsPage.tsx
│
└── components/
    ├─> AppShell.tsx (Layout)
    ├─> ProductTable.tsx
    ├─> AdjustmentForm.tsx
    └─> etc...
```

### Backend

```
api/
├── index.py
│   └─> FastAPI app definition
│   └─> CORS middleware
│   └─> Routes registration
│   └─> Health check endpoint
│
├── db.py
│   └─> get_supabase() - Singleton Supabase client
│   └─> Loads SUPABASE_URL and SUPABASE_SERVICE_KEY from .env
│
├── models.py
│   └─> Pydantic models for request/response validation
│   ├─> ProductBase, ProductCreate, Product
│   ├─> AdjustmentCreate, Adjustment
│   ├─> ProfitCreate, DailyProfit
│   └─> ShopSettings
│
├── routes/
│   ├─> products.py
│   │   ├─> GET /api/products - List all
│   │   ├─> GET /api/products/{id} - Get one
│   │   ├─> POST /api/products - Create
│   │   ├─> PUT /api/products/{id} - Update
│   │   └─> DELETE /api/products/{id} - Delete
│   │
│   ├─> adjustments.py
│   │   ├─> GET /api/adjustments - List
│   │   └─> POST /api/adjustments - Create (updates stock)
│   │
│   ├─> profits.py
│   │   ├─> GET /api/profits - List
│   │   ├─> POST /api/profits - Create
│   │   └─> DELETE /api/profits/{id} - Delete
│   │
│   └─> settings.py
│       ├─> GET /api/settings - Get shop settings
│       └─> PUT /api/settings - Update shop settings
│
├── requirements.txt
│   └─> Pinned versions of all dependencies
│
└── .env
    └─> SUPABASE_URL
    └─> SUPABASE_SERVICE_KEY
```

### Configuration Files

```
vite.config.ts
└─> Vite configuration
└─> /api proxy to localhost:8000 in dev

vite.config.d.ts
└─> TypeScript definitions for vite

tsconfig.json
└─> TypeScript configuration

package.json
└─> npm scripts and dependencies

vercel.json
└─> Vercel deployment configuration
└─> Routes /api/* to api/index.py
```

---

## Authentication & Authorization

### Service Key vs Anon Key

- **Service Key** (Backend only)
  - Used in `api/.env`
  - Bypasses Row Level Security (RLS)
  - More powerful, use with caution
  - Good for backend API operations

- **Anon Key** (Frontend only)
  - Used in production frontend
  - Respects Row Level Security (RLS)
  - Limited permissions
  - Safe for client-side usage

### Current Implementation

The app uses:
- **Development**: Backend with Service Key (simpler, faster)
- **Production**: Could use either (currently using Service Key)

For a multi-tenant system, you'd want to:
1. Use Anon Key in frontend
2. Use RLS policies in Supabase
3. Filter queries by user_id

---

## Environment Variables

### `.env` (Backend)

Located in `api/` folder:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### Environment Detection (Frontend)

The frontend automatically detects mode via `import.meta.env.DEV`:
- **Development** (npm run dev): Uses `http://localhost:8000/api`
- **Production** (npm run build): Uses `/api`

---

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT DEFAULT 'General',
  brand TEXT DEFAULT 'Generic',
  model TEXT,
  supplier TEXT DEFAULT 'Local Supplier',
  rack_location TEXT DEFAULT 'Main Shelf',
  unit TEXT DEFAULT 'pcs',
  price DECIMAL(10,2) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  min_stock INTEGER DEFAULT 1,
  current_qty INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Adjustments Table
```sql
CREATE TABLE adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  sku TEXT,
  type TEXT CHECK (type IN ('add', 'subtract')),
  quantity INTEGER NOT NULL,
  previous_qty INTEGER,
  new_qty INTEGER,
  unit_price DECIMAL(10,2),
  unit_cost DECIMAL(10,2),
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Profits Table
```sql
CREATE TABLE profits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  shop_name TEXT DEFAULT 'My Shop',
  owner_name TEXT,
  phone TEXT,
  address TEXT
);
```

---

## Deployment (Vercel)

When you deploy to Vercel:

1. Frontend code is built and deployed to Vercel Edge
2. API code (api/index.py) is converted to serverless function
3. `vercel.json` routes `/api/*` requests to the serverless function
4. Database credentials are stored in Vercel environment variables
5. Everything runs with the same Supabase backend

No local servers needed in production!

---

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|-----------|
| Frontend Server | Vite Dev Server (Port 5173) | Vercel Edge |
| Backend Server | FastAPI local (Port 8000) | Vercel Serverless |
| API Proxy | Vite proxy config | Vercel routing |
| Database | Supabase | Supabase (same) |
| Hot Reload | Yes (Vite HMR) | No |
| Build Step | Implicit (Vite) | npm run build |
| Credentials | .env file | Vercel env vars |
