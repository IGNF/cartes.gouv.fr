import Collection from "ol/Collection";
import Map from "ol/Map";
import { unByKey } from "ol/Observable";
import View, { type ViewOptions } from "ol/View";
import type Control from "ol/control/Control";
import { defaults as defaultInteractions } from "ol/interaction";
import type Interaction from "ol/interaction/Interaction";
import { useEffect, useRef, useState } from "react";

export interface UseOlMapOptions {
    view?: ViewOptions;
    interactions?: Interaction[] | Collection<Interaction> | undefined;
    controls?: Control[] | Collection<Control> | undefined;
}

export function useOlMap(options: UseOlMapOptions = {}) {
    const { controls, interactions, view } = options;
    const targetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();
    const [mapState, setMapState] = useState<Map | undefined>(undefined);
    const resizeObserver = useRef<ResizeObserver>();

    // Créer l'instance de la carte une seule fois
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = new Map({
                view: new View(view ?? {}),
                interactions: interactions ?? defaultInteractions(),
                controls: controls,
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

    // Attacher à l'élément et configurer le resize observer
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
