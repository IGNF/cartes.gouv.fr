#!/bin/bash

# Exit on error
set -e

# # Symfony application initialization
# echo "Initializing Symfony application..."

# # Ensure proper permissions (only if running as root)
# if [ "$(id -u)" = "0" ]; then
#     chown -R www-data:www-data /opt/cartesgouvfr-site/var/
# else
#     # Running as non-root, ensure we can write to var directory
#     chmod -R 777 /opt/cartesgouvfr-site/var/ 2>/dev/null || true
# fi

# # Clear and warm up cache for production
# if [ "$APP_ENV" = "prod" ]; then
#     echo "Production environment detected - clearing cache..."
#     php bin/console cache:clear --env=prod --no-debug
#     php bin/console cache:warmup --env=prod --no-debug

#     # Optimize autoloader
#     # composer dump-autoload --optimize --no-dev --classmap-authoritative
# else
#     echo "Development environment detected - clearing cache..."
#     php bin/console cache:clear
# fi

# # Run any database migrations if needed
# # Uncomment if you use Doctrine migrations
# # php bin/console doctrine:migrations:migrate --no-interaction

# echo "Symfony application initialized successfully!"

# Start supervisor (which will manage Caddy and PHP-FPM)
echo "Starting Caddy and PHP-FPM via Supervisor..."
php bin/console cache:clear
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
