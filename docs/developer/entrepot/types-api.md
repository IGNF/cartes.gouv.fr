# Génération des types TypeScript depuis l’OpenAPI

Le fichier `assets/@types/entrepot.ts` contient les types de l’API Entrepôt. Il est généré : ne jamais éditer `entrepot.ts` à la main.

## Instantané du spec

`assets/@types/entrepot-openapi.json` est un instantané du spec OpenAPI de l’Entrepôt en production, trié par `jq -S`.

Le job CI `upstream-spec` tourne chaque jour. Il télécharge le spec et échoue s’il diffère de l’instantané commité. La commande de rafraîchissement figure en commentaire du job dans `.github/workflows/ci.yml`.

## Surcouche

Le spec amont contient des défauts. Le script `bin/entrepot-openapi-overlay.mjs` les corrige avant la génération, en quatre blocs :

1. Les schémas vides deviennent des `object`, et `DocumentDetailsResponseDto` retrouve ses propriétés.
2. La propriété `extra` est rétablie sur les schémas où l’API la renvoie et l’accepte.
3. Des champs toujours renvoyés par l’API sont remis dans les listes `required`.
4. Les enums répétés en ligne qui entrent en conflit sont remontés en composants partagés : `ConfigurationStatus`, `ConfigurationType`, `OfferingStatus`.

Chaque bloc porte un commentaire qui décrit le défaut corrigé. Le script échoue quand un bloc n’a plus rien à corriger : c’est le signal pour le supprimer.

Règle : supprimer un bloc quand l’amont corrige le défaut ; le job CI signale le changement.

## Génération

```bash
npm run types:entrepot
```

La commande enchaîne trois étapes :

1. La surcouche écrit le spec corrigé dans `node_modules/.cache/entrepot-openapi.overlaid.json`.
2. `swagger-typescript-api` génère `assets/@types/entrepot.ts`.
3. Prettier formate le fichier.

Commiter `entrepot.ts` avec le changement de l’instantané ou de la surcouche.

## Contrôle en CI

Le job `js-lint` relance `npm run types:entrepot`. Il échoue si `entrepot.ts` diffère du fichier commité.

## Utilisation dans le code

Le code importe de préférence via `assets/@types/app.ts`, qui renomme et ré-exporte les types utiles (par exemple `ConfigurationStatus as ConfigurationStatusEnum`). Les imports directs depuis `entrepot.ts` restent possibles.
