# syntax=docker/dockerfile:1-labs@sha256:7d49dad25a050e14338ba7028b0460243f9d911dedc160a8fe20c34738fef3af
#----------------------------------------------------------------------
# Images épinglées par digest (tag + digest maintenus par Renovate,
# sauf php et frankenphp qui sont couplés entre eux)
#----------------------------------------------------------------------
ARG project_dir=/opt/cartesgouvfr-site

ARG composer_image=docker.io/composer/composer:2-bin@sha256:cf313f79f608ebab80220796327f341ae663b9fa8065c73c6148c9b67f0b13b3
# aligné sur .nvmrc
ARG node_alpine_image=docker.io/library/node:24.14.0-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114
# binaire node glibc pour la base Ubuntu
ARG node_slim_image=docker.io/library/node:24.14.0-slim@sha256:d8e448a56fc63242f70026718378bd4b00f8c82e78d20eefb199224a4d8e33d8
ARG ubuntu_image=docker.io/library/ubuntu:24.04@sha256:4fbb8e6a8395de5a7550b33509421a2bafbc0aab6c06ba2cef9ebffbc7092d90

# php_version pilote le tag de l'image php (stage deps_php) et le dépôt deb ;
# couplé à frankenphp_version (bump PHP = changer les deux)
ARG php_version=8.2
ARG frankenphp_version=1.12.4+php82-1

# Stages alias : COPY --from n'interpole pas les ARG, contrairement à FROM
FROM ${composer_image} AS composer_bin
FROM ${node_slim_image} AS node_dist

#----------------------------------------------------------------------
# Installer les dépendances PHP dans une couche dédiée
#----------------------------------------------------------------------
FROM docker.io/library/php:${php_version}-cli@sha256:90db578653480744d7137d42e26055bc12c75099eab0cbb38bc8da79a94b1443 AS deps_php
COPY --from=composer_bin /composer /usr/bin/composer
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get -qq update && apt-get -qq install -y git unzip

ARG project_dir
WORKDIR ${project_dir}
ENV APP_ENV=prod \
    COMPOSER_CACHE_DIR=/var/cache/composer

# Couche dépendances composer mise en cache grâce aux fichiers composer.json, composer.lock et symfony.lock
COPY composer.json composer.lock symfony.lock ./
RUN --mount=type=cache,target=/var/cache/composer \
    composer install --prefer-dist --no-dev --no-scripts --no-autoloader --no-progress

# Copie du reste du projet pour générer l'autoloader et installer les assets
COPY . .
RUN composer dump-autoload --no-dev --optimize \
    && php bin/console assets:install \
    && composer symfony-routing-dump

#----------------------------------------------------------------------
# Installer les dépendances JavaScript/nodejs dans une couche dédiée
#----------------------------------------------------------------------
FROM ${node_alpine_image} AS deps_nodejs_build
ARG project_dir
WORKDIR ${project_dir}

RUN apk add --no-cache git

# Couche dépendances mise en cache grâce aux fichiers package.json et package-lock.json
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copie du reste du projet pour générer le build Vite (public/build)
COPY .env vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY --exclude=index --exclude=logs --exclude=FETCH_HEAD --exclude=ORIG_HEAD .git .git
COPY assets assets

# Récupération des artefacts PHP consommés par le build Vite (cf. assets/modules/Routing.ts)
COPY --from=deps_php ${project_dir}/vendor/friendsofsymfony/jsrouting-bundle/Resources/js vendor/friendsofsymfony/jsrouting-bundle/Resources/js
COPY --from=deps_php ${project_dir}/var/cache/fosRoutes.json var/cache/fosRoutes.json
RUN npm run build

#----------------------------------------------------------------------
# node_modules de production (runtime du scraper), indépendant des autres stages
#----------------------------------------------------------------------
FROM ${node_alpine_image} AS deps_nodejs_runtime
ARG project_dir
WORKDIR ${project_dir}

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --ignore-scripts

#----------------------------------------------------------------------
# Créer l'image de base de l'application
#----------------------------------------------------------------------
FROM ${ubuntu_image} AS base_app

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=fr_FR.UTF-8

# Conserver les archives apt pour les mounts de cache BuildKit
RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

#----------------------------------------------------------------------
# Locale fr_FR.UTF-8 (https://stackoverflow.com/a/41797247) + outils communs
#----------------------------------------------------------------------
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get -qq update && apt-get -qq install --no-install-recommends -y \
    locales \
    ca-certificates \
    unzip zip \
    curl wget \
    rclone \
    && sed -i -e 's/# en_US.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure --frontend=noninteractive locales \
    && update-locale LANG=fr_FR.UTF-8

#------------------------------------------------------------------------
# Installer FrankenPHP et PHP (ZTS) depuis le dépôt deb officiel
# en savoir plus : https://frankenphp.dev/ (section "deb Packages")
# Le binaire frankenphp embarque déjà : curl, dom, mbstring, opcache,
# openssl, simplexml, sodium, xml, zlib, etc.
#------------------------------------------------------------------------
ARG php_version
ARG frankenphp_version
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    pkg_version=$(echo "${php_version}" | tr -d .) \
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
    && rm -rf /var/lib/frankenphp/.local/share/caddy \
    && rm -f /usr/local/share/ca-certificates/*Caddy* \
    && update-ca-certificates --fresh

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

# Copies du moins au plus volatile ; --link rebase les couches indépendamment
# de base_app. nodejs requis au runtime pour bin/articles-scraper.mjs (cron)
COPY --link --from=node_dist /usr/local/bin/node /usr/local/bin/node
COPY --link --from=deps_nodejs_runtime ${project_dir}/node_modules node_modules
COPY --link --from=deps_php ${project_dir}/vendor vendor
COPY --link --from=deps_php ${project_dir}/public/bundles public/bundles
COPY --link --from=deps_nodejs_build ${project_dir}/public/build public/build
COPY --exclude=.git --exclude=var . .

ENV APP_ENV=prod
ENV APP_DEBUG=0

# L'image étant immutable, inutile de revalider les timestamps des fichiers PHP à chaque requête
RUN echo "opcache.validate_timestamps=0" > /etc/php-zts/conf.d/99-opcache-prod.ini

# Pré-générer le cache Symfony dans l'image, APRÈS la copie de public/build
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

COPY --from=composer_bin /composer /usr/bin/composer

ARG project_dir
WORKDIR ${project_dir}
VOLUME ${project_dir}

# Installer xdebug (le paquet active zend_extension via 15-xdebug.ini)
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get -qq update && apt-get -qq install --no-install-recommends -y \
    php-zts-xdebug \
    git

COPY .docker/php-xdebug.ini /etc/php-zts/conf.d/99-xdebug-app.ini

#----------------------------------------------------------------------
# Installation de nodejs depuis l'image officielle (glibc requis, cf. prod)
# https://stackoverflow.com/a/63108753
#----------------------------------------------------------------------
COPY --from=node_dist /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node_dist /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && npm i -g npm yarn pnpm

ENV NPM_CONFIG_CACHE="${project_dir}/var/.npm"
RUN mkdir -p "$NPM_CONFIG_CACHE"
ENV COMPOSER_HOME="${project_dir}/var/composer"
RUN mkdir -p "$COMPOSER_HOME"

EXPOSE 8000
CMD [ "frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile" ]
