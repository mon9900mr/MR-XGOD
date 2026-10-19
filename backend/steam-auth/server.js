import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import pg from "pg";
import crypto from "node:crypto";
import session from "express-session";
import passport from "passport";
import SteamStrategy from "@dessly/passport-steam";
const {Pool}=pg, app=express(), PORT=Number(process.env.PORT||10000);
const FRONTEND_URL=(process.env.FRONTEND_URL||"https://mon9900mr.github.io").replace(/\/$/,"");
const FRONTEND_REDIRECT_URL=(process.env.FRONTEND_REDIRECT_URL||"https://mon9900mr.github.io/MR-XGOD/").replace(/\/$/,"");
const PUBLIC_API_URL=(process.env.API_PUBLIC_URL||process.env.RENDER_EXTERNAL_URL||"").replace(/\/$/,"");
const JWT_SECRET=process.env.JWT_SECRET||"", DATABASE_URL=process.env.DATABASE_URL||"", ADMIN_STEAM_ID=String(process.env.ADMIN_STEAM_ID||"").trim();
if(!DATABASE_URL||JWT_SECRET.length<32){console.error("Set DATABASE_URL and JWT_SECRET (32+ chars) in Render.");process.exit(1)}
if(ADMIN_STEAM_ID&&!/^\\d{17}$/.test(ADMIN_STEAM_ID)){console.error("ADMIN_STEAM_ID must be an exact 17-digit SteamID64.");process.exit(1)}
const pool=new Pool({connectionString:DATABASE_URL,ssl:process.env.DATABASE_SSL==="false"?false:{rejectUnauthorized:false},max:5});
app.set("trust proxy",1);app.use(helmet({contentSecurityPolicy:false}));app.use(express.json({limit:"32kb"}));
app.use(session({name:"mxg.sid",secret:JWT_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,secure:true,sameSite:"lax",maxAge:10*60*1000}}));
passport.serializeUser((user,done)=>done(null,user));passport.deserializeUser((user,done)=>done(null,user));
passport.use("steam",new SteamStrategy({returnUrl:PUBLIC_API_URL?PUBLIC_API_URL+"/auth/steam/return":"https://invalid.example/auth/steam/return",realm:PUBLIC_API_URL?PUBLIC_API_URL+"/":"https://invalid.example/",fetchUserProfile:false},(steamIdentity,done)=>{try{const raw=steamIdentity?.SteamID||steamIdentity;const steamId=String(raw?.getSteamID64?.()??raw?.getSteamId64?.()??raw?.toString?.()??raw);if(!/^\d{17}$/.test(steamId))return done(new Error("Steam did not return a valid SteamID64"));done(null,{steamId})}catch(e){done(e)}}));
app.use(passport.initialize());app.use(passport.session());
app.use(rateLimit({windowMs:60000,limit:100,standardHeaders:true,legacyHeaders:false}));
app.use((req,res,next)=>{const o=req.headers.origin;if(o===FRONTEND_URL||o===FRONTEND_URL+"/"||!o){res.setHeader("Access-Control-Allow-Origin",o||FRONTEND_URL);res.setHeader("Vary","Origin")}res.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization");res.setHeader("Access-Control-Allow-Methods","GET,POST,PATCH,DELETE,OPTIONS");if(req.method==="OPTIONS")return res.sendStatus(204);next()});
await pool.query("CREATE TABLE IF NOT EXISTS users(id BIGSERIAL PRIMARY KEY,username VARCHAR(24) UNIQUE NOT NULL,email VARCHAR(254) UNIQUE NOT NULL,password_hash TEXT NOT NULL,display_name VARCHAR(40) NOT NULL,bio VARCHAR(240) NOT NULL DEFAULT '',steam_profile_url TEXT NOT NULL DEFAULT '',role VARCHAR(16) NOT NULL DEFAULT 'user',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),last_login_at TIMESTAMPTZ)");
await pool.query("CREATE TABLE IF NOT EXISTS activity_logs(id BIGSERIAL PRIMARY KEY,user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,username VARCHAR(24) NOT NULL DEFAULT 'unknown',event_type VARCHAR(48) NOT NULL,ip_address VARCHAR(64) NOT NULL DEFAULT 'unknown',country_code VARCHAR(2) NOT NULL DEFAULT '',country_name VARCHAR(80) NOT NULL DEFAULT '',user_agent VARCHAR(300) NOT NULL DEFAULT '',details JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_id VARCHAR(20)");
await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_steam_id_unique_idx ON users(steam_id) WHERE steam_id IS NOT NULL");
await pool.query("CREATE INDEX IF NOT EXISTS activity_logs_created_idx ON activity_logs(created_at DESC)");
await pool.query("CREATE INDEX IF NOT EXISTS activity_logs_user_idx ON activity_logs(user_id)");
await pool.query("DELETE FROM activity_logs WHERE created_at<NOW()-INTERVAL '30 days'");
function ip(req){let x=String(req.ip||req.socket.remoteAddress||"unknown").trim();return (x.startsWith("::ffff:")?x.slice(7):x).slice(0,64)}
function geo(req){const c=String(req.headers["cf-ipcountry"]||req.headers["x-country-code"]||"").toUpperCase(),ok=/^[A-Z]{2}$/.test(c)&&c!=="XX";let name="";if(ok){try{name=new Intl.DisplayNames(["en"],{type:"region"}).of(c)||""}catch{}}return{code:ok?c:"",name,flag:ok?String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0))):"🏳️"}}
async function log(req,{userId=null,username="unknown",eventType,details={}}){const g=geo(req);await pool.query("INSERT INTO activity_logs(user_id,username,event_type,ip_address,country_code,country_name,user_agent,details) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[userId,username,eventType,ip(req),g.code,g.name,String(req.headers["user-agent"]||"").slice(0,300),JSON.stringify(details)])}
const pub=r=>({id:r.id,username:r.username,email:r.email,displayName:r.display_name,bio:r.bio,steamProfileUrl:r.steam_profile_url,role:r.role,createdAt:r.created_at,lastLoginAt:r.last_login_at});
const token=u=>jwt.sign({sub:String(u.id),username:u.username,role:u.role},JWT_SECRET,{expiresIn:"12h",issuer:"masterxgod-api",audience:"masterxgod-web"});
function auth(req,res,next){const m=String(req.headers.authorization||"").match(/^Bearer\s+(.+)$/i);if(!m)return res.status(401).json({error:"برای ادامه وارد حساب شو."});try{req.auth=jwt.verify(m[1],JWT_SECRET,{issuer:"masterxgod-api",audience:"masterxgod-web"});next()}catch{return res.status(401).json({error:"نشست منقضی شده؛ دوباره وارد شو."})}}
function admin(req,res,next){if(req.auth?.role!=="admin")return res.status(403).json({error:"دسترسی ادمین لازم است."});next()}

app.get("/auth/steam",(req,res,next)=>{if(!PUBLIC_API_URL)return res.status(503).send("Steam login is not configured: public backend URL is missing.");next()},passport.authenticate("steam"));
app.get("/auth/steam/return",passport.authenticate("steam",{failureRedirect:FRONTEND_REDIRECT_URL+"#steam_error=1"}),async(req,res)=>{try{
 const steamId=String(req.user?.steamId||"");if(!/^\d{17}$/.test(steamId))throw new Error("Invalid Steam identity");
 const username="steam_"+steamId;
 const email="steam-"+steamId+"@steam.masterxgod.invalid";
 const displayName="Steam Player "+steamId.slice(-6);
 const profileUrl="https://steamcommunity.com/profiles/"+steamId;
 const role=ADMIN_STEAM_ID&&steamId===ADMIN_STEAM_ID?"admin":"user";
 const existing=await pool.query("SELECT * FROM users WHERE steam_id=$1",[steamId]);
 let u;
 if(existing.rowCount){
   const q=await pool.query("UPDATE users SET last_login_at=NOW(),role=CASE WHEN role='admin' OR $2='admin' THEN 'admin' ELSE role END,updated_at=NOW() WHERE steam_id=$1 RETURNING *",[steamId,role]);u=q.rows[0];
 }else{
   const q=await pool.query("INSERT INTO users(username,email,password_hash,display_name,steam_profile_url,steam_id,role,last_login_at) VALUES($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *",[username,email,crypto.randomBytes(48).toString("hex"),displayName,profileUrl,steamId,role]);u=q.rows[0];
 }
 if(u.role==="banned"){await log(req,{userId:u.id,username:u.username,eventType:"steam_login_blocked",details:{steamId}});return res.redirect(FRONTEND_REDIRECT_URL+"#steam_banned=1")}
 await log(req,{userId:u.id,username:u.username,eventType:"steam_login",details:{steamId}});
 const signed=token(u);
 req.session.destroy(()=>res.redirect(FRONTEND_REDIRECT_URL+"#steam_token="+encodeURIComponent(signed)));
 }catch(e){console.error("Steam login failed:",e.message);res.redirect(FRONTEND_REDIRECT_URL+"#steam_error=1")}});

app.get("/health",async(_q,s)=>{try{await pool.query("SELECT 1");s.json({ok:true,service:"MASTERXGOD API",database:"connected"})}catch{s.status(503).json({ok:false,database:"unavailable"})}});
app.get("/api/me",auth,async(req,res)=>{try{const q=await pool.query("SELECT * FROM users WHERE id=$1",[req.auth.sub]);if(!q.rowCount)return res.status(401).json({error:"حساب پیدا نشد."});res.set("Cache-Control","no-store");res.json({user:pub(q.rows[0])})}catch{res.status(500).json({error:"خطای سرور."})}});
app.patch("/api/profile",auth,async(req,res)=>{try{const d=String(req.body?.displayName||"").trim(),bio=String(req.body?.bio||"").trim(),sp=String(req.body?.steamProfileUrl||"").trim();if(d.length<2||d.length>40||bio.length>240)return res.status(400).json({error:"نام نمایشی یا بیو خارج از محدوده است."});if(sp){let u;try{u=new URL(sp)}catch{return res.status(400).json({error:"لینک پروفایل معتبر نیست."})}if(u.protocol!=="https:"||u.hostname!=="steamcommunity.com"||!/^\/(id|profiles)\/[A-Za-z0-9_-]+\/?$/i.test(u.pathname))return res.status(400).json({error:"فقط لینک پروفایل Steam پذیرفته می‌شود."})}const q=await pool.query("UPDATE users SET display_name=$1,bio=$2,steam_profile_url=$3,updated_at=NOW() WHERE id=$4 RETURNING *",[d,bio,sp,req.auth.sub]);await log(req,{userId:q.rows[0].id,username:q.rows[0].username,eventType:"profile_updated"});res.json({user:pub(q.rows[0])})}catch{res.status(500).json({error:"ذخیره پروفایل انجام نشد."})}});
app.post("/api/logout",auth,async(req,res)=>{await log(req,{userId:req.auth.sub,username:req.auth.username,eventType:"logout"});res.json({ok:true})});
app.get("/api/admin/summary",auth,admin,async(_req,res)=>{try{const [u,l,i,e]=await Promise.all([pool.query("SELECT COUNT(*)::int n FROM users"),pool.query("SELECT COUNT(*)::int n FROM activity_logs WHERE created_at>NOW()-INTERVAL '24 hours'"),pool.query("SELECT COUNT(DISTINCT ip_address)::int n FROM activity_logs WHERE created_at>NOW()-INTERVAL '24 hours'"),pool.query("SELECT event_type,COUNT(*)::int count FROM activity_logs WHERE created_at>NOW()-INTERVAL '7 days' GROUP BY event_type ORDER BY count DESC LIMIT 12")]);res.json({users:u.rows[0].n,events24h:l.rows[0].n,uniqueIps24h:i.rows[0].n,events:e.rows})}catch{res.status(500).json({error:"آمار بارگذاری نشد."})}});
app.get("/api/admin/users",auth,admin,async(_q,res)=>{try{const q=await pool.query("SELECT * FROM users ORDER BY created_at DESC LIMIT 200");res.json({users:q.rows.map(pub)})}catch{res.status(500).json({error:"کاربران بارگذاری نشدند."})}});
app.patch("/api/admin/users/:id/role",auth,admin,async(req,res)=>{const role=req.body?.role;if(!["user","moderator","banned"].includes(role))return res.status(400).json({error:"نقش نامعتبر است."});try{const q=await pool.query("UPDATE users SET role=$1,updated_at=NOW() WHERE id=$2 AND role<>'admin' RETURNING id,username,role",[role,req.params.id]);if(!q.rowCount)return res.status(404).json({error:"کاربر پیدا نشد یا ادمین قابل تغییر نیست."});await log(req,{userId:req.auth.sub,username:req.auth.username,eventType:"user_role_changed",details:{targetId:req.params.id,role}});res.json({user:q.rows[0]})}catch{res.status(500).json({error:"تغییر نقش انجام نشد."})}});
app.get("/api/admin/logs",auth,admin,async(req,res)=>{try{const limit=Math.min(Math.max(Number(req.query.limit)||100,1),300),q=await pool.query("SELECT id,user_id,username,event_type,ip_address,country_code,country_name,user_agent,details,created_at FROM activity_logs ORDER BY created_at DESC LIMIT $1",[limit]);res.json({logs:q.rows.map(r=>({...r,flag:r.country_code?String.fromCodePoint(...[...r.country_code].map(c=>127397+c.charCodeAt(0))):"🏳️"}))})}catch{res.status(500).json({error:"لاگ‌ها بارگذاری نشدند."})}});
app.delete("/api/admin/logs",auth,admin,async(req,res)=>{try{const q=await pool.query("DELETE FROM activity_logs WHERE created_at<NOW()-INTERVAL '30 days'");await log(req,{userId:req.auth.sub,username:req.auth.username,eventType:"logs_pruned",details:{deleted:q.rowCount}});res.json({deleted:q.rowCount})}catch{res.status(500).json({error:"پاک‌سازی انجام نشد."})}});
app.use((err,_req,res,_next)=>{console.error(err.message);res.status(500).json({error:"خطای غیرمنتظره سرور."})});
app.listen(PORT,"0.0.0.0",()=>console.log("MASTERXGOD API listening on "+PORT));