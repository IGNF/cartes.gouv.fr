import { useEffect, useRef } from "react";

// Enregistrement de custom element
// @ts-expect-error export erroné
import "ign-dsfr-header/dist/ign-dsfr-header.js";

export interface IgnfDsfrHeaderProps {
    minimized?: boolean;
    menuItems?: IgnDsfrHeaderMenuItem[];
    className?: string;
}

export default function IgnfDsfrHeader({ minimized = false, menuItems }: IgnfDsfrHeaderProps) {
    const ref = useRef<IgnDsfrHeaderElement | null>(null);

    useEffect(() => {
        const el = ref.current as unknown as IgnDsfrHeaderElement | null;
        if (!el) return;
        el.minimized = minimized ?? false;
        el.menuItems = menuItems ?? [];
    }, [minimized, menuItems]);

    return <ign-dsfr-header ref={ref} />;
}
