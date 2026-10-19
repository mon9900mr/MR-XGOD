# MASTERXGOD Steam Login Backend

This Node.js service uses Steam OpenID 2.0 to verify identity. It is designed to deploy on Render's free web-service plan from this GitHub repository. Render free services can sleep after inactivity and may take about a minute to wake; see https://render.com/docs/free.

## Deploy with one click

1. Open https://render.com/deploy?repo=https://github.com/mon9900mr/MR-XGOD
2. Sign in to Render and create a Blueprint from this repository.
3. Review the service named `masterxgod-steam-auth`. The blueprint sets its root directory to `backend/steam-auth`, installs dependencies and starts Node.
4. Wait for deployment. Render supplies `RENDER_EXTERNAL_URL`; the server uses that as its public HTTPS base URL.
5. Open the service's Environment page and confirm `SESSION_SECRET` and `TOKEN_SECRET` were generated. Never publish these values.
6. Open `https://YOUR-SERVICE.onrender.com/health`. It should return JSON with `"ok":true`.
7. Copy the public service origin, e.g. `https://masterxgod-steam-auth.onrender.com`. In `index.html`, set `AUTH_API_BASE` to that origin (no trailing slash), commit to `main`, and wait for GitHub Pages to redeploy.
8. Test the Steam sign-in button. Steam's login page must be on `steamcommunity.com`; the website never asks for the Steam password.

## Notes

- Steam OpenID is validated server-side by Passport's Steam strategy.
- After callback, a short-lived signed token is returned in the URL fragment (not sent as an HTTP request path), then held in the browser session storage. It expires in 12 hours.
- This starter does not store users in a database and does not include account editing, tickets, or admin permissions.
- Render free instances sleep when idle and may take about a minute to wake up. This is suitable for testing/hobby use, not a production guarantee.
- Never grant admin privileges to the first person who logs in. Add a verified SteamID64 allowlist in a separate server-side change if admin access is needed.
