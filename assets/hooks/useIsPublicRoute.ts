import { useMatches } from "@tanstack/react-router";

/** page accessible sans connexion (layout `_public`) */
export default function useIsPublicRoute(): boolean {
    return useMatches({ select: (matches) => matches.some((match) => match.staticData.public === true) });
}
