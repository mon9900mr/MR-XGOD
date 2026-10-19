import express from "express";
import session from "express-session";
import passport from "passport";
import SteamStrategy from "passport-steam";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const FRONTEND_URL = process.env.FRONTEND_URL || "https://mon9900mr.github.io/MR-XGOD/";
const BASE_URL = process.env.BASE_URL;

if (!BASE_URL || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error("Set BASE_URL and a SESSION_SECRET of at least 32 characters before starting.");
  process.exit(1);
}

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));
app.use(session({
  name: "mxg.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new SteamStrategy({
  returnURL: `${BASE_URL.replace(/\/$/, "")}/auth/steam/return`,
  realm: `${BASE_URL.replace(/\/$/, "")}/`,
  apiKey: process.env.STEAM_API_KEY || undefined,
  passReqToCallback: false
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
  (req, res) => res.redirect(FRONTEND_URL)
);

app.get("/api/me", (req, res) => {
  res.set("Cache-Control", "no-store");
  if (!req.isAuthenticated?.() || !req.user) return res.status(401).json({ authenticated: false });
  return res.json({ authenticated: true, user: req.user });
});

app.post("/auth/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("mxg.sid", { httpOnly: true, secure: true, sameSite: "lax" });
      res.status(204).end();
    });
  });
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "MASTERXGOD Steam auth" }));
app.use((err, _req, res, _next) => {
  console.error("Auth request failed:", err.message);
  res.status(500).json({ error: "Authentication failed. Please try again." });
});

app.listen(PORT, () => console.log(`MASTERXGOD auth backend listening on ${PORT}`));
