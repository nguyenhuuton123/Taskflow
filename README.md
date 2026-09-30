# Taskflow – Task Management System

Laravel 11 (API, Sanctum) + React (Vite) + MySQL, chạy bằng Docker Compose.

## Chạy nhanh (chỉ cần Docker Desktop)

```bash
# 1) Tải bộ khung Laravel + chép code Taskflow vào backend/  (chạy 1 lần, ~1 phút)
./setup.sh          # Windows: bấm đúp setup.bat hoặc chạy trong CMD

# 2) Khởi động toàn bộ
docker compose up --build
```

| Địa chỉ | Mô tả |
|---|---|
| http://localhost:3000 | Ứng dụng React |
| http://localhost:3000/docs | Swagger UI (OpenAPI) |
| localhost:3307 | MySQL (DBeaver/TablePlus) |

Tài khoản demo: `demo@taskflow.test` / `password123`

## Cấu hình database
Sửa file `.env` ở thư mục này (DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_ROOT_PASSWORD).
Đổi xong chạy: `docker compose down -v && docker compose up --build`.

## Cấu trúc
```
taskflow/
├── backend-overlay/   code Taskflow (controller, model, migration, seeder, routes, openapi)
├── backend/           (tự sinh sau setup) project Laravel hoàn chỉnh
├── frontend/          React + Vite + Dockerfile + nginx.conf
├── docker-compose.yml
├── .env.example
└── setup.sh / setup.bat
```

> Thư viện PHP (vendor/) được cài bên trong Docker khi build, nên trên máy bạn sẽ không có thư mục vendor/.

## Chạy không dùng Docker
- Backend: trong `backend/` chạy `composer install`, copy `.env.example` thành `.env` rồi `php artisan key:generate`, sửa `.env` (DB_HOST=127.0.0.1, DB_DATABASE, DB_USERNAME, DB_PASSWORD), rồi `php artisan migrate --seed && php artisan serve`
- Frontend: trong `frontend/` chạy `npm install && npm run dev` (http://localhost:5173, tự proxy /api sang :8000)

## API
Xem `backend-overlay/public/openapi.yaml` hoặc trang /docs.

## Deploy miễn phí lên cloud (Neon + Render)

Tổ hợp này miễn phí lâu dài, không giới hạn theo ngày như trial của Railway hay Postgres free của Render:
- **Neon** – PostgreSQL free vĩnh viễn (0.5GB) → dùng làm database.
- **Render** – Web Service free (Docker) → chạy backend Laravel.
- **Render** – Static Site free (luôn bật, không ngủ) → host frontend React.

> Lưu ý: Web Service free của Render sẽ "ngủ" sau 15 phút không ai truy cập và mất khoảng 30-60s để bật lại ở lượt request kế tiếp — bình thường với dự án demo/nộp bài.

### Bước 1 — Tạo database trên Neon
1. Vào https://neon.tech, đăng ký (email hoặc GitHub), tạo project mới.
2. Vào **Connection Details**, chọn **Pooled connection**, ghi lại: host, database, user, password, port (5432).

### Bước 2 — Đẩy code lên GitHub
```bash
git init && git add . && git commit -m "Taskflow"
# tạo repo trên GitHub rồi:
git remote add origin <URL repo>
git push -u origin main
```

### Bước 3 — Deploy backend (Render Web Service)
1. https://render.com → **New → Web Service** → chọn repo, **Root Directory: `backend`**, **Runtime: Docker**.
2. Chọn plan **Free**.
3. Thêm biến môi trường:

| Biến | Giá trị |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | chạy `php artisan key:generate --show` trên máy để lấy |
| `APP_URL` | tạm để trống, điền lại sau khi có domain frontend (bước 4) |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | host lấy từ Neon |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | database lấy từ Neon |
| `DB_USERNAME` | user lấy từ Neon |
| `DB_PASSWORD` | password lấy từ Neon |
| `DB_SSLMODE` | `require` (Neon bắt buộc SSL) |
| `DB_SEED` | `true` (chỉ nạp seed nếu bảng users rỗng — có thể để `false` sau lần đầu) |

4. Bấm **Deploy**. Render tự build Dockerfile, chờ database, chạy migrate. Bạn sẽ nhận domain dạng `https://taskflow-backend.onrender.com`.
5. Kiểm tra: mở `https://taskflow-backend.onrender.com/docs` (Swagger) hoặc `/api/auth/login`.

### Bước 4 — Deploy frontend (Render Static Site)
1. **New → Static Site** → chọn cùng repo, **Root Directory: `frontend`**.
2. **Build Command:** `npm install && npm run build`
3. **Publish Directory:** `dist`
4. Thêm biến môi trường (chỉ dùng lúc build):

| Biến | Giá trị |
|---|---|
| `VITE_API_URL` | domain backend ở bước 3, ví dụ `https://taskflow-backend.onrender.com` (không có `/` ở cuối) |

5. Deploy xong, bạn có domain dạng `https://taskflow.onrender.com` — đây là địa chỉ gửi cho người khác dùng thử.
6. (Tuỳ chọn) Quay lại service backend, cập nhật `APP_URL` thành domain frontend này rồi **Manual Deploy** lại để dùng đúng URL trong log/email.

### Kiểm tra sau khi deploy
- Mở domain frontend, đăng nhập bằng tài khoản seed: `demo@taskflow.test` / `password123`.
- Nếu trang trắng: F12 → Console xem lỗi, thường do `VITE_API_URL` sai hoặc thiếu.
- Nếu login báo lỗi mạng: kiểm tra backend đã "Live" (không phải "Deploy failed") trong Render Dashboard, xem tab **Logs**.
