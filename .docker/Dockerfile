# syntax=docker/dockerfile:1-labs
#----------------------------------------------------------------------
# Installer les dépendances PHP dans une couche dédiée
#----------------------------------------------------------------------
ARG project_dir=/opt/cartesgouvfr-site
ARG registry=docker.io
FROM ${registry}/library/composer:latest AS deps_php

ARG project_dir
RUN mkdir -p ${project_dir}
WORKDIR ${project_dir}
COPY . .
ENV APP_ENV=prod
RUN APP_ENV=prod composer install --prefer-dist --no-dev --no-cache --optimize-autoloader --no-progress \
    && APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear \
    && php bin/console assets:install \
    && composer symfony-routing-dump

#----------------------------------------------------------------------
# Installer les dépendances JavaScript/nodejs dans une couche dédiée
#----------------------------------------------------------------------
FROM ${registry}/library/node:20-alpine AS deps_nodejs
ARG project_dir
RUN mkdir -p ${project_dir}
WORKDIR ${project_dir}

RUN apk add --no-cache git

COPY --from=deps_php ${project_dir} .
RUN yarn install --production --frozen-lockfile \
    && yarn build \
    && yarn cache clean

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
    unzip zip \
    curl wget \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#------------------------------------------------------------------------
# Configurer le dépôt APT de PHP : https://packages.sury.org/php/
#------------------------------------------------------------------------
RUN apt-get -qq update \
    && apt-get -qq install --no-install-recommends -y gnupg2 software-properties-common \
    && add-apt-repository -y ppa:ondrej/php \
    && apt-get remove -y software-properties-common \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#----------------------------------------------------------------------
# Installer Apache, PHP et ses extensions
#----------------------------------------------------------------------
ARG php_version=8.2
RUN apt-get -qq update \
    && apt-get -qq install --no-install-recommends -y \
    apache2 php${php_version} libapache2-mod-php${php_version} \
    php${php_version}-cli \
    php${php_version}-opcache \
    php${php_version}-xml \
    php${php_version}-zip \
    php${php_version}-curl \
    php${php_version}-intl \
    php${php_version}-xsl \
    php${php_version}-sqlite3 \
    ### APCu
    php${php_version}-dev \
    php-pear \
    gcc make \
    && pecl install apcu \
    && echo "extension=apcu.so" > /etc/php/${php_version}/mods-available/apcu.ini \
    && ln -s /etc/php/${php_version}/mods-available/apcu.ini /etc/php/${php_version}/apache2/conf.d/20-apcu.ini \
    && ln -s /etc/php/${php_version}/mods-available/apcu.ini /etc/php/${php_version}/cli/conf.d/20-apcu.ini \
    && apt-get -qq purge -y php-pear php${php_version}-dev gcc make \
    ### APCu
    && apt-get -qq autoremove -y \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#------------------------------------------------------------------------
# Ajout script helper pour démarrer apache
# (cf. https://github.com/docker-library/php)
#------------------------------------------------------------------------
COPY .docker/apache2-foreground /usr/local/bin/apache2-foreground
RUN chmod +x /usr/local/bin/apache2-foreground

#------------------------------------------------------------------------
# Créer les dossiers pour apache2
# (cf. https://github.com/docker-library/php)
#------------------------------------------------------------------------
RUN mkdir -p /var/run/apache2 && chown -R www-data:www-data /var/run/apache2 \
    && mkdir -p /var/lock/apache2 && chown -R www-data:www-data /var/lock/apache2 \
    && mkdir -p /var/log/apache2 && chown -R www-data:www-data /var/log/apache2

#------------------------------------------------------------------------
# Rediriger les logs vers stdout / stderr
# (cf. https://github.com/docker-library/php)
#------------------------------------------------------------------------
RUN ln -sfT /dev/stderr "/var/log/apache2/error.log" \
    && ln -sfT /dev/stdout "/var/log/apache2/access.log" \
    && ln -sfT /dev/stdout "/var/log/apache2/other_vhosts_access.log" \
    && chown www-data:www-data /var/log/apache2/*.log

#----------------------------------------------------------------------
# Configurer PHP
#----------------------------------------------------------------------
COPY .docker/php.ini /etc/php/${php_version}/apache2/conf.d/99-app.ini
COPY .docker/php.ini /etc/php/${php_version}/cli/conf.d/99-app.ini

#----------------------------------------------------------------------
# Configurer apache
#----------------------------------------------------------------------
COPY .docker/apache-ports.conf /etc/apache2/ports.conf
COPY .docker/apache-security.conf /etc/apache2/conf-enabled/security.conf
COPY .docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite remoteip

#----------------------------------------------------------------------
# Installer l'application pour production
#----------------------------------------------------------------------
FROM base_app AS prod
ARG project_dir
WORKDIR ${project_dir}
COPY --exclude=.git --exclude=var . .
COPY --from=deps_php ${project_dir}/vendor vendor
COPY --from=deps_php ${project_dir}/public/bundles public/bundles
COPY --from=deps_nodejs ${project_dir}/public/build public/build

RUN mkdir -p ${project_dir}/var \
    && chown -R www-data:www-data ${project_dir}/var/

USER www-data

VOLUME ${project_dir}/var

ENV APP_ENV=prod
ENV APP_DEBUG=0

# Vérifier que le fichier de cache de vite est généré (par le cache:clear dans application.sh), sinon le site n'a pas de style
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD test -s var/cache/prod/pentatrion_vite.cache.php || exit 1

EXPOSE 8000
CMD [ "/bin/bash", ".docker/application.sh" ]

#----------------------------------------------------------------------
# Installer l'application pour développement
#----------------------------------------------------------------------
FROM base_app AS dev

COPY --from=composer /usr/bin/composer /usr/bin/composer

ARG project_dir
WORKDIR ${project_dir}
VOLUME ${project_dir}

RUN chmod -R 777 /var/run/apache2 /var/log/apache2

# Installer xdebug
ARG php_version=8.2
RUN apt-get -qq update && apt-get -qq install -y \
    php${php_version}-dev \
    php-pear \
    php-xml \
    zlib1g-dev \
    git \
    && apt-get -qq clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY .docker/php-xdebug.ini /etc/php/${php_version}/apache2/conf.d/20-xdebug.ini
RUN pear config-set php_ini /etc/php/${php_version}/cli/conf.d/99-app.ini \
    && pecl install xdebug \
    && echo "\nzend_extension=$(find /usr/lib/php/ -name xdebug.so)" >> /etc/php/${php_version}/apache2/conf.d/20-xdebug.ini

COPY .docker/php.ini /etc/php/${php_version}/apache2/conf.d/99-app.ini
COPY .docker/php.ini /etc/php/${php_version}/cli/conf.d/99-app.ini

#----------------------------------------------------------------------
# Installation de nodejs depuis l'image officielle
# https://github.com/nodejs/docker-node/blob/main/18/bullseye/Dockerfile
# https://stackoverflow.com/a/63108753
#----------------------------------------------------------------------
COPY --from=node:20-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node:20-slim /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && npm i -g npm yarn pnpm

EXPOSE 8000
CMD [ "/bin/bash", "apache2-foreground" ]