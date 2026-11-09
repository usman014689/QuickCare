# QuickCare

Blood donation web app for **B9IS130 – Web Development for Information Systems**.

Donors register as volunteers; people who need blood can search by blood group (and location) and contact a compatible donor.

## Stack (MERN)

| Layer | Technology |
|-------|------------|
| Front end | React (Vite) |
| Back end | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| External API | OpenStreetMap Nominatim geocoding (server proxy) |

## Repository

- `client/` — React SPA  
- `server/` — models, routes, controllers, middleware, utils  
- `server.js` — Express entry  
- `scripts/createAdmin.js` — bootstrap an admin user  
- `.env.example` — required environment variables  

## Phased plan

| Phase | Focus | Status |
|-------|--------|--------|
| **0** | Align repo, README, env example | Done |
| **1** | QuickCare app shell | Done |
| **2** | Models, auth, CRUD, match API | Done |
| **3** | Frontend wired to API | Done |
| **4** | Geocoding, validation, security hardening | Done |
| **5** | Cloud deploy + polish | In progress (configs added — see DEPLOY.md) |
| **6** | Technical report + presentation | Planned |

## Local setup

```bash
# 1) API env
cp .env.example .env
# Set MONGODB_URI, JWT_SECRET, CLIENT_URL=http://localhost:5173

# 2) API
npm install
npm run server

# 3) Optional admin user
npm run create-admin
# default: admin@quickcare.local / admin123

# 4) Client (separate terminal)
cd client
cp .env.example .env   # optional; defaults to http://localhost:5000
npm install
npm run dev
```

Atlas: allow your current IP under Network Access.

## Main API routes

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Donors | `GET/POST /api/donors`, `GET /api/donors/me`, `PUT /api/donors/:id` |
| Requests | `GET/POST /api/requests`, `GET /api/requests/me`, `PATCH /api/requests/:id` |
| Match | `GET /api/match/donors`, `GET /api/match/requests` |
| Geo | `GET /api/geo/search?q=` (JWT required) |
| Admin | `/api/admin/*` (admin role) |

## Security notes

- Passwords hashed with bcrypt  
- JWT on protected routes; role checks on server  
- Request validation middleware on auth/donor/request bodies  
- Donor/seeker contact hidden from anonymous users  
- CORS limited to `CLIENT_URL`  
- Secrets only in `.env` (never commit)

## Deployment (Phase 5)

Production target: **Vercel** (client) + **Render** (API) + **MongoDB Atlas** (DB). Both hosts
connect to this GitHub repo and auto-deploy on push to `main`.

See **[DEPLOY.md](./DEPLOY.md)** for the full step-by-step guide (env vars, CORS, smoke test).

Quick env map:

| Where | Var | Value |
|-------|-----|-------|
| Render (API) | `MONGODB_URI` | Atlas connection string |
| Render (API) | `JWT_SECRET` | strong random string |
| Render (API) | `CLIENT_URL` | your Vercel URL |
| Vercel (client) | `VITE_API_URL` | your Render API URL |

## Submission targets

1. GitHub repo with meaningful history  
2. Deployed public URL  
3. Technical report (≥2000 words, Harvard)  
4. In-class demo (10–15 min)  
