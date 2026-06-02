import type BaseLayer from "ol/layer/Base";

// Contournement du bug geopf-extensions-openlayers issue #460 (présent depuis beta.6).
// LayerSwitcher stocke les listeners par couche dans des champs uniques (`this._listeners.update*`)
// écrasés à chaque appel addLayer. Lors de la création d'une nouvelle instance de LayerSwitcher
// (HMR, cycle mount de StrictMode), les anciens listeners restent attachés aux objets BaseLayer
// et plantent en accédant à `_layers[id]` de l'instance désormais détruite.
// Ce helper purge ces listeners orphelins et réinitialise les marqueurs posés par LayerSwitcher
// sur les couches, afin que la nouvelle instance les traite comme neuves.

const LS_EVENT_TYPES = ["change:opacity", "change:visible", "change:grayscale", "change:locked", "propertychange", "change:zIndex"] as const;

// le champ privé `listeners_` de ol/events/Target présent dans BaseLayer.
interface OlInternals {
    listeners_?: Partial<Record<string, unknown[]>>;
    gpLayerId?: number;
}

export function cleanLayerSwitcherListeners(layer: BaseLayer): void {
    const l = layer as unknown as OlInternals;

    if (l.listeners_) {
        for (const type of LS_EVENT_TYPES) {
            if (l.listeners_[type]) {
                l.listeners_[type] = [];
            }
        }
    }

    delete l.gpLayerId;
    layer.setZIndex(0);
}
