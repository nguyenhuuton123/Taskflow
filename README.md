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
