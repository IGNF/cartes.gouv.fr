import { useMatches } from "@tanstack/react-router";

/** La route matchée appartient-elle au layout public (_public) ? Remplace groups.public.has(route) de type-route */
export default function useIsPublicRoute(): boolean {
    const matches = useMatches();
    return matches.some((match) => match.routeId === "/_public");
}
