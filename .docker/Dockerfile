# syntax=docker/dockerfile:1-labs
#----------------------------------------------------------------------
# Installer les dépendances PHP dans une couche dédiée
#----------------------------------------------------------------------
ARG project_dir=/opt/cartesgouvfr-site
ARG registry=docker.io
ARG php_version=8.2
FROM ${registry}/library/php:${php_version}-cli AS deps_php
COPY --from=composer/composer:2-bin /composer /usr/bin/composer
RUN apt-get -qq update && apt-get -qq install -y git unzip

ARG project_dir
RUN mkdir -p ${project_dir}
WORKDIR ${project_dir}
COPY . .
ENV APP_ENV=prod
RUN APP_ENV=prod composer install --prefer-dist --no-dev --no-cache --optimize-autoloader --no-progress \
    && php bin/console assets:install \
    && composer symfony-routing-dump

#----------------------------------------------------------------------
# Installer les dépendances JavaScript/nodejs dans une couche dédiée
#----------------------------------------------------------------------
FROM ${registry}/library/node:24-alpine AS deps_nodejs_build
ARG project_dir
RUN mkdir -p ${project_dir}
WORKDIR ${project_dir}

RUN apk add --no-cache git

COPY --from=deps_php ${project_dir} .
RUN npm ci \
    && npm run build \
    && npm cache clean --force

FROM ${registry}/library/node:24-alpine AS deps_nodejs_runtime
ARG project_dir
RUN mkdir -p ${project_dir}
WORKDIR ${project_dir}

COPY --from=deps_php ${project_dir} .
RUN npm ci --omit=dev --ignore-scripts

#----------------------------------------------------------------------
# Créer l'image de base de l'application
#----------------------------------------------------------------------
FROM ${registry}/library/ubuntu:24.04 AS base_app

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=fr_FR.UTF-8

#----------------------------------------------------------------------
# Configurer "fr_FR.UTF-8" comme locale
# en savoir plus : https://stackoverflow.com/a/41797247
#----------------------------------------------------------------------
RUN apt-get -qq update && DEBIAN_FRONTEND=noninteractive apt-get -qq install --no-install-recommends -y locales \
    && sed -i -e 's/# en_US.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure --frontend=noninteractive locales \
    && update-locale LANG=fr_FR.UTF-8 \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#----------------------------------------------------------------------
# Installer les outils communs
#----------------------------------------------------------------------
RUN apt-get -qq update \
    && apt-get -qq install --no-install-recommends -y \
    ca-certificates \
    unzip zip \
    curl wget \
    rclone \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#------------------------------------------------------------------------
# Installer FrankenPHP et PHP (ZTS) depuis le dépôt deb officiel
# en savoir plus : https://frankenphp.dev/ (section "deb Packages")
# Le binaire frankenphp embarque déjà : curl, dom, mbstring, opcache,
# openssl, simplexml, sodium, xml, zlib, etc.
#------------------------------------------------------------------------
ARG php_version
# Épingler la version de frankenphp (dépôt tiers) pour la reproductibilité des builds
ARG frankenphp_version=1.12.4+php82-1
RUN pkg_version=$(echo "${php_version}" | tr -d .) \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL "https://pkg.henderkes.com/api/packages/${pkg_version}/debian/repository.key" -o "/etc/apt/keyrings/static-php${pkg_version}.asc" \
    && echo "deb [signed-by=/etc/apt/keyrings/static-php${pkg_version}.asc] https://pkg.henderkes.com/api/packages/${pkg_version}/debian php-zts main" > "/etc/apt/sources.list.d/static-php${pkg_version}.list" \
    && apt-get -qq update \
    && apt-get -qq install --no-install-recommends -y \
    frankenphp=${frankenphp_version} \
    php-zts-cli \
    php-zts-apcu \
    php-zts-intl \
    php-zts-sqlite3 \
    php-zts-xsl \
    php-zts-zip \
    && ln -s /usr/bin/php-zts /usr/local/bin/php \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#----------------------------------------------------------------------
# Configurer PHP et FrankenPHP (Caddy)
# /etc/php-zts/conf.d est scanné par le CLI (php-zts) et par frankenphp
#----------------------------------------------------------------------
COPY .docker/php.ini /etc/php-zts/conf.d/99-app.ini
COPY .docker/Caddyfile /etc/frankenphp/Caddyfile

#----------------------------------------------------------------------
# Répertoires d'état de Caddy sous /tmp : compatibles avec un rootfs
# read-only (le chart k8s monte /tmp en emptyDir), créés au démarrage
#----------------------------------------------------------------------
ENV XDG_CONFIG_HOME=/tmp/caddy-config \
    XDG_DATA_HOME=/tmp/caddy-data

#----------------------------------------------------------------------
# Installer l'application pour production
#----------------------------------------------------------------------
FROM base_app AS prod
ARG project_dir
WORKDIR ${project_dir}
COPY --exclude=.git --exclude=var . .
COPY --from=deps_php ${project_dir}/vendor vendor
COPY --from=deps_php ${project_dir}/public/bundles public/bundles
COPY --from=deps_nodejs_build ${project_dir}/public/build public/build
COPY --from=deps_nodejs_runtime ${project_dir}/node_modules node_modules
# nodejs est nécessaire au runtime pour bin/articles-scraper.mjs (cron)
COPY --from=node:24-slim /usr/local/bin/node /usr/local/bin/node

ENV APP_ENV=prod
ENV APP_DEBUG=0

# L'image étant immutable, inutile de revalider les timestamps des fichiers PHP à chaque requête
RUN echo "opcache.validate_timestamps=0" > /etc/php-zts/conf.d/99-opcache-prod.ini

#----------------------------------------------------------------------
# Pré-générer le cache Symfony dans l'image, APRÈS la copie de public/build :
# le cache warmer de pentatrion_vite compile public/build/entrypoints.json
# (générer le cache avant le build Vite produirait un site sans styles).
# var/data est créé ici pour que les points de montage (PVC k8s, volume
# compose) héritent d'un chemin appartenant à www-data.
#----------------------------------------------------------------------
RUN mkdir -p var/data && chown -R www-data:www-data var
USER www-data
RUN php bin/console cache:clear

# Rootfs read-only en k8s : seuls var/data (PVC), var/cache et var/log
# (emptyDir) et /tmp doivent être inscriptibles ; l'entrypoint régénère
# le cache quand le montage masque celui de l'image

# --noproxy : ne jamais passer par un proxy sortant (HTTP_PROXY) pour joindre localhost
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -fsS --noproxy "*" http://localhost:8000/tableau-de-bord/health || exit 1

EXPOSE 8000
CMD [ "/bin/bash", ".docker/entrypoint.sh" ]

#----------------------------------------------------------------------
# Installer l'application pour développement
#----------------------------------------------------------------------
FROM base_app AS dev

COPY --from=composer /usr/bin/composer /usr/bin/composer

ARG project_dir
WORKDIR ${project_dir}
VOLUME ${project_dir}

# Installer xdebug (le paquet active zend_extension via 15-xdebug.ini)
RUN apt-get -qq update && apt-get -qq install --no-install-recommends -y \
    php-zts-xdebug \
    git \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY .docker/php-xdebug.ini /etc/php-zts/conf.d/99-xdebug-app.ini

#----------------------------------------------------------------------
# Installation de nodejs depuis l'image officielle
# https://github.com/nodejs/docker-node/blob/main/18/bullseye/Dockerfile
# https://stackoverflow.com/a/63108753
#----------------------------------------------------------------------
COPY --from=node:24-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node:24-slim /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && npm i -g npm yarn pnpm

ENV NPM_CONFIG_CACHE="${project_dir}/var/.npm"
RUN mkdir -p "$NPM_CONFIG_CACHE"
ENV COMPOSER_HOME="${project_dir}/var/composer"
RUN mkdir -p "$COMPOSER_HOME"

EXPOSE 8000
CMD [ "frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile" ]
