import { Link, type LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";

/** activeOptions pour les liens dont l'identité vit dans les search params (pagination) : seul le lien de la page courante est actif. */
export const searchAwareActiveOptions: LinkProps["activeOptions"] = { exact: true, includeSearch: true };

/**
 * Lien enregistré auprès de react-dsfr : Link TanStack si `to` est fourni, ancre native sinon.
 *
 * Sans `to`, le Link TanStack ignore `href` et cible la page courante marquée active (liens de l'en-tête et du pied de page cassés).
 *
 * `activeOptions` :
 *
 * `exact: true` : le fuzzy matching pose des aria-current="page" parasites sur les liens ancêtres (le DSFR désactive les liens [aria-current] du fil d'Ariane et surligne les items de nav).
 *
 * `includeSearch: false` : les liens de navigation (en-tête, menu) restent actifs quelle que soit la search ; surcharger par lien (searchAwareActiveOptions) quand l'identité du lien vit dans la search (pagination).
 */
const AppLink = forwardRef<HTMLAnchorElement, LinkProps & { href?: string }>(function AppLink(props, ref) {
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

export default AppLink;
