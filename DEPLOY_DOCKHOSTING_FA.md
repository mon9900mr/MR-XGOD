# راه‌اندازی MASTERXGOD روی DockHosting

## تنظیمات پروژه
- Repository: `mon9900mr/MR-XGOD`
- Branch: `main`
- Runtime: Node.js
- Root directory: `backend/steam-auth`
- Start command: `npm start`
- Database: PostgreSQL و باید به همین پروژه Attach/Connect شود.
- آدرس عمومی API: `https://mr-xgod.dockhosting.dev`

## متغیرهای محیطی
در Project Settings → Environment Variables بررسی/تنظیم کن:
- `DATABASE_URL`: پس از اتصال PostgreSQL، DockHosting باید آن را به برنامه تزریق کند. مقدار اتصال را در چت یا GitHub منتشر نکن.
- `JWT_SECRET`: یک مقدار تصادفی و محرمانه با حداقل ۳۲ کاراکتر بساز. آن را در مخزن GitHub قرار نده.
- `API_PUBLIC_URL`: `https://mr-xgod.dockhosting.dev`
- `FRONTEND_URL`: `https://mon9900mr.github.io`
- `FRONTEND_REDIRECT_URL`: `https://mon9900mr.github.io/MR-XGOD/`
- `ADMIN_STEAM_ID` (اختیاری): فقط اگر می‌خواهی اکانت Steam خودت ادمین شود، SteamID64 دقیق ۱۷ رقمی را وارد کن.

`PORT` را دستی تنظیم نکن؛ هاست خودش آن را فراهم می‌کند.

## تست بعد از Deploy
1. باز کن: `https://mr-xgod.dockhosting.dev/health`
2. پاسخ موفق باید JSON شامل `"ok":true` و `"database":"connected"` داشته باشد.
3. اگر health خطای 503 داد، Logs را بررسی کن؛ معمولاً `DATABASE_URL` وصل نشده یا دیتابیس به پروژه متصل نیست.
4. بعد سایت فرانت‌اند را باز کن: `https://mon9900mr.github.io/MR-XGOD/` و ورود با Steam را تست کن.

## نکات امنیتی
- هیچ‌وقت رمز دیتابیس یا `JWT_SECRET` را در فایل‌های GitHub commit نکن.
- ورود Steam تا زمانی که health-check موفق نشده و OpenID flow تست نشده، تأییدشده محسوب نمی‌شود.
