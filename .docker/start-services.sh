#!/bin/bash
set -e

echo "🚀 Starting Symfony application with Caddy + PHP-FPM"

# Symfony application initialization
echo "Initializing Symfony application..."

# Ensure proper permissions (only if running as root)
# if [ "$(id -u)" = "0" ]; then
#     chown -R www-data:www-data /opt/cartesgouvfr-site/var/
# else
#     # Running as non-root, ensure we can write to var directory
#     chmod -R 777 /opt/cartesgouvfr-site/var/ 2>/dev/null || true
# fi

# Clear and warm up cache

# if [ "$APP_ENV" = "prod" ]; then
#     echo "Production environment detected - clearing cache..."
#     php bin/console cache:clear --env=prod --no-debug
#     php bin/console cache:warmup --env=prod --no-debug
#     composer dump-autoloader --optimize --no-dev --classmap-authoritative
# else
#     echo "Development environment detected - clearing cache..."
#     php bin/console cache:clear
# fi

echo "Symfony application initialized successfully!"

# Start PHP-FPM in the background
echo "Starting PHP-FPM..."
/usr/sbin/php-fpm8.2 --nodaemonize --fpm-config /etc/php/8.2/fpm/php-fpm.conf &
PHP_FPM_PID=$!

# Give PHP-FPM a moment to start and create the socket
sleep 3

# Check if PHP-FPM started successfully
if ! kill -0 $PHP_FPM_PID 2>/dev/null; then
    echo "❌ PHP-FPM failed to start"
    exit 1
fi

echo "✅ PHP-FPM started successfully (PID: $PHP_FPM_PID)"

# Start Caddy in the foreground (this keeps the container running)
php bin/console cache:clear
echo "Starting Caddy..."
exec /usr/bin/caddy run --config /etc/caddy/Caddyfile
