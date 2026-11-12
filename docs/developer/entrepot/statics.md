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

L’identifiant de la configuration n’existe pas encore au dépôt du fichier de style : il est d’abord nommé `config_tmp_[uuid]_style_wmsv_[table_name]` (SLD, WMS vecteur) ou `config_tmp_[uuid]_style_wmsr` (ROK4, WMS raster).

Les routes `publish` des formulaires de flux WMS vecteur et WMS raster renomment les fichiers juste après la création de la configuration, avant l’offre (rappel `onConfigurationCreated` de `CartesServiceApiService::publishFromForm`). Si le renommage échoue, la configuration est supprimée.

Si la publication échoue avant la création de l’offre, le rappel `onRollback` supprime les fichiers. Après la création de l’offre, ils sont conservés même si une étape suivante échoue (permissions, capabilities, ressources en ligne de la métadonnée) : le flux les utilise. Un échec de suppression est journalisé.

Les anciennes routes `add` renomment en fin de traitement : un échec après la création de l’offre laisse le fichier sous son nom temporaire.
