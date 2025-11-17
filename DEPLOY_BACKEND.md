# Backend deployment (suggested flow)

This project has a separate backend (Node/Express + MongoDB). The frontend is a static site and must point to the backend URL via `VITE_API_BASE_URL`.

Recommended hosting options:
- Render (simple, automatic deploys from GitHub)
- Railway (easy quick deploys)
- Heroku (classic, but some limitations)

High-level steps (Render example)
1. Push backend repo to GitHub.
2. Create a MongoDB Atlas cluster (free tier):
   - Create cluster, database user, and copy the connection string.
   - Whitelist IP or use access from anywhere (0.0.0.0/0) for development.
3. On Render: New -> Web Service -> Connect GitHub repo -> Select branch.
   - Build Command: `npm install`
   - Start Command: `npm start` or `node server.js` (ensure `package.json` has a `start` script)
   - Environment:
     - `MONGO_URL` = <atlas-connection-string>
     - `JWT_SECRET` = <your-jwt-secret>
     - Any other keys (cloudinary, SMTP, etc.)
4. Render will provide a public HTTPS URL (e.g., https://your-backend.onrender.com)
5. Set `VITE_API_BASE_URL` in Netlify to that URL so the frontend and backend can communicate.

Checklist for backend repo (do these before pushing):
- Ensure `server.js` uses `process.env.PORT || 4441` (it already should).
- Add a `start` script to `package.json`:
  "scripts": { "start": "node server.js" }
- Create a `README.md` with required environment variables listed:
  - MONGO_URL (MongoDB connection string)
  - JWT_SECRET
  - Any cloud storage keys or email credentials
- Do NOT commit `.env` files. Add `.env*` to `.gitignore`.

If you'd like, I can prepare:
- A `Procfile` or sample `package.json` changes for the backend (if you copy the backend into this workspace or give me access),
- Exact Render or Railway steps with screenshots.

Security notes:
- Keep secrets out of the repo. Use the host's environment variable UI.
- Use HTTPS for your backend URL.
