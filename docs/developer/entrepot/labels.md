# Utilisation des `labels`

Certaines entités portent une propriété `labels`, qui est une liste de chaînes de caractères (string[]), permettant de stocker des informations supplémentaires.

Mais nous utilisons les labels comme des `tags` de la manière suivante : "[clé]=[valeur]". Donc, pas de "=" possible dans les labels.

Exemple : datasheet_name=Ma donnée

## `annexe`

### vignette d'une fiche de donnée

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "thumbnail" | string |

### fichier de style individuel (par ex. contenu du SLD, QML etc)

Un fichier de style déposé via cartes.gouv.fr est stocké d'abord dans un annexe avant d'être référencé dans l'annexe "chapeau" décrit [ici](./annexes.md)

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "style"     | string |

### ensemble de documents liés à une fiche de donnée

| label            | description                   |        |
| ---------------- | ----------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée     | string |
| `type`           | valeur fixe : "document-list" | string |

### un document lié à une fiche de donnée

Un document du type fichier est stocké d'abord dans un annexe avant d'être référencé dans l'annexe "chapeau" décrit au-dessus et [ici](./annexes.md)

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "document"  | string |

### fichier GetCapabilities filtrés pour les endpoints WFS, WMS (raster et vecteur) et WMTS

Syntaxe du path :

```
/[endpoint_technical_name]/capabilities.xml
```

| label  | description                  |        |
| ------ | ---------------------------- | ------ |
| `type` | valeur fixe : "capabilities" | string |
