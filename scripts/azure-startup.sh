#!/usr/bin/env bash
set -euo pipefail

cd /home/site/wwwroot

: "${APP_KEY:?Configure APP_KEY in Azure environment variables.}"
: "${LARAVEL_STORAGE_PATH:?Set LARAVEL_STORAGE_PATH=/home/conformidad-storage in Azure.}"

if [[ "$LARAVEL_STORAGE_PATH" != /home/conformidad-storage ]]; then
    echo "Expected the persistent storage path /home/conformidad-storage." >&2
    exit 1
fi

mkdir -p \
    "$LARAVEL_STORAGE_PATH/app/public" \
    "$LARAVEL_STORAGE_PATH/app/private" \
    "$LARAVEL_STORAGE_PATH/app/temp" \
    "$LARAVEL_STORAGE_PATH/framework/cache/data" \
    "$LARAVEL_STORAGE_PATH/framework/sessions" \
    "$LARAVEL_STORAGE_PATH/framework/views" \
    "$LARAVEL_STORAGE_PATH/logs" \
    bootstrap/cache

chmod -R ug+rwX "$LARAVEL_STORAGE_PATH" bootstrap/cache

if [[ ! -L public/storage ]]; then
    if [[ -e public/storage ]]; then
        echo "public/storage already exists and is not a symlink; preserve it and review manually." >&2
        exit 1
    fi
    php artisan storage:link --no-interaction
fi

php artisan config:cache --no-interaction

cp scripts/azure-nginx.conf /etc/nginx/sites-available/default
nginx -t
service nginx reload
