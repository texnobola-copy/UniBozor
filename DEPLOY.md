# Deploying marketplace-frontend to Netlify

This guide prepares the project for deployment to Netlify and documents the minimal steps.

Important: do NOT commit any `.env` files containing secrets. Use Netlify's Site > Settings > Build & deploy > Environment to set env vars.

1) What we changed
- The frontend now reads the API base URL from `VITE_API_BASE_URL` at build time.
  - Default fallback used for local development: `http://localhost:5000`.
- `.gitignore` updated to ignore `.env` files.

2) Build settings for Netlify
- Build command: `npm run build`
- Publish directory: `dist`

3) Environment variables (set these in Netlify Dashboard)
- VITE_API_BASE_URL = https://your-backend-url (example: https://api.yourdomain.com)

4) Steps to push & deploy
- Create a GitHub repo and push your frontend code.
- In Netlify: New site -> Import from GitHub -> select repository.
- Set build command and publish directory (above), add the environment variable `VITE_API_BASE_URL`, then deploy.

5) Local verification
- To preview a production build locally:

```bash
# create a local .env file for build-time env (DO NOT commit this file)
# .env.production
# VITE_API_BASE_URL=http://localhost:5000

npm install
npm run build
npx serve -s dist  # or `npm run preview` (vite preview)
```

6) Notes
- The frontend is static (built assets). The API must be hosted separately and reachable by the frontend URL you set in `VITE_API_BASE_URL`.
- If your backend needs to accept requests from your Netlify domain, ensure CORS is configured on the backend (it already is in this project).

If you'd like, I can prepare the Git commands and a suggested commit message, or create a `netlify.toml` file for you automatically.
