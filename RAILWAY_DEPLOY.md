# Railway Deployment Guide for RevOps

## Why it was blank
The app was built for Emergent's environment and had 3 critical issues:
1. `REACT_APP_BACKEND_URL` was hardcoded to an Emergent preview URL
2. `emergent-main.js` in `index.html` crashed when loaded outside Emergent
3. `MONGO_URL` pointed to `localhost` which doesn't exist on Railway

All three are now fixed. Follow the steps below to deploy.

---

## Step 1: Deploy the Backend Service

1. Create a new Railway service → **"Deploy from GitHub repo"** → point to your repo
2. Set the **Root Directory** to `/backend`
3. Add these **Environment Variables** in Railway dashboard:

| Variable | Value |
|---|---|
| `MONGO_URL` | Your MongoDB connection string (see Step 2) |
| `DB_NAME` | `revops_garage` |
| `JWT_SECRET` | Any long random string (e.g. generate with `openssl rand -hex 32`) |
| `CORS_ORIGINS` | `*` (or your frontend URL once deployed) |

4. Railway will auto-detect Python and run `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Note the backend URL it assigns (e.g. `https://revops-backend.up.railway.app`)

---

## Step 2: Add MongoDB

**Option A — Railway MongoDB Plugin (easiest):**
1. In your Railway project, click **+ New** → **Database** → **MongoDB**
2. Railway auto-injects `MONGO_URL` into your backend service — no manual config needed

**Option B — MongoDB Atlas:**
1. Create a free cluster at mongodb.com/atlas
2. Whitelist `0.0.0.0/0` in Network Access
3. Copy the connection string and set it as `MONGO_URL` in your backend service

---

## Step 3: Deploy the Frontend Service

1. Create another Railway service from the same repo
2. Set the **Root Directory** to `/frontend`
3. Add this **Environment Variable**:

| Variable | Value |
|---|---|
| `REACT_APP_BACKEND_URL` | Your backend URL from Step 1 (e.g. `https://revops-backend.up.railway.app`) |

> ⚠️ **Important**: This variable must be set BEFORE the build runs, because React bakes it into the bundle at build time. If you change it later, you must trigger a redeploy.

4. Railway will run `yarn install && yarn build` then serve with `npx serve -s build`

---

## Step 4: Update CORS (Optional but recommended)

Once your frontend is deployed and you have its URL:
1. Go to your **backend** service environment variables
2. Change `CORS_ORIGINS` from `*` to your frontend URL:
   ```
   https://revops-frontend.up.railway.app
   ```
3. Redeploy the backend

---

## Verify it's working

1. Visit your frontend URL — you should see the RevOps landing page
2. Register as an Owner
3. Set up your workshop
4. Check the browser console (F12) — there should be no errors

---

## Troubleshooting

**Still blank?** Open browser DevTools → Console tab:
- `Failed to fetch` → `REACT_APP_BACKEND_URL` is wrong or backend isn't running
- `CORS error` → Set `CORS_ORIGINS=*` on the backend temporarily
- `Cannot read properties of undefined` → Likely an API error; check the Network tab

**Backend not starting?**
- Check Railway logs for the backend service
- Confirm `MONGO_URL` is set and the MongoDB service is running
