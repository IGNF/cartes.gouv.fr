#!/bin/bash
set -e

echo "🚀 Starting Symfony application with FrankenPHP"

php bin/console cache:clear
exec /usr/local/bin/frankenphp run --config /etc/frankenphp/Caddyfile
