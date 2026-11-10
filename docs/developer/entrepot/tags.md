# Utilisation des `tags`

Certaines entités portent une propriété `tags`, qui est un dictionnaire clé/valeur (array<string,string>), permettant de stocker des informations supplémentaires.

## `upload`

| tag                | description                                                                               |             |
| ------------------ | ----------------------------------------------------------------------------------------- | ----------- |
| `datasheet_name`   | nom de la fiche de donnée                                                                 | string      |
| `proc_int_id`      | identifiant de l'exécution du traitement "Intégration de données vecteur livrées en base" | uuidv4      |
| `vectordb_id`      | identifiant de la donnée stockée en sortie du traitement `proc_int_id`                    | uuidv4      |
| `data_upload_path` | chemin vers le fichier téléversé                                                          |             |
| `file_tree`        | arborescence des fichiers, écrite juste avant la suppression de la livraison              | json encodé |

La progression de l'intégration n'est pas un tag : le backend la calcule à chaque lecture (voir [workflow d'intégration](../workflows/upload-integration-vector/README.md)). Les livraisons antérieures portent encore `integration_progress` et `integration_current_step`, que plus rien ne lit.

Tags métier posés à la déclaration de livraison (formulaire « Ajouter une donnée ») et recopiés sur la donnée stockée à l'intégration :

| tag                  | description                                                |              |
| -------------------- | ---------------------------------------------------------- | ------------ |
| `producer`           | nom de l'organisme producteur                              | string       |
| `producer_short`     | acronyme de l'organisme (optionnel)                        | string       |
| `production_year`    | année de production, dérivée de `date`                     | integer      |
| `date`               | date de production                                         | `YYYY-MM-DD` |
| `theme`              | thématiques séparées par `, ` (99 caractères max)          | string       |
| `zone`               | étendue spatiale, pour le téléchargement (ex : `D001 Ain`) | string       |
| `email_notification` | courriel à la fin de l'intégration (livraison seulement)   | boolean      |

## `stored_data`

### tags communs

> [!IMPORTANT]
> Ces tags sont présents sur tous les stored_data

| tag               | description                             |         |
| ----------------- | --------------------------------------- | ------- |
| `datasheet_name`  | pareil que `datasheet_name` de `upload` | string  |
| `producer`        | tag pour l'index de recherche           | string  |
| `production_year` | tag pour l'index de recherche           | integer |

Les `VECTOR-DB` intégrées depuis le formulaire « Ajouter une donnée » portent aussi `producer_short`, `date`, `theme` et `zone` (voir `upload`).

### tags spécifiques aux stored_data du type `VECTOR-DB`

| tag              | description                                                   |        |
| ---------------- | ------------------------------------------------------------- | ------ |
| `datasheet_name` | -                                                             | -      |
| `upload_id`      | identifiant de l'`upload` utilisé lors de l'intégration en BD | uuidv4 |
| `proc_int_id`    | pareil que `proc_int_id` de `upload`                          | uuidv4 |

### tags spécifiques aux stored_data du type `ROK4-PYRAMID-VECTOR`

| tag                 | description                                                                                 |                   |
| ------------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| `datasheet_name`    | -                                                                                           | -                 |
| `upload_id`         | -                                                                                           | -                 |
| `proc_int_id`       | -                                                                                           | -                 |
| `proc_pyr_creat_id` | identifiant de l'exécution du traitement "Calcul de pyramide vecteur"                       | uuidv4            |
| `vectordb_id`       | identifiant de la donnée stockée `VECTOR-DB` utilisée pour le calcul de la pyramide vecteur | uuidv4            |
| `is_sample`         | vrai s'il s'agit d'un échantillon : pyramide vecteur générée dans une petite zone           | "true" \| "false" |

### tags spécifiques aux stored_data du type `ROK4-PYRAMID-RASTER`

| tag                 | description                                                                                             |        |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| `datasheet_name`    | -                                                                                                       | -      |
| `upload_id`         | -                                                                                                       | -      |
| `proc_int_id`       | -                                                                                                       | -      |
| `vectordb_id`       | -                                                                                                       | -      |
| `proc_pyr_creat_id` | identifiant de l'exécution du traitement "Calcul ou mise à jour de pyramide raster par moissonnage WMS" | uuidv4 |

## `configuration`

| tag              | description                             |        |
| ---------------- | --------------------------------------- | ------ |
| `datasheet_name` | pareil que `datasheet_name` de `upload` | string |
| `theme`          | tag pour l'index de recherche           | string |
