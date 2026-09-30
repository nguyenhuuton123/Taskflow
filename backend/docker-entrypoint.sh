#!/bin/sh
set -e
cd /var/www/html

DB_CONNECTION=${DB_CONNECTION:-mysql}

# Sinh APP_KEY nếu chưa cung cấp
if [ -z "$APP_KEY" ]; then
  APP_KEY=$(php artisan key:generate --show)
  export APP_KEY
fi

# Ghi .env từ biến môi trường để artisan đọc nhất quán
cat > .env <<ENV
APP_NAME=Taskflow
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost:3000}
LOG_CHANNEL=stderr
DB_CONNECTION=${DB_CONNECTION}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-$([ "$DB_CONNECTION" = "pgsql" ] && echo 5432 || echo 3306)}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_SSLMODE=${DB_SSLMODE:-prefer}
FRONTEND_URL=${FRONTEND_URL:-*}
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
ENV

# Chờ database sẵn sàng nhận kết nối (đúng DSN theo từng loại DB)
if [ "$DB_CONNECTION" = "pgsql" ]; then
  DSN="pgsql:host=${DB_HOST};port=${DB_PORT:-5432};dbname=${DB_DATABASE};sslmode=${DB_SSLMODE:-require}"
else
  DSN="mysql:host=${DB_HOST};port=${DB_PORT:-3306};dbname=${DB_DATABASE}"
fi
until php -r "new PDO('$DSN', getenv('DB_USERNAME'), getenv('DB_PASSWORD'));" 2>/dev/null; do
  echo "Đang chờ database ($DB_CONNECTION)..."
  sleep 2
done

php artisan migrate --force

# Nạp dữ liệu mẫu một lần duy nhất (khi chưa có user nào)
if [ "$DB_SEED" = "true" ] && [ "$(php artisan tinker --execute='echo \App\Models\User::count();' | tr -d '[:space:]')" = "0" ]; then
  php artisan db:seed --force
fi

exec "$@"
