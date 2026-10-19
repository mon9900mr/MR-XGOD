# راهنمای راه‌اندازی بک‌اند MASTERXGOD بدون Render

این راهنما برای اجرای API ورود Steam روی Vercel و PostgreSQL روی Supabase است. پلن رایگان Vercel برای پروژه‌های شخصی وجود دارد، اما ممکن است خود Vercel بسته به حساب یا منطقه تأیید حساب بخواهد؛ در این حالت کارت را وارد نکن و پیام را بررسی کن.

## ۱) ساخت دیتابیس در Supabase
1. وارد https://supabase.com شوید و یک پروژه جدید بسازید.
2. یک رمز قوی برای دیتابیس تعیین کنید و آن را خصوصی نگه دارید.
3. در پروژه، روی Connect بزنید و Session pooler یا Transaction pooler را انتخاب کنید. برای اجرای serverless، transaction pooler می‌تواند مناسب باشد.
4. رشته اتصال PostgreSQL را کپی کنید و [YOUR-PASSWORD] را با رمز دیتابیس خود جایگزین کنید. این رشته محرمانه است؛ آن را در GitHub، چت عمومی یا فایل فرانت‌اند قرار ندهید.

## ۲) Deploy بک‌اند در Vercel
1. وارد https://vercel.com/new شوید و با GitHub وارد شوید.
2. مخزن mon9900mr/MR-XGOD را Import کنید.
3. در تنظیمات پروژه، Root Directory را روی backend/steam-auth قرار دهید.
4. Framework Preset را روی Other بگذارید؛ Build Command را خالی یا پیش‌فرض بگذارید.
5. پیش از Deploy، در Environment Variables این مقادیر را اضافه کنید:
   - DATABASE_URL: رشته اتصال PostgreSQL از Supabase
   - JWT_SECRET: یک رشته تصادفی محرمانه با حداقل ۳۲ کاراکتر
   - FRONTEND_URL: https://mon9900mr.github.io
   - FRONTEND_REDIRECT_URL: https://mon9900mr.github.io/MR-XGOD/
   - API_PUBLIC_URL: آدرس عمومی پروژه Vercel؛ اگر هنوز در زمان ساخت مشخص نیست، پس از Deploy آن را اضافه و دوباره Deploy کنید.
6. Deploy را اجرا کنید. آدرس عمومی بک‌اند شبیه https://project-name.vercel.app خواهد بود.
7. در Settings → Environment Variables، مقدار API_PUBLIC_URL را برابر همان آدرس عمومی قرار دهید و از Deployments یک بار Redeploy انجام دهید.

## ۳) اتصال Steam
1. در Vercel، مطمئن شوید API_PUBLIC_URL دقیقاً آدرس اصلی API است و اسلش انتهایی ندارد.
2. در مخزن GitHub، فایل index.html را باز کنید و در خط const API_BASE = ''، آدرس Vercel را داخل کوتیشن قرار دهید، مثلاً const API_BASE = 'https://project-name.vercel.app'.
3. Commit کنید؛ GitHub Pages باید سایت را دوباره منتشر کند.
4. در مرورگر، آدرس https://project-name.vercel.app/health را باز کنید. باید JSON با ok: true و database: connected ببینید.
5. سپس سایت GitHub Pages را باز کنید و «ادامه با Steam» را آزمایش کنید.

## نکات مهم
- هیچ رمز یا رشته اتصال واقعی را در GitHub commit نکنید.
- ورود Steam تا زمانی که بک‌اند و دیتابیس واقعاً Deploy و تست نشده‌اند فعال محسوب نمی‌شود.
- اگر Vercel برای حساب شما کارت خواست، پرداخت را دور نزنید و اطلاعات کارت ناموجود را وارد نکنید؛ پیام دقیق را بررسی کنید و یک میزبان دیگر انتخاب می‌کنیم.
- نشست OpenID و محدودیت‌های serverless باید در تست واقعی بررسی شوند؛ صرف موفقیت Deploy تضمین نمی‌کند که احراز هویت Steam بدون خطا کار کند.
