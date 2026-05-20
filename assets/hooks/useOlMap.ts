import Map from "ol/Map";
import { unByKey } from "ol/Observable";
import View, { type ViewOptions } from "ol/View";
import { defaults as olDefaultControls } from "ol/control";
import { defaults as olDefaultInteractions } from "ol/interaction";
import { useEffect, useRef, useState } from "react";

export interface UseOlMapOptions {
    /** Options de la vue initiale — snapshot au montage, les changements ultérieurs sont ignorés. */
    initialView?: ViewOptions;
    /** Installe les contrôles par défaut d'OL (Zoom, Rotate, Attribution) à la création. Défaut : true. */
    defaultControls?: boolean;
    /** Installe les interactions par défaut d'OL (DragPan, MouseWheelZoom, etc.) à la création. Défaut : true. */
    defaultInteractions?: boolean;
}

export function useOlMap(options: UseOlMapOptions = {}) {
    const { initialView, defaultControls = true, defaultInteractions = true } = options;
    const targetRef = useRef<HTMLDivElement>(null);
    /**
     * mapRef — accès synchrone à l'instance (création, effets, callbacks OL).
     * mapState — copie déclenche un re-render pour que <MapProvider> propage la carte aux enfants.
     */
    const mapRef = useRef<Map>();
    const [mapState, setMapState] = useState<Map | undefined>(undefined);
    const resizeObserver = useRef<ResizeObserver>();

    // Crée l'instance une seule fois — initialView, defaultControls et defaultInteractions
    // sont des snapshots : les valeurs au premier rendu sont capturées, les suivantes ignorées.
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = new Map({
                view: new View(initialView ?? {}),
                controls: defaultControls ? olDefaultControls() : [],
                interactions: defaultInteractions ? olDefaultInteractions() : [],
            });
            setMapState(mapRef.current);

            const onLoadStart = () => {
                const el = mapRef.current?.getTargetElement();
                el?.classList.add("spinner");
            };
            const onLoadEnd = () => {
                const el = mapRef.current?.getTargetElement();
                el?.classList.remove("spinner");
            };

            const key1 = mapRef.current.on("loadstart", onLoadStart);
            const key2 = mapRef.current.on("loadend", onLoadEnd);

            // Supprimer les listeners au unmount
            return () => {
                unByKey(key1);
                unByKey(key2);
            };
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Attache la carte à l'élément DOM et observe ses redimensionnements.
    // Dépend de [] : l'élément cible ne change pas (même ref), resizeObserver est géré manuellement.
    useEffect(() => {
        const map = mapRef.current;
        const el = targetRef.current;
        if (!map) return;

        map.setTarget(el || "");

        if (el && typeof ResizeObserver !== "undefined") {
            resizeObserver.current = new ResizeObserver(() => map.updateSize());
            resizeObserver.current.observe(el);
        }

        return () => {
            if (resizeObserver.current && el) {
                resizeObserver.current.unobserve(el);
                if (typeof resizeObserver.current.disconnect === "function") {
                    resizeObserver.current.disconnect();
                }
                resizeObserver.current = undefined;
            }
            map.setTarget(undefined);
        };
    }, []);

    return { map: mapState, targetRef } as const;
}

export default useOlMap;
