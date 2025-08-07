# Projexia Frontend (Vercel) & Backend (Render) Deployment Guide

## Frontend (Vercel)

- The `src/` folder contains your frontend code.
- Vercel will use `vite` to build the frontend.
- The `vercel.json` configures Vercel to build from `src/` and serve `dist/`.
- Make sure your API URLs in the frontend point to your Render backend URL (e.g., `https://your-backend.onrender.com`).

## Backend (Render)

- The `server/` folder contains your backend code.
- Deploy only the `server/` folder to Render.
- Set your environment variables (e.g., database URL, secrets) in the Render dashboard.
- Make sure CORS is enabled for your frontend domain in the backend.

## Steps

1. **Frontend:**
   - Push this repo to GitHub.
   - Import the repo in Vercel, set the root directory to `src/` if needed, or keep as is if Vercel auto-detects.
   - Set build command: `npm run build` and output directory: `dist`.
2. **Backend:**
   - Push the `server/` folder to a separate repo or deploy from this monorepo (set root to `server/` in Render).
   - Set start command: `npm start` or `node server.js` as per your backend setup.

---

**Update your frontend API calls to use the Render backend URL!**
