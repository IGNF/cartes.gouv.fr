# Prod image
FROM php:8.2-apache

RUN rm /etc/apt/preferences.d/no-debian-php

#----------------------------------------------------------------------
# Args and env vars
#----------------------------------------------------------------------
# ENV COMPOSER_ALLOW_SUPERUSER=1

#----------------------------------------------------------------------
# Configure locale to fr_FR.UTF-8
# see also https://stackoverflow.com/a/41797247
#----------------------------------------------------------------------
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -qy locales \
    && sed -i -e 's/# en_US.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure --frontend=noninteractive locales \
    && update-locale LANG=fr_FR.UTF-8 \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV LANG fr_FR.UTF-8

#----------------------------------------------------------------------
# PHP Configuration & Extensions
#----------------------------------------------------------------------
COPY .docker/php.ini /usr/local/etc/php/conf.d/app.ini
RUN pear config-set php_ini /usr/local/etc/php/conf.d/app.ini

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -qy libzip-dev zip libicu-dev libxslt-dev \
    && docker-php-ext-install zip \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl \
    && docker-php-ext-install xsl \
    && docker-php-ext-install opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --from=composer /usr/bin/composer /usr/bin/composer

#----------------------------------------------------------------------
# Install Nodejs
# https://github.com/nodejs/docker-node/blob/main/18/bullseye/Dockerfile
# https://stackoverflow.com/a/63108753
#----------------------------------------------------------------------
COPY --from=node:18 /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node:18 /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN npm i -g yarn pnpm npx
# RUN yarn set version stable

#----------------------------------------------------------------------
# APT Cache Cleanup
#----------------------------------------------------------------------
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#----------------------------------------------------------------------
# Configure apache
#----------------------------------------------------------------------
COPY .docker/apache-ports.conf /etc/apache2/ports.conf
COPY .docker/apache-security.conf /etc/apache2/conf-enabled/security.conf
COPY .docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite remoteip

#----------------------------------------------------------------------
# Install cartesgouvfr-site (production specific)
#----------------------------------------------------------------------
COPY --chown=www-data:www-data . /opt/cartesgouvfr-site
WORKDIR /opt/cartesgouvfr-site
USER www-data

ENV APP_ENV=prod
RUN export APP_ENV=prod \
    && APP_ENV=prod composer install --prefer-dist --no-dev --no-cache --optimize-autoloader --no-progress \
    && APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear \
    && php bin/console assets:install

RUN yarn install --production --frozen-lockfile \
    && yarn build \
    && yarn cache clean

EXPOSE 8000
