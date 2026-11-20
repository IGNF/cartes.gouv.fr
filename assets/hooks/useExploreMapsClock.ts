import { useEffect, useState } from "react";

import { type ServiceListItem } from "@/@types/app";
import { getNextExploreMapsPendingEnd } from "@/utils";

/** instant de référence du délai « En cours » d’Explorer les cartes, réveillé à sa sortie ; `services` doit être stable */
const useExploreMapsClock = (services: ServiceListItem[], readAt: number): number => {
    const [clockTick, setClockTick] = useState(0);
    const now = Math.max(readAt, clockTick);

    useEffect(() => {
        const nextPendingEnd = getNextExploreMapsPendingEnd(services, now);
        if (nextPendingEnd === undefined) return;
        const timer = window.setTimeout(() => setClockTick(Date.now()), nextPendingEnd - now + 1000);
        return () => window.clearTimeout(timer);
    }, [services, now]);

    return now;
};

export default useExploreMapsClock;
