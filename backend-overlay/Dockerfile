FROM php:8.3-cli-alpine

ENV COMPOSER_PROCESS_TIMEOUT=0 COMPOSER_ALLOW_SUPERUSER=1

RUN apk add --no-cache git unzip postgresql-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Cài dependency trước để tận dụng cache của Docker
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["docker-entrypoint.sh"]
# Render cấp cổng qua biến PORT; ở máy bạn (docker-compose) PORT không được set nên dùng 8000
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
