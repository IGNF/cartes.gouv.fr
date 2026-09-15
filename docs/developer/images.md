# Images

Les images du front sont commitées prêtes à servir. Le build Vite ne redimensionne ni ne compresse rien : il copie les fichiers importés dans `public/build/assets/` avec un hash dans le nom.

Une image affichée en plusieurs tailles (`srcset`) est donc générée une fois à la main, puis commitée avec sa source.

## Page « Publier une donnée »

Le fond de la page `DiscoverPublish` est le seul cas actuel.

- Source : `assets/img/discover/publish/background.png` (2160 x 1200, RGBA). Le fichier reste dans le dépôt mais n'est importé nulle part, Vite ne l'embarque pas.
- Variantes servies : `background-800.webp`, `background-1200.webp`, `background-1600.webp`, `background-2160.webp` dans le même dossier, qualité WebP 80.

Ces largeurs sont reprises dans le `srcset` de `assets/pages/discover/publish/DiscoverPublish.tsx`. L'attribut `sizes` du même composant reprend les largeurs du bloc `.backgroundWrapper` de `DiscoverPublish.module.css`. Changer l'un impose de mettre à jour les autres.

## Régénérer les variantes

À faire après un remplacement de la source, ou pour ajouter une largeur.

Dans le conteneur (`docker exec -it cartesgouvfr-app_dev-1 bash`), installer `sharp` temporairement. L'option `--no-save` ne touche ni `package.json` ni `package-lock.json`. Le proxy s'applique comme pour tout `npm install` (voir [Installation et configuration](install.md)).

```bash
npm install --no-save sharp
node - <<'EOF'
const sharp = require("sharp");
const src = "assets/img/discover/publish/background.png";
(async () => {
    for (const w of [800, 1200, 1600, 2160]) {
        await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(`assets/img/discover/publish/background-${w}.webp`);
    }
})();
EOF
npm ci
```

Le `npm ci` final retire `sharp` de `node_modules`. Vérifier ensuite le rendu de la page et commiter les fichiers `.webp` modifiés.

## Illustrations tippecanoe

Les sept illustrations de l’étape de généralisation TMS (`assets/img/tippecanoe/*_merged.webp`, 801 x 401, qualité WebP 80) sont affichées à leur largeur native. Les sources JPEG restent à côté, non importées.

Régénération, avec le même `sharp` temporaire que ci-dessus :

```bash
node - <<'EOF'
const sharp = require("sharp");
const fs = require("fs");
const dir = "assets/img/tippecanoe/";
(async () => {
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith("_merged.jpg"))) {
        await sharp(dir + f).webp({ quality: 80 }).toFile(dir + f.replace(/\.jpg$/, ".webp"));
    }
})();
EOF
```

## Nouvelle image

Reprendre la même recette : source commitée à côté des fichiers générés et non importée, fichiers générés commités. Pour une image responsive, largeurs du `srcset` alignées sur l’attribut `sizes`.
