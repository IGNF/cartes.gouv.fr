# Statistiques de consommation

Les routes `/stats` de l’Entrepôt sont décrites dans une OpenAPI dédiée : https://data.geopf.fr/api/stats/v3/api-docs. Elles sont absentes de l’OpenAPI principale.

## Contrat observé (14/09/2026)

- Réponse : un objet `{ total, details[] }` (`HitStatisticsDto`), pas une liste. Côté backend, `ApiClient::requestAllHitStatistics()` conserve `total` et concatène `details` d’une page à l’autre.
- Bornes `start` et `end` : instants UTC, `start` inclus, `end` exclu. Pour couvrir un jour J entier, envoyer `start=J T00:00Z` et `end=J+1 T00:00Z`.
- Granularité de `details` selon la longueur de la période : de 1 à 14 jours, tranches de 5 à 10 minutes (plusieurs milliers de lignes) ; à partir de 31 jours, une ligne par jour UTC. `begin_date` est le premier hit de la tranche, jamais minuit exact.
- `total` est le total de toute la période, identique sur chaque page.
- Statistiques par endpoint disponibles depuis le 15/07/2025 ; les statistiques utilisateur remontent plus loin (juin 2024 constaté).
- La ligne du jour courant n’apparaît qu’avec la granularité fine (période courte) ; en granularité journalière, la série s’arrête à la veille.

## Convention côté front

Le graphique raisonne en jours UTC de bout en bout (`assets/utils/stats.ts`) : le sélecteur fournit des jours calendaires, convertis en bornes UTC pour la requête, et les lignes sont sommées par jour UTC de `begin_date`. Le même graphique s’affiche donc quel que soit le fuseau du navigateur, et sans effet des changements d’heure.
