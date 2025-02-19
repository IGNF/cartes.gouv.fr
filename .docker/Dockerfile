#----------------------------------------------------------------------
# Instructions communes aux env dev et prod
#----------------------------------------------------------------------
FROM php:8.2-apache AS base

RUN rm /etc/apt/preferences.d/no-debian-php

#----------------------------------------------------------------------
# Args et vars env
#----------------------------------------------------------------------
# ENV COMPOSER_ALLOW_SUPERUSER=1

#----------------------------------------------------------------------
# Configurer "fr_FR.UTF-8" comme locale
# en savoir plus : https://stackoverflow.com/a/41797247
#----------------------------------------------------------------------
RUN apt-get -qq update && DEBIAN_FRONTEND=noninteractive apt-get -qq install -y locales \
    && sed -i -e 's/# en_US.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure --frontend=noninteractive locales \
    && update-locale LANG=fr_FR.UTF-8 \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV LANG=fr_FR.UTF-8

#----------------------------------------------------------------------
# PHP : Configuration & Extensions
#----------------------------------------------------------------------
COPY .docker/php.ini /usr/local/etc/php/conf.d/app.ini
RUN pear config-set php_ini /usr/local/etc/php/conf.d/app.ini

RUN apt-get -qq update && DEBIAN_FRONTEND=noninteractive apt-get -qq install -y libzip-dev zip libicu-dev libxslt-dev \
    && docker-php-ext-install zip \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl \
    && docker-php-ext-install xsl \
    && docker-php-ext-install opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --from=composer /usr/bin/composer /usr/bin/composer

#----------------------------------------------------------------------
# Nodejs : Installation
# https://github.com/nodejs/docker-node/blob/main/18/bullseye/Dockerfile
# https://stackoverflow.com/a/63108753
#----------------------------------------------------------------------
COPY --from=node:20-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node:20-slim /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN npm i -g yarn pnpm npx
# RUN yarn set version stable

#----------------------------------------------------------------------
# Nettoyage Cache APT
#----------------------------------------------------------------------
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#----------------------------------------------------------------------
# Configurer apache
#----------------------------------------------------------------------
COPY .docker/apache-ports.conf /etc/apache2/ports.conf
COPY .docker/apache-security.conf /etc/apache2/conf-enabled/security.conf
COPY .docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite remoteip

#----------------------------------------------------------------------
# cartesgouvfr-site : Installation pour production
#----------------------------------------------------------------------
FROM base AS prod

COPY --chown=www-data:www-data . /opt/cartesgouvfr-site
WORKDIR /opt/cartesgouvfr-site
USER www-data

ENV APP_ENV=prod
RUN export APP_ENV=prod \
    && APP_ENV=prod composer install --prefer-dist --no-dev --no-cache --optimize-autoloader --no-progress \
    && APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear \
    && php bin/console assets:install \
    && composer symfony-routing-dump

RUN yarn install --production --frozen-lockfile \
    && yarn build \
    && yarn cache clean \
    && APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear \
    && rm -rf node_modules

EXPOSE 8000

#----------------------------------------------------------------------
# cartesgouvfr-site : Installation pour developpement
#----------------------------------------------------------------------
FROM base AS dev

RUN if [ "${http_proxy}" != "" ]; then \
    pear config-set http_proxy ${http_proxy} \
    ;fi

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

#----------------------------------------------------------------------
# Installation de divers outils dév
#----------------------------------------------------------------------
RUN apt-get -qq update \
    && DEBIAN_FRONTEND=noninteractive apt-get -qq install -y lsb-release gnupg2 wget curl vim git \
    && echo "deb https://packages.sury.org/php/ $(lsb_release -cs) main" > /etc/apt/sources.list.d/php.list \
    && curl -sS https://packages.sury.org/php/apt.gpg | apt-key add - \
    && apt-get -qq update \
    && DEBIAN_FRONTEND=noninteractive apt-get -qq install -y \
    unzip \
    make \
    php-dev \
    zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

VOLUME [ "/opt/cartesgouvfr-site" ]
WORKDIR /opt/cartesgouvfr-site

RUN chown -R www-data .
EXPOSE 8000

RUN useradd -ms /bin/bash dev_user
USER dev_user
