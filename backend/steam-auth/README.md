# MASTERXGOD API

## Login methods
- Steam OpenID 2.0 login and automatic account creation (Steam password is entered only on Steam's official website).
- Optional username/password login remains available.
- Steam login uses the server-side `@dessly/passport-steam` strategy with profile fetching disabled; a Steam Web API key is not required for identity.
- PostgreSQL stores users, SteamID64, profiles, roles and 30-day activity logs.

## Deploy
1. Create a PostgreSQL database and copy its SSL-enabled connection string into Render as `DATABASE_URL`.
2. Deploy the repository's `render.yaml` Blueprint, or create a Node web service with root directory `backend/steam-auth`, build `npm install`, start `npm start`.
3. Set `DATABASE_URL`, generated `JWT_SECRET` (32+ chars), and `ADMIN_PASSWORD` (14+ chars) in Render. Do not commit secrets.
4. Steam callback uses Render's `RENDER_EXTERNAL_URL` automatically. Ensure it is the public HTTPS URL of this API.
5. Set `FRONTEND_URL=https://mon9900mr.github.io` for CORS and `FRONTEND_REDIRECT_URL=https://mon9900mr.github.io/MR-XGOD/` for redirect after Steam login.
6. Set `API_BASE` in `index.html` to the deployed Render URL and commit the change.
7. Optional: set `ADMIN_STEAM_ID` to the exact 17-digit SteamID64 that should receive the admin role on Steam login. Never grant admin based only on a public vanity profile URL. Until configured, the existing MASTERXGOD admin password login remains available.

## Privacy
The service records IP addresses and user agents for security auditing; logs older than 30 days are purged. Tell users this in the site's privacy notice. Free hosts may sleep or throttle.
