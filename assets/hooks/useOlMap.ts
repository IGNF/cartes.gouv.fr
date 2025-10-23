import { useEffect, useMemo, useRef, useState } from "react";
import Map from "ol/Map";
import View, { type ViewOptions } from "ol/View";
import type Control from "ol/control/Control";
import type Interaction from "ol/interaction/Interaction";
import Collection from "ol/Collection";
import { unByKey } from "ol/Observable";
import { defaults as defaultInteractions } from "ol/interaction";

export interface UseOlMapOptions {
    view?: ViewOptions;
    interactions?: Interaction[] | Collection<Interaction> | undefined;
    controls?: Control[] | Collection<Control> | undefined;
}

export function useOlMap(options: UseOlMapOptions = {}) {
    const targetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();
    const [mapState, setMapState] = useState<Map | undefined>(undefined);
    const resizeObserver = useRef<ResizeObserver>();

    const handlers = useMemo(() => {
        const onLoadStart = () => {
            const el = mapRef.current?.getTargetElement();
            el?.classList.add("spinner");
        };
        const onLoadEnd = () => {
            const el = mapRef.current?.getTargetElement();
            el?.classList.remove("spinner");
        };
        return { onLoadStart, onLoadEnd };
    }, []);

    // Créer l'instance de la carte une seule fois
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = new Map({
                view: new View(options.view ?? {}),
                interactions: options.interactions ?? defaultInteractions(),
                controls: options.controls,
            });
            setMapState(mapRef.current);

            const key1 = mapRef.current.on("loadstart", handlers.onLoadStart);
            const key2 = mapRef.current.on("loadend", handlers.onLoadEnd);

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
            }
            map.setTarget(undefined);
        };
    }, []);

    return { map: mapState, targetRef } as const;
}

export default useOlMap;
