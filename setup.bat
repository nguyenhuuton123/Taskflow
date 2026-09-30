@echo off
cd /d "%~dp0"
echo ==============================
echo   Taskflow - cai dat va chay
echo ==============================
echo.

docker --version >nul 2>&1
if errorlevel 1 goto nodocker
docker info >nul 2>&1
if errorlevel 1 goto dockeroff

if exist backend\app\Http\Controllers\TaskController.php goto haveback

echo [1/2] Dang tai bo khung Laravel - khoang 1 phut, can Internet...
if exist backend rmdir /s /q backend
docker run --rm -v "%cd%":/work -w /work -e COMPOSER_PROCESS_TIMEOUT=0 composer:2 sh -c "composer create-project laravel/laravel:^12.0 backend --prefer-dist --no-interaction --no-install --no-scripts && cd backend && composer config platform.php 8.3.0 && composer require laravel/sanctum:^4.0 --no-install --no-interaction --no-scripts"
if errorlevel 1 goto fail
del backend\database\migrations\0001_01_01_000000_create_users_table.php
xcopy backend-overlay backend /E /Y /I /H /Q
if errorlevel 1 goto fail

:haveback
if not exist .env copy .env.example .env >nul
echo.
echo [2/2] Khoi dong ung dung. Lan dau se cai thu vien va build nen mat vai phut.
echo Khi thay dong "Server running" thi mo trinh duyet: http://localhost:3000
echo Nhan Ctrl+C de dung.
echo.
docker compose up --build
goto end

:nodocker
echo LOI: Chua cai Docker. Tai Docker Desktop tai https://www.docker.com/products/docker-desktop
goto end

:dockeroff
echo LOI: Docker Desktop chua chay. Hay mo Docker Desktop, doi no khoi dong xong roi chay lai file nay.
goto end

:fail
echo.
echo LOI: Cai dat that bai. Xem thong bao phia tren.

:end
echo.
pause
