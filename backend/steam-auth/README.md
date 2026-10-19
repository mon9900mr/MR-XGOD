# MASTERXGOD Steam Login Backend

This service provides server-side Steam OpenID authentication. The GitHub Pages site is static and cannot validate Steam OpenID assertions itself, so this backend must be deployed to a public HTTPS host.

## Deploy

1. Deploy this directory as a Node.js 20+ web service.
2. Set environment variables in the host dashboard:
   - `BASE_URL`: the backend's public HTTPS origin, with no path (for example `https://auth.example.com`).
   - `SESSION_SECRET`: a unique random secret of 32+ characters. Never commit it.
   - `FRONTEND_URL`: `https://mon9900mr.github.io/MR-XGOD/`
   - `PORT`: supplied automatically by most hosts; otherwise `3000`.
3. Set the Steam OpenID return URL in the Steamworks/Steam community configuration only if your chosen integration/host requires it; callback is `BASE_URL/auth/steam/return`.
4. Test `BASE_URL/health`, then `BASE_URL/auth/steam`.

## Frontend connection still required

After deployment, set the frontend's `AUTH_API_BASE` to the deployed backend origin and make the sign-in buttons navigate to `AUTH_API_BASE/auth/steam`. Since the site is hosted on GitHub Pages and the backend is a separate origin, configure cross-site cookies/CORS carefully before enabling credentialed profile requests. Prefer hosting the frontend and backend on the same custom domain where possible.

## Security

- Never ask for or store a Steam password.
- Steam identity is accepted only through Passport's server-side OpenID callback.
- Use HTTPS, a strong private session secret, and the host's secret manager.
- Do not grant admin privileges based on the first login. Use a separately verified SteamID64 allowlist for administrators.
- This starter stores identity in the signed session only; it does not yet provide a persistent user database.
