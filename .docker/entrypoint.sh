#!/bin/bash
set -e

# L'image prod n'embarque que le vendor --no-dev : tout autre APP_ENV injecté
# au runtime (env_file, env du pod) casserait le kernel — on le force ici
export APP_ENV=prod APP_DEBUG=0

# Sortir proprement si un signal d'arrêt arrive pendant le warmup
# (bash PID 1 ignorerait SIGTERM par défaut et le serveur démarrerait quand même)
stop=0
trap 'stop=1' SIGINT SIGTERM

# Répertoires d'état de Caddy sous /tmp (vierge à chaque démarrage)
mkdir -p "${XDG_CONFIG_HOME:-/tmp/caddy-config}" "${XDG_DATA_HOME:-/tmp/caddy-data}"

# Si un volume monté masque le cache embarqué dans l'image, le régénérer avant de servir
env_dir="var/cache/${APP_ENV:-prod}"
if [ -z "$(ls -A "$env_dir" 2>/dev/null)" ]; then
    php bin/console cache:warmup &
    warmup_pid=$!
    wait $warmup_pid || true
    if [ "$stop" = 1 ]; then
        kill $warmup_pid 2>/dev/null || true
        exit 143
    fi
fi

exec frankenphp run --config /etc/frankenphp/Caddyfile "$@"
