# Deploying QuickCare (Phase 5)

Production target architecture:

```
Vercel (React client)  ──HTTPS──▶  Render (Express API)  ──▶  MongoDB Atlas
                                      └─ /api/geo → Nominatim (server proxy)
```

We deploy the **API** to Render, the **client** to Vercel, and use **MongoDB Atlas** for the
database. Both hosts connect to this GitHub repo and auto-deploy on every push to `main`.

## Prerequisites

1. **MongoDB Atlas** free M0 cluster. Copy the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/quickcare?retryWrites=true&w=majority`
2. Under **Network Access**, allow `0.0.0.0/0` (or Render's egress IPs) so the deployed API
   can reach the database.
3. A strong `JWT_SECRET` — generate one with `openssl rand -hex 32`.

## 5a — Deploy the API to Render

`render.yaml` (repo root) is a Render Blueprint.

1. On Render: **New → Blueprint**, connect `usman014689/QuickCare`.
2. Render detects `render.yaml` and creates the `quickcare-api` web service.
3. In the service **Environment** tab, set these (secret — never in the file/repo):
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = strong random string
   - `CLIENT_URL` = your Vercel client URL (set it after step 5b; you can update it later)
   - `NODE_ENV` = `production` (already provided by the blueprint)
4. Deploy. Confirm `https://quickcare-api.onrender.com/health` returns
   `{"status":"ok","app":"quickcare","db":"connected"}`.

> Render's free plan sleeps after ~15 min idle; the first request after sleep takes ~30–60s.

## 5b — Deploy the client to Vercel

`client/vercel.json` configures the Vite SPA build with a catch-all rewrite so react-router
routes work on direct navigation/refresh.

1. On Vercel: **Add New → Project**, import `usman014689/QuickCare`.
2. **Root Directory** = `client`.
3. Framework Preset = **Vite** (auto-detected from `client/vercel.json`).
4. **Environment Variables**: `VITE_API_URL` = your Render API URL
   (e.g. `https://quickcare-api.onrender.com`) — this is baked into the build, so set it before
   the first deploy.
5. Deploy. Vercel gives you `https://quickcare-xxxx.vercel.app`.

## 5c — Wire the two together (CORS)

1. Back on Render, set `CLIENT_URL` = your Vercel URL, then **Manual Deploy → Clear build cache & deploy**.
2. The API's CORS now allows only your Vercel client.

## Create an admin user in production

Run the bootstrap script against the **production** Atlas database — either from your machine
with a temporary `.env` pointing at the prod Atlas URI, or via the Render service **Shell**:

```bash
# locally (temporarily point the script at the prod Atlas URI):
MONGODB_URI=<prod-atlas-uri> ADMIN_EMAIL=admin@quickcare.local ADMIN_PASSWORD=<strong> npm run create-admin

# or, inside the Render service Shell:
ADMIN_EMAIL=admin@quickcare.local ADMIN_PASSWORD=<strong> npm run create-admin
```

## Live smoke test (run off campus Wi-Fi)

- [ ] Register a **donor** (pick blood group + city) → donor dashboard loads
- [ ] Register a **seeker** (separate browser/incognito) → create an urgent request
- [ ] Seeker searches donors by blood group → a compatible donor appears
- [ ] Donor sees the matching open request
- [ ] Log in as admin → overview + moderation works
- [ ] Direct navigation to `/login` on the Vercel URL loads (SPA routing works)

## Alternatives

- **Railway** instead of Render: create a Node service from the repo, root = `.`,
  build = `npm install`, start = `npm run server`, same env vars. (`render.yaml` is not used.)
- **Netlify** instead of Vercel: root = `client`, build = `npm run build`, publish dir = `dist`,
  add `client/public/_redirects` with the line `/*  /index.html  200`. Set `VITE_API_URL`.

## Reminders

- Never commit `.env`. Secrets live only in the hosting dashboards / Atlas.
- Keep `docs/` local (it is gitignored — briefs and the private plan stay out of the repo).
