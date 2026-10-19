import express from "express";
import cookieSession from "cookie-session";
import passport from "passport";
import SteamStrategy from "passport-steam";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const app = express();
const PORT = Number(process.env.PORT || 10000);
const FRONTEND_URL = process.env.FRONTEND_URL || "https://mon9900mr.github.io/MR-XGOD/";
const BASE_URL = (process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");
const SESSION_SECRET = process.env.SESSION_SECRET;
const TOKEN_SECRET = process.env.TOKEN_SECRET || SESSION_SECRET;

if (!BASE_URL || !SESSION_SECRET || SESSION_SECRET.length < 32 || !TOKEN_SECRET || TOKEN_SECRET.length < 32 || !process.env.STEAM_API_KEY) {
  console.error("Configure BASE_URL (or use Render's RENDER_EXTERNAL_URL), SESSION_SECRET and TOKEN_SECRET (32+ characters).");
  process.exit(1);
}

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));
app.use(cookieSession({
  name: "mxg.oauth",
  keys: [SESSION_SECRET],
  maxAge: 10 * 60 * 1000,
  httpOnly: true,
  secure: true,
  sameSite: "lax"
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new SteamStrategy({
  returnURL: `${BASE_URL}/auth/steam/return`,
  realm: `${BASE_URL}/`,
  apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
  const steamId = String(profile.id || "");
  if (!/^\d{17}$/.test(steamId)) return done(new Error("Invalid SteamID64"));
  return done(null, {
    steamId,
    username: profile.displayName || `Steam User ${steamId.slice(-4)}`,
    avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value || null
  });
}));

app.get("/auth/steam", passport.authenticate("steam", { failureRedirect: `${FRONTEND_URL}?login=failed` }));

app.get("/auth/steam/return",
  passport.authenticate("steam", { failureRedirect: `${FRONTEND_URL}?login=failed` }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({
      sub: user.steamId,
      username: user.username,
      avatar: user.avatar
    }, TOKEN_SECRET, { expiresIn: "12h", issuer: BASE_URL, audience: "masterxgod-web" });
    req.session = null;
    res.redirect(`${FRONTEND_URL.replace(/\/$/, "")}/#steam_token=${encodeURIComponent(token)}`);
  }
);

app.get("/api/me", (req, res) => {
  res.set("Cache-Control", "no-store");
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ authenticated: false });
  try {
    const claims = jwt.verify(match[1], TOKEN_SECRET, { issuer: BASE_URL, audience: "masterxgod-web" });
    return res.json({
      authenticated: true,
      user: { steamId: claims.sub, username: claims.username, avatar: claims.avatar }
    });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "MASTERXGOD Steam auth" }));
app.use((err, _req, res, _next) => {
  console.error("Auth request failed:", err.message);
  res.status(500).json({ error: "Authentication failed. Please try again." });
});

app.listen(PORT, "0.0.0.0", () => console.log(`MASTERXGOD Steam auth listening on port ${PORT}`));
