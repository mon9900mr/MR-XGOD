# MASTERXGOD API v2

## Included
- PostgreSQL-backed registration and login; passwords hashed with bcrypt.
- Editable display name, bio and Steam profile URL.
- Admin APIs for account totals, activity totals, distinct IP count, user list, role changes and activity logs.
- Security logs include IP, user agent, event and timestamp. Country/flag appears only when the hosting proxy supplies a country code; unknown geography is shown as 🏳️, not guessed.
- Logs older than 30 days are purged at startup; admin can request a purge.

## Deploy
1. Create a PostgreSQL database, e.g. https://neon.tech/
2. Copy the SSL-enabled connection string to Render as DATABASE_URL.
3. Deploy Blueprint: https://render.com/deploy?repo=https://github.com/mon9900mr/MR-XGOD
4. In Render Environment set ADMIN_PASSWORD to a unique random password of at least 14 characters. Do not put it in GitHub. Admin username is MASTERXGOD.
5. Confirm JWT_SECRET is generated. Test https://YOUR-SERVICE.onrender.com/health
6. Set API_BASE in index.html to your actual Render origin and commit.

## Privacy
The service records IP addresses and user agents for security auditing, with a 30-day retention period. Tell users this in your privacy notice. Free hosts may sleep or throttle. A profile link is metadata, not authentication.
