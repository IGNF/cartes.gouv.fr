# Patches

## Explication

[`cweagans/composer-patches`](https://github.com/cweagans/composer-patches) est une librairie PHP qui permet de modifier le code source d'une autre librairie PHP pour

-   appliquer un correctif temporaire
-   ou tout simplement modifier un comportement pour nos besoins

Pour pouvoir appliquer un patch, il faut :

-   créer une copie du fichier à modifier
-   faire les modifications dans la copie du fichier
-   créer un fichier `.patch` qui décrit le code à changer avec la commande :

```sh
diff -u ./chemin/vers/fichier_original ./chemin/vers/fichier_modifie > ./patches/[nom_du_patch].patch
```

> Prendre l'exemple sur le fichier [patches/fosjsrouting.patch](./fosjsrouting.patch)

-   déclarer le patch dans le fichier `composer.json` (extras -> patches)

## Patches actuellement appliqués

-   [friendsofsymfony/jsrouting-bundle](./fosjsrouting.patch) : Dans le fichier "endor/friendsofsymfony/jsrouting-bundle/Resources/webpack/FosRouting.js", il y a une injection de code où on essasie d'importer "fos-router". Or, "fos-router" n'existe pas pour nous, cela faisait échouer les build et de toute manière, on ne s'en sert pas. Donc, ce bout de code a été commenté.
