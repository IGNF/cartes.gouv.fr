import { Link, type LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";

// Lien enregistré auprès de react-dsfr : Link TanStack si `to` est fourni, ancre native sinon.
// Sans `to`, le Link TanStack ignore `href` et cible la page courante marquée active (liens du chrome cassés).
// activeOptions exact : le fuzzy matching pose des aria-current="page" parasites sur les liens ancêtres
// (le DSFR désactive les liens [aria-current] du fil d'Ariane et surligne les items de nav).
// NB : composant volontairement hors de main.tsx — un composant React dans le module d'entrée HTML
// fait double-exécuter celui-ci par le self-import de react-refresh (?t=…) → double createRoot.
const RouterLink = forwardRef<HTMLAnchorElement, LinkProps & { href?: string }>(function RouterLink(props, ref) {
    if (props.to === undefined) {
        const { href, children, ...anchorProps } = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
        return (
            <a ref={ref} href={href} {...anchorProps}>
                {children}
            </a>
        );
    }
    return <Link ref={ref} activeOptions={{ exact: true, includeSearch: false }} {...props} />;
});

export default RouterLink;
