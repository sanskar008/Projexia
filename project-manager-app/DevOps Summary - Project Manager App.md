DevOps Summary - Project Manager App

markdown
Copy
Edit
Project Structure:

- Frontend: React (Vite) app deployed on Vercel
- Backend: Node.js/Express API deployed on Render

DevOps Steps:

1. ✅ Frontend Deployment (Vercel):

   - Initialized Vite + React project
   - Ensured project had `package.json`, `vite.config.ts`, and correct structure
   - Set Vercel build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Fixed missing `tsconfig.app.json` error
   - Connected GitHub repo to Vercel for CI/CD
   - Vercel auto-deploys on every push to main branch

2. ✅ Backend Deployment (Render):

   - Deployed backend (Node.js/Express API) on Render
   - Setup auto-deployment from GitHub repo
   - Environment variables configured in Render dashboard
   - Ensured server starts using: `npm run start` or `node index.js`

3. ✅ Environment Configuration:

   - Used `.env` files locally
   - Configured production environment variables in:
     - Render (for backend)
     - Vercel (for frontend)

4. ✅ API Integration:

   - Frontend fetch calls point to Render-deployed server URL
   - Used absolute path aliases (`@/`) configured via `vite.config.ts`

5. ✅ Domain Setup (Optional but recommended):

   - Set custom domain for frontend via Vercel dashboard
   - Backend accessible via Render’s provided subdomain

6. ✅ Version Control:
   - Used Git and GitHub for source control
   - Both Vercel and Render linked to GitHub repos for CI/CD pipelines

DevOps Principles Followed:

- Continuous Integration/Continuous Deployment (CI/CD)
- Environment isolation (local vs production via `.env`)
- Cloud infrastructure provisioning (Vercel + Render)
- Monitoring via Vercel/Render dashboards
