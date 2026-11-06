import { Link, type LinkProps } from "@tanstack/react-router";
import { AnchorHTMLAttributes, forwardRef } from "react";

/** liens dont l’identité vit dans la recherche (pagination) : seul le lien de la page courante est actif */
export const searchAwareActiveOptions: LinkProps["activeOptions"] = { exact: true, includeSearch: true };

/**
 * Lien enregistré auprès de react-dsfr : Link TanStack si `to` est fourni, ancre native sinon
 * (sans `to`, le Link TanStack ignore `href` et pointe vers la page courante).
 * `exact: true` évite les aria-current="page" sur les liens ancêtres (fil d’Ariane désactivé, navigation surlignée).
 */
const AppLink = forwardRef<HTMLAnchorElement, LinkProps & { href?: string }>(function AppLink(props, ref) {
    if (props.to === undefined) {
        const { children, ...anchorProps } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
        return (
            <a ref={ref} {...anchorProps}>
                {children}
            </a>
        );
    }
    return <Link ref={ref} activeOptions={{ exact: true, includeSearch: false }} {...props} />;
});

export default AppLink;
