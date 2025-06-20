# Migration vers FrankenPHP

Ce document explique comment migrer l'application Symfony de Caddy + PHP-FPM vers FrankenPHP.

## Qu'est-ce que FrankenPHP ?

[FrankenPHP](https://frankenphp.dev/) est un serveur d'applications PHP moderne construit sur Caddy. Il combine les avantages de Caddy (HTTPS automatique, HTTP/2, HTTP/3) avec des fonctionnalités avancées pour PHP :

- **Mode Worker** : Garde votre application en mémoire pour des performances exceptionnelles
- **Early Hints** : Support du code de statut HTTP 103 pour un chargement plus rapide
- **Capacités temps réel** : WebSockets, Server-Sent Events natifs
- **Thread safety** : Exécution multi-threadée native

## Fichiers de migration créés

### 1. Option recommandée : Image officielle FrankenPHP

- **`.docker/Dockerfile.frankenphp-official`** : Dockerfile utilisant l'image officielle `dunglas/frankenphp:1-php8.2`
- **`.docker/Caddyfile.frankenphp-simple`** : Configuration Caddy simplifiée pour FrankenPHP
- **`compose.frankenphp-official.yml`** : Docker Compose pour cette approche

### 2. Option alternative : Build personnalisé

- **`.docker/Dockerfile.frankenphp`** : Dockerfile construisant FrankenPHP depuis Ubuntu 24.04
- **`.docker/Caddyfile.frankenphp`** : Configuration Caddy détaillée
- **`.docker/start-frankenphp.sh`** : Script de démarrage personnalisé
- **`compose.frankenphp.yml`** et **`compose.frankenphp.prod.yml`** : Docker Compose pour dev/prod

## Migration étape par étape

### 1. Option recommandée : Utiliser l'image officielle

Cette approche est plus simple et plus maintenue :

```bash
# Construire l'image de développement
docker-compose -f compose.frankenphp-official.yml build

# Démarrer le conteneur de développement
docker-compose -f compose.frankenphp-official.yml up -d

# Vérifier que l'application fonctionne
curl -I http://localhost:9092
```

### 2. Option alternative : Build personnalisé

Si vous avez des besoins spécifiques :

```bash
# Construire l'image de développement
docker-compose -f compose.frankenphp.yml build

# Démarrer le conteneur de développement
docker-compose -f compose.frankenphp.yml up -d
```

## Différences principales avec l'ancien setup

### Architecture

**Avant (Caddy + PHP-FPM)** :

- 2 processus séparés : Caddy (serveur web) + PHP-FPM (processeur PHP)
- Communication via socket Unix ou TCP
- Supervision avec script custom

**Après (FrankenPHP)** :

- 1 seul processus : FrankenPHP intègre serveur web + exécution PHP
- Communication directe en mémoire
- Pas besoin de supervision externe

### Configuration

**Avant** :

- `Caddyfile` : configuration du serveur web
- `php-fpm.conf` : configuration du pool PHP-FPM
- `php.ini` : configuration PHP

**Après** :

- `Caddyfile` : configuration unique pour serveur web + PHP
- `php.ini` : configuration PHP (inchangée)

### Performances

FrankenPHP apporte plusieurs améliorations :

1. **Réduction de la latence** : Pas de communication inter-processus
2. **Consommation mémoire réduite** : Un seul processus au lieu de deux
3. **Mode Worker optionnel** : Application gardée en mémoire (pour optimisations futures)

## Configuration spécifique

### Variables d'environnement importantes

```yaml
environment:
    - SERVER_NAME=:8000 # Port d'écoute
    - CADDY_GLOBAL_OPTIONS=debug # Pour le debug
```

### Extensions PHP

L'image officielle FrankenPHP inclut les extensions essentielles. Les extensions supplémentaires sont installées avec :

```dockerfile
RUN install-php-extensions opcache apcu intl zip xsl sqlite3
```

### Développement avec Xdebug

Xdebug fonctionne normalement avec FrankenPHP :

```ini
; .docker/php-xdebug.ini
xdebug.mode=debug
xdebug.client_host=host.docker.internal
xdebug.client_port=9003
```

## Tests et validation

### 1. Vérifier que l'application démarre

```bash
docker-compose -f compose.frankenphp-official.yml logs -f app_dev
```

Vous devriez voir :

```
🚀 Starting Symfony application with FrankenPHP
Symfony application initialized successfully!
Starting FrankenPHP...
```

### 2. Tester les endpoints

```bash
# Page d'accueil
curl -v http://localhost:9092

# API (exemple)
curl -v http://localhost:9092/api/health

# Assets statiques
curl -v http://localhost:9092/build/app.css
```

### 3. Vérifier les performances

```bash
# Avec ab
ab -n 1000 -c 10 http://localhost:9092/

# Avec wrk
wrk -t4 -c100 -d30s http://localhost:9092/
```

## Mode Worker (ACTIVÉ)

✅ **Le mode Worker est maintenant activé !** FrankenPHP garde votre application Symfony en mémoire pour des performances exceptionnelles.

### Configuration actuelle

**Runtime Symfony :** `runtime/frankenphp-symfony` installé
**Variables d'environnement :**

- `APP_RUNTIME=Runtime\\FrankenPhpSymfony\\Runtime`
- `FRANKENPHP_CONFIG=worker ./public/index.php`

**Caddyfile :**

```caddyfile
{
    frankenphp {
        num_threads auto
        worker {
            file ./public/index.php
            num auto  # Nombre de workers (auto = 2x cœurs CPU)
            watch  # Surveillance des fichiers pour le développement
        }
    }
}
```

### Avantages du mode Worker

- **🚀 Performances 10x supérieures** : Application gardée en mémoire
- **⚡ Réponses en millisecondes** au lieu de secondes
- **💾 Moins de consommation mémoire** par requête
- **🔄 Redémarrage automatique** lors de changements de fichiers (développement)

### Surveillance et redémarrage

- **Développement** : Auto-restart sur changement de fichiers `.php`, `.yaml`, `.yml`, `.twig`, `.env`
- **Production** : Redémarrage manuel via API : `curl -X POST http://localhost:2019/frankenphp/workers/restart`

## Rollback

Si vous devez revenir à l'ancien système :

```bash
# Arrêter FrankenPHP
docker-compose -f compose.frankenphp-official.yml down

# Redémarrer l'ancien système
docker-compose -f compose.caddy.yml up -d
```

## Troubleshooting

### Problème : Port 8000 déjà utilisé

```bash
# Changer le port dans docker-compose
ports:
  - "9093:8000"  # Au lieu de 9092:8000
```

### Problème : Extensions PHP manquantes

Ajouter dans le Dockerfile :

```dockerfile
RUN install-php-extensions extension_name
```

### Problème : Permissions

```bash
# Dans le conteneur
chmod -R 777 /app/var/
```

## Ressources

- [Documentation officielle FrankenPHP](https://frankenphp.dev/docs/)
- [Images Docker FrankenPHP](https://hub.docker.com/r/dunglas/frankenphp)
- [Intégration Symfony](https://frankenphp.dev/docs/laravel/)
