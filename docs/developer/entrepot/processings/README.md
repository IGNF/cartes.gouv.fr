# Traitements (`processings`)

> [!NOTE]
> La liste de paramètres est non exhaustive. Seulement les paramètres exploités par cartes.gouv.fr sont listés ici. Consulter la documentation de chaque traitement pour connaître tous les paramètres : GET https://data.geopf.fr/api/datastores/{datastore}/processings/{processing}

> [!IMPORTANT]
> string (number) signifie que la valeur est un nombre mais l'API attend qu'elle soit envoyée sous forme de chaîne de caractères. Par exemple, `1` est envoyé sous la forme `"1"`.

## Intégration de données vecteur livrées en base

Ce traitement permet de stocker dans les bases de données PostgreSQL de la plateforme des données vecteurs livrées. Les formats pris en charge sont le CSV, le Shapefile, le Geopackage et le GeoJSON _(seulement le Geopackage est pris en charge par cartes.gouv.fr aujourd'hui)_. Il est également possible de préciser un autre système afin de réaliser une reprojection à l'intégration.

[Exemple de corps de requête JSON](./examples/integration_vector_data_to_db_postgres.json)

**Lien du formulaire** : https\://cartes.gouv.fr/entrepot/`datastore`/donnees/televersement

Une livraison (`upload`) est créée à la soumission de ce formulaire. Une fois que toutes les vérifications associées à la livraison sont validées, le traitement est exécuté en arrière-plan par cartes.gouv.fr.

| paramètre                         | description                           | type     | commentaire                                                              |
| --------------------------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `processing`                      | id du traitement                      | string   | saisie auto, non modifiable par l'utilisateur                            |
| `inputs[0].upload[0]`             | id de la livraison (VECTOR) en entrée | string   | `upload._id`, saisie par l'utilisateur                                   |
| `output.stored_data.name`         | nom de la donnée stockée en sortie    | string   | `upload.name`, saisie par l'utilisateur                                  |
| `output.stored_data.storage_tags` | tags du stockage                      | string[] | valeur fixe : ["VECTEUR"], saisie auto, non modifiable par l'utilisateur |

## Calcul de pyramide vecteur

Génération ou mise à jour d'une pyramide de tuiles vectorielles à partir d'une donnée vecteur en base

[Exemple de corps de requête JSON](./examples/pyramid_vector_generation.json)

**Lien du formulaire** : https\://cartes.gouv.fr/entrepot/`datastore`/pyramide-vecteur/ajout?vectorDbId=`vectorDbId`&technicalName=`outputStoredDataName`&datasheetName=`datasheetName`

| paramètre                                | description                                   | type            | commentaire                                                                                                           |
| ---------------------------------------- | --------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `processing`                             | id du traitement                              | string          | saisie auto, non modifiable par l'utilisateur                                                                         |
| `inputs[0].stored_data[0]`               | id de la donnée stockée (VECTOR-DB) en entrée | string          | `vectorDbId`                                                                                                          |
| `output.stored_data.name`                | nom de la donnée stockée en sortie            | string          | `outputStoredDataName`                                                                                                |
| `output.stored_data.storage_tags`        | tags du stockage                              | string[]        | valeur fixe : ["PYRAMIDE"], saisie auto, non modifiable par l'utilisateur                                             |
| `parameters.composition[n].table`        | nom de la relation                            | string          | saisie par l'utilisateur, autocomplétion proposée                                                                     |
| `parameters.composition[n].attributes`   | attributs de la relation à sélectionner       | string          | saisie par l'utilisateur                                                                                              |
| `parameters.composition[n].bottom_level` | niveau de zoom max de la relation             | string (number) | saisie par l'utilisateur                                                                                              |
| `parameters.composition[n].top_level`    | niveau de zoom min de la relation             | string (number) | saisie par l'utilisateur                                                                                              |
| `parameters.bottom_level`                | niveau de zoom max global                     | string (number) | saisie auto à partir de `composition[n].bottom_level` et `composition[n].top_level`, non modifiable par l'utilisateur |
| `parameters.top_level`                   | niveau de zoom min global                     | string (number) | saisie auto à partir de `composition[n].bottom_level` et `composition[n].top_level`, non modifiable par l'utilisateur |
| `parameters.tippecanoe_options`          | options de généralisation par tippecanoe      | string          | saisie par l'utilisateur                                                                                              |

## Calcul ou mise à jour de pyramide raster par moissonnage WMS

Il n'y a pas besoin de donnée en entrée. Sont fournis en paramètres toutes les informations sur le service WMS et le jeu de données à moissonner, ainsi que la zone sur laquelle faire le moissonnage

[Exemple de corps de requête JSON](./examples/pyramid_raster_generation_wmsv_harvesting.json)

**Lien du formulaire** : https\://cartes.gouv.fr/entrepot/`datastore`/pyramide-raster/ajout?offeringId=`wmsv_service_id`&datasheetName=`datasheetName`

`wmsv_service` = récupération d'informations sur le service en entrée à partir de `wmsv_service_id`

| paramètre                         | description                                                            | type                               | commentaire                                                                |
| --------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `processing`                      | id du traitement                                                       | string                             | saisie auto, non modifiable par l'utilisateur                              |
| `output.stored_data.name`         | nom de la donnée stockée en sortie                                     | string                             | saisie par l'utilisateur, autocomplétion proposée                          |
| `output.stored_data.storage_tags` | tags du stockage                                                       | string[]                           | valeur fixe : ["PYRAMIDE"], saisie auto, non modifiable par l'utilisateur  |
| `parameters.samplesperpixel`      | nombre de canaux dans les dalles en sortie                             | number (de 1 à 4)                  | valeur fixe : 3, saisie auto, non modifiable par l'utilisateur             |
| `parameters.sampleformat`         | format des canaux dans les dalles en sortie                            | string ("UINT8" ou "FLOAT32")      | valeur fixe : "UINT8", saisie auto, non modifiable par l'utilisateur       |
| `parameters.tms`                  | identifiant du quadrillage à utiliser (Tile Matrix Set)                | string                             | valeur fixe : "PM", saisie auto, non modifiable par l'utilisateur          |
| `parameters.compression`          | compression des données en sortie                                      | string (raw, jpg, png, zip, jpg90) | valeur fixe : "jpg", saisie auto, non modifiable par l'utilisateur         |
| `parameters.harvest_levels`       | niveaux à moissonner (de bas en haut)                                  | string[] (number[])                | saisie par l'utilisateur                                                   |
| `parameters.bottom`               | niveau du bas de la pyramide en sortie                                 | string (number)                    | saisie auto à partir de `harvest_levels`, non modifiable par l'utilisateur |
| `parameters.harvest_format`       | Format des images téléchargées                                         | string                             | valeur fixe : "image/jpeg", saisie auto, non modifiable par l'utilisateur  |
| `parameters.harvest_url`          | URL du endpoint WMS-V                                                  | string                             | saisie auto à partir de `wmsv_service`, non modifiable par l'utilisateur   |
| `parameters.harvest_layers`       | Couches à moissonner                                                   | string                             | saisie auto à partir de `wmsv_service`, non modifiable par l'utilisateur   |
| `parameters.harvest_area`         | WKT de la zone sur laquelle le moissonnage doit se faire, en EPSG:4326 | string                             | saisie auto à partir de `wmsv_service`, non modifiable par l'utilisateur   |
