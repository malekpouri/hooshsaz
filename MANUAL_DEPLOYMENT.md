# راهنمای استقرار دستی (بدون داکر)

این راهنما مراحل اجرای پروژه هوش‌ساز بر روی سروری که داکر ندارد را توضیح می‌دهد.

## پیش‌نیازها

قبل از شروع، مطمئن شوید که موارد زیر روی سرور نصب شده‌اند:

1.  **Node.js**: نسخه 18 یا بالاتر.
2.  **PostgreSQL**: پایگاه داده.
3.  **Git**: برای دریافت کدها (اختیاری اگر کدها را دستی کپی می‌کنید).
4.  **Ollama**: برای مدل‌های هوش مصنوعی (اختیاری، اگر روی سرور دیگری است باید آدرس آن را داشته باشید).
5.  **PM2** (پیشنهادی): برای مدیریت پروسه‌ها (`npm install -g pm2`).

---

## ۱. تنظیمات پایگاه داده (PostgreSQL)

ابتدا باید یک دیتابیس و یک کاربر در PostgreSQL ایجاد کنید. وارد کنسول Postgres شوید:

```bash
sudo -u postgres psql
```

سپس دستورات زیر را اجرا کنید (نام کاربری و رمز عبور را می‌توانید تغییر دهید):

```sql
CREATE DATABASE hooshsaz;
CREATE USER hoosh_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hooshsaz TO hoosh_user;
\q
```

---

## ۲. راه‌اندازی Backend

1.  وارد پوشه `backend` شوید:

    ```bash
    cd backend
    ```

2.  وابستگی‌ها را نصب کنید:

    ```bash
    npm install
    ```

3.  فایل `.env` را ایجاد کنید و تنظیمات را وارد نمایید:

    ```bash
    nano .env
    ```

    محتوای زیر را در آن قرار دهید (اطلاعات دیتابیس را مطابق مرحله ۱ تنظیم کنید):

    ```env
    PORT=5000
    DATABASE_URL="postgresql://hoosh_user:your_secure_password@localhost:5432/hooshsaz?schema=public"
    JWT_SECRET="یک_رمز_بسیار_طولانی_و_امن_برای_توکن‌ها"
    NODE_ENV=production
    ```

4.  مایگریشن‌های دیتابیس را اجرا کنید تا جدول‌ها ساخته شوند:

    ```bash
    npx prisma generate
    npx prisma migrate deploy
    ```

5.  داده‌های اولیه (مانند کاربر ادمین) را وارد کنید:

    ```bash
    npm run seed
    # اگر دستور بالا کار نکرد:
    # node -r dotenv/config prisma/seed.js
    ```

## ۳. راه‌اندازی Frontend

1.  وارد پوشه `frontend` شوید:

    ```bash
    cd ../frontend
    ```

2.  وابستگی‌ها را نصب کنید:

    ```bash
    npm install
    ```

3.  فایل `.env.production` را ایجاد کنید:

    ```bash
    nano .env.production
    ```

    محتوای زیر را وارد کنید (آدرس Backend را وارد کنید):

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

4.  برنامه را بیلد کنید:

    ```bash
    npm run build
    ```

---

## ۴. اجرای نهایی با PM2 (روش پیشنهادی)

برای مدیریت راحت‌تر، یک فایل `ecosystem.config.js` در ریشه پروژه ایجاد شده است.

1.  در ریشه پروژه (پوشه `hooshsaz`) دستور زیر را اجرا کنید تا هر دو برنامه (فرانت و بک) اجرا شوند:

    ```bash
    pm2 start ecosystem.config.js
    ```

2.  **ذخیره و اجرای خودکار (Startup):**

    - **لینوکس**:

      ```bash
      pm2 save
      pm2 startup
      ```

    - **ویندوز**:
      PM2 در ویندوز به صورت پیش‌فرض قابلیت Startup ندارد. باید پکیج کمکی نصب کنید:
      ```powershell
      npm install -g pm2-windows-startup
      pm2-startup install
      pm2 save
      ```

3.  **تنظیم Ollama**:
    اگر Ollama روی همین سرور نصب است، مطمئن شوید که اجرا شده است (`ollama serve`).
    سپس وارد پنل مدیریت هوش‌ساز شوید (`http://your-server-ip:3000/admin`) و در بخش تنظیمات، آدرس Ollama را وارد کنید (معمولاً `http://localhost:11434`).

## عیب‌یابی

### خطای `permission denied for schema public`

اگر هنگام اجرای `npx prisma migrate deploy` با این خطا مواجه شدید، به این معنی است که کاربر دیتابیس دسترسی کافی برای تغییرات در اسکیمای public را ندارد. برای رفع این مشکل:

1.  وارد کنسول Postgres شوید:
    - **لینوکس**: `sudo -u postgres psql`
    - **ویندوز**: `psql -U postgres`
2.  به دیتابیس هوش‌ساز متصل شوید و دسترسی‌ها را اصلاح کنید (نام کاربر `hoosh_user` را با نام کاربری خود جایگزین کنید):
    ```sql
    \c hooshsaz
    GRANT ALL ON SCHEMA public TO hoosh_user;
    ALTER DATABASE hooshsaz OWNER TO hoosh_user;
    \q
    ```
3.  مجدداً دستور migrate را اجرا کنید.

- اگر خطای اتصال دیتابیس دارید، فایل `backend/.env` را چک کنید.
- اگر فرانت‌اند به بک‌اند وصل نمی‌شود، مطمئن شوید پورت ۵۰۰۰ باز است یا فایروال آن را مسدود نکرده است.
- برای مشاهده لاگ‌ها می‌توانید از دستور `pm2 logs` استفاده کنید.

### دسترسی از سایر سیستم‌ها (شبکه و اینترنت)

با تنظیمات جدید (استفاده از Proxy در Next.js)، دیگر نیازی به وارد کردن IP سرور در تنظیمات نیست. برنامه به صورت خودکار درخواست‌ها را مدیریت می‌کند.

تنها کاری که باید انجام دهید این است که فایل `frontend/.env.production` را ویرایش کرده و مقدار آدرس API را خالی بگذارید:

```env
NEXT_PUBLIC_API_URL=
```

سپس فرانت‌اند را مجدداً بیلد بگیرید:

```bash
cd frontend
npm run build
pm2 restart hooshsaz-frontend
```

با این کار، برنامه هم در شبکه داخلی و هم از طریق اینترنت (NAT) بدون مشکل کار خواهد کرد.

### خطای `permission denied to create database`

این خطا نشان می‌دهد که دیتابیس `hooshsaz` وجود ندارد و کاربر شما (`user`) اجازه ساخت دیتابیس را ندارد.
برای حل مشکل:

1.  با کاربر `postgres` وارد شوید: `psql -U postgres`
2.  دیتابیس را دستی بسازید: `CREATE DATABASE hooshsaz;`
3.  مالکیت را به کاربر خود بدهید: `ALTER DATABASE hooshsaz OWNER TO "user";` (اگر نام کاربر `user` است حتما داخل کوتیشن بگذارید چون کلمه رزرو شده است).

**نکته مهم:** در فایل `.env` شما یک تایپو وجود دارد: `JWWT_SECRET` باید به `JWT_SECRET` اصلاح شود.
