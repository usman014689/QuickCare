# QuickCare

Blood donation web app for **B9IS130 – Web Development for Information Systems**.

Donors register as volunteers; people who need blood can search by blood group (and location) and contact a compatible donor.

## Stack (MERN)

| Layer | Technology |
|-------|------------|
| Front end | React (Vite) |
| Back end | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt (Phase 2) |
| External API | OpenStreetMap Nominatim geocoding (Phase 4) |

## Repository

- `client/` — React SPA  
- `server.js` — Express API entry (will grow into layered folders)  
- `.env.example` — required environment variables  

## Phased plan

| Phase | Focus | Status |
|-------|--------|--------|
| **0** | Align repo, README, env example | Done |
| **1** | QuickCare app shell (replace Vite boilerplate) | Done |
| **2** | Models, auth, donor/request CRUD, match API | In progress (2a models) |
| **3** | Frontend wired to API | Planned |
| **4** | Geocoding, validation, security hardening | Planned |
| **5** | Cloud deploy + polish | Planned |
| **6** | Technical report + presentation | Planned |

Work is done slowly — one sub-step at a time, with commits pushed to GitHub.

## Local setup

```bash
# API
cp .env.example .env   # set MONGODB_URI
npm install
npm run server

# Client (separate terminal)
cd client
npm install
npm run dev
```

## Submission targets

1. GitHub repo with meaningful history  
2. Deployed public URL  
3. Technical report (≥2000 words, Harvard)  
4. In-class demo (10–15 min)  
