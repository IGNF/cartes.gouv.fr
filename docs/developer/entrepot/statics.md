# Utilisation des fichiers statiques

Il s'agit d'une [entité](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui représente des fichiers de configuration utilisés par l'Entrepôt en arrière plan lors des différents traitements.

Cette entité `static` a seulement une propriété `name` pouvant être utilisé pour filtrer, pas de `tags` ni de `labels`. Donc, afin de pouvoir lier ces fichiers statiques à d'autres entités pour notre usage, nous allons nous contenter d'utiliser une nomination particulière.

## SLD

Utilisé pour une configuration de type `WMS-VECTOR`.

Syntaxe du `name` :

```
config_[configuration_id]_style_[type_config]_[table_name]
```

| variable           | description                                            |        |
| ------------------ | ------------------------------------------------------ | ------ |
| `configuration_id` | identifiant de la `configuration` du type `WMS-VECTOR` | uuidv4 |
| `type_config`      | type de configuration, `wmsv` pour WMS-VECTOR          | string |
| `table_name`       | nom de la table                                        | string |

## FTL (infobulles)

Utilisé pour une configuration de type `WMS-VECTOR` : un modèle FreeMarker (`GEOSERVER-FTL`) par table, référencé par `type_infos.used_data[0].relations[].ftl`. Il remplace le `content.ftl` de GeoServer pour la réponse GetFeatureInfo au format `text/html` ; les autres formats renvoient tous les attributs.

Syntaxe du `name` :

```
config_[configuration_id]_featureinfo_[type_config]_[table_name]
```

| variable           | description                                            |        |
| ------------------ | ------------------------------------------------------ | ------ |
| `configuration_id` | identifiant de la `configuration` du type `WMS-VECTOR` | uuidv4 |
| `type_config`      | type de configuration, `wmsv` pour WMS-VECTOR          | string |
| `table_name`       | nom de la table                                        | string |

`WmsVectorFeatureInfoService` génère le modèle à partir des attributs choisis et du format (liste ou tableau). Le modèle commence par `<#-- cartes.gouv.fr featureinfo v1 format=list|table -->` et écrit chaque nom en chaîne brute FreeMarker (`r"…"`) : un nom de colonne `${…}` n’est jamais évalué. Le formulaire relit un modèle seulement s’il le régénère à l’identique ; sinon c’est un modèle personnalisé, que cartes.gouv.fr ne modifie ni ne supprime à la modification du flux.

L’Entrepôt ne contrôle pas le modèle : un attribut absent de la table fait échouer tout le GetFeatureInfo de la couche. Le serveur vérifie donc les attributs contre les colonnes de la donnée stockée. Un modèle remplacé ne s’applique à la couche publiée qu’après la synchronisation de l’offre (`PUT offerings/{id}`), faite par la modification du flux.

## ROK4-STYLE

Utilisé pour une configuration du type `WMS-RASTER` ou `WMTS-TMS`.

Syntaxe du `name` :

```
config_[configuration_id]_style_[type_config]
```

| variable           | description                                                           |        |
| ------------------ | --------------------------------------------------------------------- | ------ |
| `configuration_id` | identifiant de la `configuration`                                     | uuidv4 |
| `type_config`      | type de configuration, `wmsr` pour WMS-RASTER et `wmts` pour WMTS-TMS | string |

## Nom temporaire à la création

L’identifiant de la configuration n’existe pas encore au dépôt du fichier de style : il est d’abord nommé `config_tmp_[uuid]_style_wmsv_[table_name]` (SLD, WMS vecteur), `config_tmp_[uuid]_featureinfo_wmsv_[table_name]` (FTL, WMS vecteur) ou `config_tmp_[uuid]_style_wmsr` et `config_tmp_[uuid]_style_wmts` (ROK4, WMS raster et WMTS).

La route de publication des flux (`POST /api/datastores/{datastoreId}/services`) renomme les fichiers juste après la création de la configuration, avant l’offre (rappel `onConfigurationCreated` de `CartesServiceApiService::publishFromForm`). Si le renommage échoue, la configuration est supprimée.

Si la publication échoue avant la création de l’offre, le rappel `onRollback` supprime les fichiers. Après la création de l’offre, ils sont conservés même si une étape suivante échoue (permissions, capabilities, ressources en ligne de la métadonnée) : le flux les utilise. Un échec de suppression est journalisé.
