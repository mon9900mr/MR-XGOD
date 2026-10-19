# MASTERXGOD API — Steam-only authentication

## Login
- Steam OpenID 2.0 is the only account login method. There are no username/password login or registration endpoints.
- The user's Steam password is entered only on Steam's official website.
- On first successful login, an account is created using the verified SteamID64. PostgreSQL stores accounts, profile fields, roles and 30-day activity logs.
- This project uses `@dessly/passport-steam` with profile fetching disabled, so a Steam Web API key is not required for identity verification.

## Deploy on Render
1. Open https://render.com/deploy?repo=https://github.com/mon9900mr/MR-XGOD and deploy the Blueprint, or create a Node web service from this repository.
2. For a manual service, root directory is `backend/steam-auth`, build command `npm install`, start command `npm start`.
3. Attach a PostgreSQL database and set `DATABASE_URL` to its SSL-enabled connection string.
4. Make sure Render generates `JWT_SECRET`; it must be at least 32 characters.
5. `FRONTEND_URL` must be `https://mon9900mr.github.io` and `FRONTEND_REDIRECT_URL` must be `https://mon9900mr.github.io/MR-XGOD/`. Render supplies `RENDER_EXTERNAL_URL`, which is used for the Steam callback.
6. Optional: set `ADMIN_STEAM_ID` to the exact 17-digit SteamID64 of the owner account. Do not grant admin using a public vanity URL. If not set, Steam users receive normal user role.
7. After the service deploys, copy its HTTPS URL and replace `API_BASE` in `index.html` with that URL. Commit the change so GitHub Pages redeploys.
8. Test `https://YOUR-SERVICE.onrender.com/health`, then open the website and press **Continue with Steam**.

## Privacy
The service records IP addresses and user agents for security auditing; logs older than 30 days are purged. Publish a privacy notice before inviting users.
