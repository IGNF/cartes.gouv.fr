# Utilisation des `tags`

Certaines entités portent une propriété `tags`, qui est un dictionnaire clé/valeur (array<string,string>), permettant de stocker des informations supplémentaires.

## `upload`

| tag                        | description                                                                                                                                               |         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `proc_int_id`              | identifiant de l'exécution du traitement "Intégration de données vecteur livrées en base"                                                                 | uuidv4  |
| `datasheet_name`           | nom de la fiche de donnée                                                                                                                                 | string  |
| `vectordb_id`              | identifiant de la donnée stockée en sortie du traitement `proc_int_id`                                                                                    | uuidv4  |
| `data_upload_path`         | chemin vers le fichier téléversé                                                                                                                          |         |
| `integration_progress`     | progression de l'intégration en base de données (envoi du fichier téléversé à l'API, attente des vérifications et puis le traitement d'intégration en BD) | json(1) |
| `integration_current_step` | numéro de l'étape courante de integration_progress                                                                                                        | number  |

(1) structure de json :

```json
// nom de l'étape : statut [waiting, in_progress, successful, failed]
{
    "send_files_api": "successful",
    "wait_checks": "successful",
    "integration_processing": "successful"
}
```

## `stored_data`

### tags communs

| tag              | description                             |        |
| ---------------- | --------------------------------------- | ------ |
| `datasheet_name` | pareil que `datasheet_name` de `upload` | string |

### tags spécifiques aux stored_data du type `VECTOR-DB`

| tag           | description                                                   |        |
| ------------- | ------------------------------------------------------------- | ------ |
| `upload_id`   | identifiant de l'`upload` utilisé lors de l'intégration en BD | uuidv4 |
| `proc_int_id` | pareil que `proc_int_id` de `upload`                          | uuidv4 |

### tags spécifiques aux stored_data du type `ROK4-PYRAMID-VECTOR`

| tag                 | description                                                                                 |         |
| ------------------- | ------------------------------------------------------------------------------------------- | ------- |
| `proc_pyr_creat_id` | identifiant de l'exécution du traitement "Calcul de pyramide vecteur"                       | uuidv4  |
| `vectordb_id`       | identifiant de la donnée stockée `VECTOR-DB` utilisée pour le calcul de la pyramide vecteur | uuidv4  |
| `is_sample`         | vrai s'il s'agit d'un échantillon : pyramide vecteur générée dans une petite zone           | boolean |

## `configuration`

| tag              | description                             |        |
| ---------------- | --------------------------------------- | ------ |
| `datasheet_name` | pareil que `datasheet_name` de `upload` | string |
