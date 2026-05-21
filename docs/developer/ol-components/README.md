# Module React-OpenLayers (`assets/components/map/`)

Ce module fournit une intégration déclarative React ↔ OpenLayers. Tous les fichiers vivent dans `assets/components/map/` et sont exportés via le barrel `index.ts`.

Le module est **bas niveau et sans logique métier** : il expose les primitives (`OlLayer`, `OlControl`, `OlInteraction`, `OlBackgroundLayer`, `OlMapProvider`, `useOlMap`). La configuration métier (contrôles IGN, types de service, BBox) est la responsabilité des composants consommateurs — par exemple `ServiceMap` dans `components/Utils/ServiceMap.tsx`.

## Principe

`useOlMap` crée l'instance `ol/Map`, `OlMapProvider` la distribue aux enfants, et les composants de branchement (`OlLayer`, `OlControl`, `OlInteraction`) s'y attachent déclarativement via le contexte.

```
useOlMap() → OlMapProvider
               ├─ OlControl       ← ajoute/retire un ol/control/Control
               ├─ OlLayer         ← ajoute/retire une ol/layer/Base
               ├─ OlInteraction   ← ajoute/retire un ol/interaction/Interaction
               └─ OlBackgroundLayer  ← couche WMTS Géoplateforme (fond de plan IGN)
```

## `ServiceMap` — composant métier entrepôt

`assets/components/Utils/ServiceMap.tsx` est un composant de plus haut niveau qui **consomme** ce module et préconfigure la carte pour la visualisation des services de l'entrepôt : contrôles IGN (LayerSwitcher, SearchEngine, GeoportalZoom…), fond de plan, fit bbox.

```tsx
import ServiceMap from "@/components/Utils/ServiceMap";

<ServiceMap layers={olLayers} currentStyle={style} type={service.type} bbox={service.bbox} />;
```

| Prop            | Type                             | Description                                            |
| --------------- | -------------------------------- | ------------------------------------------------------ |
| `layers`        | `BaseLayer[]`                    | Couches à afficher (ajoutées dans l'ordre).            |
| `type`          | `OfferingTypeEnum`               | Type de service (réservé, cf. TODO GetFeatureInfo).    |
| `currentStyle?` | `CartesStyle \| GeostylerStyles` | Style appliqué à toutes les couches.                   |
| `bbox?`         | `BoundingBox`                    | Si fournie, la vue effectue un fit à l'initialisation. |

## Composants

### `OlLayer`

Attache déclarativement une couche à la carte fournie par `OlMapProvider`.

```tsx
import { OlLayer } from "@/components/map";

<OlLayer layer={myLayer} style={myStyle} />;
```

| Prop      | Type                             | Description                                                             |
| --------- | -------------------------------- | ----------------------------------------------------------------------- |
| `layer`   | `BaseLayer`                      | Instance OL à attacher.                                                 |
| `style?`  | `CartesStyle \| GeostylerStyles` | Style appliqué via `StyleHelper.applyStyle`.                            |
| `index?`  | `number`                         | Position d'insertion dans `map.getLayers()` (cf. note #460 ci-dessous). |
| `zIndex?` | `number`                         | `zIndex` forcé après nettoyage des listeners LayerSwitcher.             |

**Note contournement #460** — `LayerSwitcher.removeLayer` réassigne le `zIndex` de toutes les couches vers le bas, ce qui crée une égalité de zIndex avec toute couche remontée au même instant (ex. fond de plan au remount HMR). La combinaison `index=0` (position en tête de Collection) + `zIndex=1` (forcé après `cleanLayerSwitcherListeners`) est le seul tie-breaker fiable. Voir `OlBackgroundLayer` pour l'application concrète.

### `OlControl`

```tsx
import { OlControl } from "@/components/map";
const zoom = useMemo(() => new GeoportalZoom({ position: "top-left" }), []);

<OlControl control={zoom} />;
```

### `OlInteraction`

```tsx
import { OlInteraction } from "@/components/map";
const drag = useMemo(() => new DragRotateAndZoom(), []);

<OlInteraction interaction={drag} />;
```

### `OlBackgroundLayer`

Fond de plan WMTS IGN (couche configurée dans `data/ol-defaults.json`). S'attache automatiquement à la carte courante avec `index=0` et `zIndex=1` (contournement #460).

```tsx
<OlBackgroundLayer />
```

## Hooks

### `useOlMap(options?)`

Crée l'instance `ol/Map`, l'attache à un `<div>` via une `ref`, observe ses redimensionnements.

```ts
import { useOlMap } from "@/components/map";

const { map, targetRef } = useOlMap({
    initialView: { projection: "EPSG:3857", center: [0, 0], zoom: 5 },
    defaultControls: false,
    defaultInteractions: true,
});
```

`initialView`, `defaultControls` et `defaultInteractions` sont des **snapshots** : seules les valeurs au premier rendu sont utilisées, les mises à jour ultérieures sont ignorées.

### `useOlMapContext()`

Consomme la carte exposée par `OlMapProvider`. Lève une erreur si appelé hors contexte.

```ts
import { useOlMapContext } from "@/components/map";
const { map } = useOlMapContext();
```

### `useBboxFit(map, bbox?, sourceCrs?, targetCrs?)`

Fit la vue à une `BoundingBox` (EPSG:4326 par défaut).

```ts
import { useBboxFit } from "@/components/map";
useBboxFit(map, service.bbox);
```

## Exemples d'extensibilité

Ces snippets illustrent comment ajouter des comportements au-dessus du module sans le modifier.

### Lire l'état de la carte (logs, debug)

```tsx
import { unByKey } from "ol/Observable";
import { useEffect } from "react";
import { useOlMapContext } from "@/components/map";

function MapViewLogger() {
    const { map } = useOlMapContext();

    useEffect(() => {
        if (!map) return;

        const log = () => {
            const view = map.getView();
            console.debug("[map] center:", view.getCenter(), "zoom:", view.getZoom());
        };

        log();
        const key = map.on("moveend", log);
        return () => unByKey(key);
    }, [map]);

    return null;
}
```

### Control custom ad hoc

```tsx
import Control from "ol/control/Control";
import { useEffect } from "react";
import { useOlMapContext } from "@/components/map";

function ButtonControlExample() {
    const { map } = useOlMapContext();

    useEffect(() => {
        if (!map) return;

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Action";
        button.addEventListener("click", () => console.debug("clicked"));

        const el = document.createElement("div");
        el.className = "ol-unselectable ol-control";
        el.style.padding = "0.25rem";
        el.appendChild(button);

        const control = new Control({ element: el });
        map.addControl(control);
        return () => map.removeControl(control);
    }, [map]);

    return null;
}
```

### Interaction déclarative

```tsx
import DragRotateAndZoom from "ol/interaction/DragRotateAndZoom";
import { useMemo } from "react";
import { OlInteraction } from "@/components/map";

function DragRotateExample() {
    const interaction = useMemo(() => new DragRotateAndZoom(), []);
    return <OlInteraction interaction={interaction} />;
}
```
