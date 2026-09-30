#!/bin/sh
# Tải bộ khung Laravel vào backend/ rồi chép code Taskflow lên trên.
# Chỉ cần Docker. Thư viện (vendor) sẽ được cài bên trong Docker khi build.
set -e
cd "$(dirname "$0")"

if [ ! -f backend/app/Http/Controllers/TaskController.php ]; then
  rm -rf backend
  docker run --rm -u "$(id -u):$(id -g)" -e COMPOSER_HOME=/tmp -e COMPOSER_PROCESS_TIMEOUT=0 -v "$PWD":/work -w /work composer:2 sh -c \
    "composer create-project laravel/laravel:^12.0 backend --prefer-dist --no-interaction --no-install --no-scripts && cd backend && composer config platform.php 8.3.0 && composer require laravel/sanctum:^4.0 --no-install --no-interaction --no-scripts"
  rm -f backend/database/migrations/0001_01_01_000000_create_users_table.php
  cp -R backend-overlay/. backend/
fi

[ -f .env ] || cp .env.example .env
echo "Xong! Chạy tiếp:  docker compose up --build"
