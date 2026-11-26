import { type StaticDataRouteOption } from "@tanstack/react-router";

export type MatchWithStaticData = { staticData: StaticDataRouteOption };

/** espace du match le plus profond qui en déclare un : un layout couvre ses feuilles */
export function routeSpace(matches: MatchWithStaticData[]): StaticDataRouteOption["space"] {
    return matches.findLast((match) => match.staticData.space)?.staticData.space;
}
