# Utilisation des fichiers annexes

Il s'agit d'une [entité](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui représente des fichiers librement déposés et utilisés par les utilisateurs de l'API Entrepôt.

Syntaxe du path de base :

```
[url_base_annexes]/[datastore_technical_name]
```

## un fichier de style individuel (par ex. contenu du SLD, QML etc)

Un fichier de style déposé via cartes.gouv.fr est stocké d'abord dans un annexe avant d'être référencé dans la propriété `extra` de la configuration décrite [ici](../extra.md#un-ensemble-de-fichiers-de-style-associés-à-une-configuration)

Labels :

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "style"     | string |

## un document lié à une fiche de donnée

Un document du type fichier est stocké d'abord dans un annexe avant d'être référencé dans l'annexe "chapeau" décrit ci-dessous.

Labels :

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "document"  | string |

## un ensemble de documents liés à une fiche de donnée

Syntaxe du path :

```
/documents/[datasheet_name].json
```

| variable         | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |

Labels :

| label            | description                   |        |
| ---------------- | ----------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée     | string |
| `type`           | valeur fixe : "document-list" | string |

Structure de cet annexe json :

```ts
export type DatasheetDocument = {
    type: "link" | "file";
    url: string;
    name: string;
    description?: string;
    id: string;
};
```

```json
[
    {
        "type": "link",
        "name": "test lien",
        "description": "test lien desc",
        "id": "uuid généré automatiquement par cartes.gouv.fr",
        "url": "https://ign.fr"
    },
    {
        "type": "file",
        "name": "projet qgis",
        "description": "un projet qgis",
        "id": "identifiant de l'annexe",
        "url": "url complète de l'annexe"
    }
    ...
]
```

## la vignette d'une fiche de donnée

Labels :

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "thumbnail" | string |

## un fichier GetCapabilities filtré pour chaque endpoint public des flux WFS, WMS (raster et vecteur) et WMTS

Syntaxe du path :

```
/[endpoint_technical_name]/capabilities.xml
```

| label  | description                  |        |
| ------ | ---------------------------- | ------ |
| `type` | valeur fixe : "capabilities" | string |

## le fichier json décrivant les champs supplémentaires d'une demande de rejoindre une communauté

Syntaxe du path :

```
/public/join.json
```

Cet annexe doit être `public` et son contenu doit correspondre à un schéma [TableSchema](https://specs.frictionlessdata.io/table-schema), mais seulement un sous-ensemble du schéma est pris en charge. Seuls les types chaîne de caractères (`string`) et les nombres (`number` et `integer`) sont actuellement supportés.

[Exemple de fichier json](./examples/example-scan-oaci-join.json) qui donne le rendu suivant :

![alt text](examples/example-scan-oaci-join-rendered-form.png)

Structure de json pris en charge :

| clé                                      | description                                                      | exemple                                                                                                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`                            | texte qui apparaît en haut du formulaire                         | Rejoindre cette communauté vous permet d'accéder aux services de diffusion des Scans OACI. l'utilisateur                                                                                     |
| `fields[n].name`                         | nom technique du champ (non visible, sans accents, sans espaces) | siret                                                                                                                                                                                        |
| `fields[n].title`                        | libellé du champ                                                 | SIRET de votre organisme                                                                                                                                                                     |
| `fields[n].description`                  | texte d'aide                                                     | Le SIRET permet de vous identifier comme professionnel ou association. Le contrat de licence ne permet pas aux particuliers de télécharger la donnée Scan OACI. Format attendu : 14 chiffres |
| `fields[n].type`                         | type du champ                                                    | string (par défaut), number ou integer                                                                                                                                                       |
| `fields[n].constraints[constraint_name]` | contraintes (optionnelles)                                       | voir détail ci-dessous                                                                                                                                                                       |

Détail des contraintes :

| contrainte  | description          | types de champs concernés |
| ----------- | -------------------- | ------------------------- |
| `required`  | obligatoire          | tout                      |
| `minLength` | longueur minimale    | string                    |
| `maxLength` | longueur maximale    | string                    |
| `pattern`   | expression régulière | string                    |
| `minimum`   | valeur minimale      | number/integer            |
| `maximum`   | valeur maximale      | number/integer            |

Des messages d'erreurs génériques sont prévus pour les cas obligatoire, inférieur/supérieur à etc. Mais il est conseillé de préciser le format attendu du champ dans le texte d'aide si c'est un format particulier.

## une légende pour les services WMTS et WMS-Raster obtenus par moissonnage de WMS-Vecteur

Au moment de la demande de génération d'une pyramide raster par moissonnage d'un flux WMS-Vecteur, la légende automatique (requête `GetLegendGraphic` du WMS-Vecteur) est téléchargée et sauvegardée dans un annexe. Cette annexe est référencée dans les [extra](../extra.md) de la nouvelle `stored_data` (la pyramide raster).

Ensuite, une fois la pyramide raster générée, cette légende sera référencée dans le [fichier de style ROK4](../statics.md) fourni pour la création de la configuration d'un service WMS-Raster ou WMTS.

Syntaxe du path :

```
/legend/[offeringId]/legend.png
```

Labels :

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "legend"    | string |
