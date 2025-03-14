#----------------------------------------------------------------------
# Installer les dépendances PHP à partir de composer.json dans une couche dédiée
#----------------------------------------------------------------------
ARG registry=docker.io
FROM ${registry}/library/composer:latest AS deps_php

RUN mkdir -p /opt/cartesgouvfr-site
WORKDIR /opt/cartesgouvfr-site
# COPY composer.json composer.lock symfony.lock ./
# COPY patches ./patches
# COPY bin ./bin
COPY . .
ENV APP_ENV=prod
RUN APP_ENV=prod composer install --prefer-dist --no-dev --no-cache --optimize-autoloader --no-progress \
    && APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear \
    && php bin/console assets:install \
    && composer symfony-routing-dump

FROM ${registry}/library/node:20-alpine AS deps_nodejs
RUN mkdir -p /opt/cartesgouvfr-site
WORKDIR /opt/cartesgouvfr-site
# COPY . /opt/cartesgouvfr-site
# COPY . .
COPY --from=deps_php /opt/cartesgouvfr-site .
COPY --from=deps_php /opt/cartesgouvfr-site/var var
COPY --from=deps_php /usr/local/bin/php /usr/local/bin/php
RUN yarn install --production --frozen-lockfile \
    && yarn build \
    && yarn cache clean
# \
# && APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear

#----------------------------------------------------------------------
# Créer l'image de l'application
#----------------------------------------------------------------------
FROM ${registry}/library/ubuntu:24.04 AS prod

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
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#----------------------------------------------------------------------
# Install common tools
#----------------------------------------------------------------------
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    unzip zip \
    curl wget \
    && rm -rf /var/lib/apt/lists/*

#------------------------------------------------------------------------
# Configure https://packages.sury.org/php/ to get latests PHP versions
#------------------------------------------------------------------------
RUN apt-get update \
    && apt-get install --no-install-recommends -y gnupg2 software-properties-common \
    && add-apt-repository -y ppa:ondrej/php \
    && apt-get remove -y software-properties-common \
    && rm -rf /var/lib/apt/lists/*

#----------------------------------------------------------------------
# Install Apache, PHP and its extensions
#----------------------------------------------------------------------
ARG php_version=8.2
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
    apache2 php${php_version} libapache2-mod-php${php_version} \
    php${php_version}-opcache \
    php${php_version}-xml \
    php${php_version}-zip \
    php${php_version}-curl \
    php${php_version}-intl \
    php${php_version}-sqlite3 \
    && rm -rf /var/lib/apt/lists/*

#------------------------------------------------------------------------
# Add helper script to start apache
# (see https://github.com/docker-library/php)
#------------------------------------------------------------------------
COPY .docker/apache2-foreground /usr/local/bin/apache2-foreground
RUN chmod +x /usr/local/bin/apache2-foreground

#------------------------------------------------------------------------
# Create apache2 repository
# (see https://github.com/docker-library/php)
#------------------------------------------------------------------------
RUN mkdir -p /var/run/apache2 && chown -R www-data:www-data /var/run/apache2 \
    && mkdir -p /var/lock/apache2 && chown -R www-data:www-data /var/lock/apache2 \
    && mkdir -p /var/log/apache2 && chown -R www-data:www-data /var/log/apache2


#------------------------------------------------------------------------
# Redirects logs to stdout / stderr
# (see https://github.com/docker-library/php)
#------------------------------------------------------------------------
RUN ln -sfT /dev/stderr "/var/log/apache2/error.log" \
    && ln -sfT /dev/stdout "/var/log/apache2/access.log" \
    && ln -sfT /dev/stdout "/var/log/apache2/other_vhosts_access.log" \
    && chown www-data:www-data /var/log/apache2/*.log


#----------------------------------------------------------------------
# Configure PHP
#----------------------------------------------------------------------
COPY .docker/php.ini /etc/php/${php_version}/apache2/conf.d/99-app.ini
COPY .docker/php.ini /etc/php/${php_version}/cli/conf.d/99-app.ini

#----------------------------------------------------------------------
# Configure apache
#----------------------------------------------------------------------
COPY .docker/apache-ports.conf /etc/apache2/ports.conf
COPY .docker/apache-security.conf /etc/apache2/conf-enabled/security.conf
COPY .docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite remoteip

#----------------------------------------------------------------------
# Install cartesgouvfr-site
#----------------------------------------------------------------------
# COPY --chown=www-data:www-data . /opt/cartesgouvfr-site
COPY . /opt/cartesgouvfr-site
WORKDIR /opt/cartesgouvfr-site
COPY --from=deps_php /opt/cartesgouvfr-site/vendor vendor
COPY --from=deps_php /opt/cartesgouvfr-site/public/bundles public/bundles
COPY --from=deps_nodejs /opt/cartesgouvfr-site/public/build public/build

RUN mkdir -p /opt/cartesgouvfr-site/var \
    && chown -R www-data:www-data /opt/cartesgouvfr-site/var/

USER www-data

VOLUME /opt/cartesgouvfr-site/var

ENV APP_ENV=prod
ENV APP_DEBUG=0

EXPOSE 8000
CMD [ "/bin/bash", ".docker/start.sh" ]

# docker compose -f compose.prod.yml up -d --build --remove-orphans --force-recreate --pull=always