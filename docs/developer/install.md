# Installation et configuration

Le portail est construit sur le framework PHP Symfony. Il nécessite l'installation d'un moteur php >=8.2, nodejs >=24, npm et composer.

Ci-dessous, les instructions d'installation pour les 2 environnements testés.

## XAMPP sous Windows

### Pré-requis

1. Installer XAMPP avec PHP >=8.2
2. Configurer un alias pour apache2, rajouter dans le fichier : `C:\xampp\apache\conf\httpd.conf` :

```conf
Alias /cartes.gouv.fr "C:/xampp/htdocs/cartes.gouv.fr/public"
```

> [!WARNING]
> C'est bien avec des forward slash `/` qu'il faut écrire le chemin.

3. Installer les extensions PHP requises : `cli`, `opcache`, `xml`, `zip`, `curl`, `intl`, `xsl` et `sqlite3`
4. Installer [composer](https://getcomposer.org)
5. Installer nodejs avec [nvm-windows](https://github.com/coreybutler/nvm-windows) ou volta
6. Mettre à jour npm :

```bash
npm install --global npm
```

### Installation

1. Si nécessaire, s'assurer que le proxy est correctement configuré (par exemple au moyen des variables d'environnement `http_proxy`, `https_proxy` et `no_proxy`)

2. Cloner le dépôt dans le répertoire `C:\xampp\htdocs\cartes.gouv.fr`

3. Créer à la racine du projet un fichier nommé `.env.local` pour surcharger les informations du fichier `.env`. Se référer au fichier `.env` pour le compléter.

4. Installer les dépendances php (`composer install`)

5. Installer les dépendances Javascript (`npm clean-install`)

6. Compiler les assets (voir détails des commandes suivantes dans le fichier [package.json](./../../package.json)) :

    - `npm run dev` : lancer le serveur de développement vite avec hot-reload, pour le développement en local
    - `npm run build` : générer les assets en mode production
    - `npm run build:dev` : générer les assets en mode développement

7. Réinitialiser le cache symfony : `php bin/console cache:clear`

8. Consulter le site au : https://localhost/cartes.gouv.fr

## Docker sous Linux (recommandé)

### Pré-requis

1. Installer Docker et Docker Compose : https://docs.docker.com/engine/install/ubuntu
2. Post-installation de Docker : https://docs.docker.com/engine/install/linux-postinstall/
3. S'assurer que le daemon docker est en cours d'exécution : `sudo service docker start`

### Installation (mode dev)

1. Créer à la racine du projet un fichier nommé `.env.local` pour surcharger les informations du fichier `.env`. Se référer au fichier `.env` pour le compléter.
2. La variable `APP_ENV=dev`
3. Lancer les conteneurs docker : `docker compose up -d --build`
4. Ensuite, en se rendant dans le conteneur `php` : `docker exec -it cartesgouvfr-app-1 bash` (ajuster le nom du conteneur si besoin) :
    - `composer install`
    - `npm clean-install`
    - `npm run dev`, `npm run build` ou `npm run build:dev`
5. Réinitialiser le cache symfony : `php bin/console cache:clear`
6. Consulter le site au http://localhost:9092 ou https://cartesgouvfr-dev.docker.localhost (si traefik est configuré)

### Installation (mode prod)

1. Créer à la racine du projet un fichier nommé `.env.local` pour surcharger les informations du fichier `.env`. Se référer au fichier `.env` pour le compléter.
2. La variable `APP_ENV=prod`
3. Lancer les conteneurs docker : `docker compose -f compose.prod.yml up -d --build`
4. Consulter le site au http://localhost:9090 ou https://cartesgouvfr-prod.docker.localhost (si traefik est configuré)

> [!TIP]
>
> **Aide mémoire options docker compose**
>
> `docker compose up ...`
>
> `-f` permet de spécifier le fichier compose.yml à utiliser (il y a plusieurs fichiers, chaque fichier correspondant à un environnement)
>
> `-d` permet de créer le conteneur docker en mode "détaché" (sans logs)
>
> `--build` permet de demander la création/mise à jour de l'image docker
>
> `--remove-orphans` permet de supprimer les conteneurs orphelins (non référencés dans le fichier compose)
>
> `--force-recreate` permet de forcer la création du conteneur même si l'image n'a pas changé
>
> ---
>
> `docker compose logs -f` permet de consulter les logs des conteneurs
