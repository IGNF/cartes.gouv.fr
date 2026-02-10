# Téléversement de fichiers en morceaux

Ce document décrit le fonctionnement général du téléversement de fichiers (GeoPackage `.gpkg` et archive `.zip`) utilisé lors du dépôt d'une donnée.

## Objectif

- Permettre le téléversement de gros fichiers en découpant en morceaux (chunks) pour limiter l'impact des coupures réseau.
- Valider le fichier final côté serveur (format, SRID, contraintes ZIP etc.) avant de le rendre disponible aux étapes suivantes.
- Conserver les noms d'origine (nom du zip et chemins relatifs des fichiers extraits) lors de l'envoi vers l'API Entrepôt.

## Parcours global (vue d'ensemble)

1. Le navigateur découpe le fichier en chunks et envoie chaque chunk au backend.
2. Quand tous les chunks sont envoyés, le navigateur appelle l'endpoint de finalisation.
3. Le backend fusionne les chunks, valide le fichier final, puis répond avec un JSON minimal.
4. Le frontend stocke la valeur de retour `filename` (utilisée ensuite comme `data_upload_path`).
5. Plus tard, ce chemin est utilisé pour récupérer le fichier local et l'envoyer vers l'API Entrepôt.

## Endpoints backend

- `POST /upload_chunk`
    - Reçoit un chunk et l'enregistre sur disque.
    - Réponse: `{ "index": <n>, "numBytes": <taille_chunk> }`.

- `POST /upload_complete`
    - Déclenche la fusion des chunks, puis la validation du fichier final.
    - Réponse: `{ "srid": <EPSG>, "filename": <chemin_relatif> }`.

Le contrat (routes + forme du JSON) est volontairement stable car il est consommé par le frontend.

## Stockage et nommage

- Les chunks sont stockés dans un répertoire dédié au `uuid` d'upload.
- Lors de la finalisation, le backend reconstitue un fichier final et l'enregistre sous le nom d'origine fourni par l'utilisateur (afin d'avoir un nom lisible et stable pour la suite).
- La valeur `filename` renvoyée est un chemin relatif (sous le répertoire d'uploads) et c'est cette valeur qui circule ensuite vers l'intégration Entrepôt.

## Validation côté serveur

Règles principales :

- Taille maximale : 2 Go.
- Extensions acceptées : `.gpkg` et `.zip`.
- GeoPackage (`.gpkg`) :
    - Extraction des SRID via lecture SQLite (tables GeoPackage).
    - La donnée doit avoir un SRID cohérent (un seul EPSG détecté).

### Politique ZIP (permissive + mutation)

- Une archive `.zip` est acceptée, mais le serveur ne garde que les entrées `.gpkg`.
- Les autres fichiers sont supprimés de l'archive (mutation) pour ne conserver que le contenu utile.
- Des garde-fous existent pour limiter les comportements dangereux (chemins suspects, tailles/ratios trop élevés, etc.).
- Les SRID sont extraits sur l'ensemble des `.gpkg` présents: le SRID doit rester cohérent entre plusieurs couches du gpkg.

## Envoi vers l'API Entrepôt

Lorsqu'on envoie un ZIP:

- Le serveur extrait l'archive localement et parcourt récursivement les `.gpkg`.
- Chaque GeoPackage est envoyé à l'API Entrepôt en conservant son chemin relatif dans l'archive.
    - Exemple: une entrée `dossier/sous-dossier/data.gpkg` est envoyée comme `path=data/dossier/sous-dossier/data.gpkg`.

Cette conservation des chemins permet de préserver la structure fournie par l'utilisateur.

## Nettoyage

Les fichiers déposés sous `var/data/` sont temporaires. Un nettoyage périodique supprime les uploads anciens (actuellement ~24h) pour éviter l'accumulation.
