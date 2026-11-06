import { fr } from "@codegouvfr/react-dsfr";
import MainNavigation from "@codegouvfr/react-dsfr/MainNavigation";
import { useMatches } from "@tanstack/react-router";
import { tss } from "tss-react";

import type { RouteId } from "@/router";

type DatastoreTertiaryNavigationProps = {
    datastoreId: string;
};

// routes de chaque onglet ; Membres et Info existent aussi sous l’URL de la communauté
const TAB_ROUTES = {
    datasheets: ["/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/donnees/"],
    members: ["/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/membres", "/_private/tableau-de-bord/communaute/$communityId/_onglets/membres"],
    permissions: ["/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/permissions/"],
    storage: ["/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/consommation"],
    info: ["/_private/tableau-de-bord/entrepots/$datastoreId/_onglets/info", "/_private/tableau-de-bord/communaute/$communityId/_onglets/"],
} satisfies Record<string, RouteId[]>;

export default function DatastoreTertiaryNavigation({ datastoreId }: DatastoreTertiaryNavigationProps) {
    const routeId = useMatches({ select: (matches) => matches.at(-1)?.routeId });
    const params = { datastoreId };
    const isTab = (tab: keyof typeof TAB_ROUTES) => routeId !== undefined && (TAB_ROUTES[tab] as RouteId[]).includes(routeId);

    const { classes } = useStyles();

    return (
        <MainNavigation
            items={[
                {
                    text: "Fiches de données",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params },
                    isActive: isTab("datasheets"),
                },
                {
                    text: "Membres",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/membres", params },
                    isActive: isTab("members"),
                },
                {
                    text: "Permissions",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/permissions", params },
                    isActive: isTab("permissions"),
                },
                {
                    text: "Consommation",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/consommation", params },
                    isActive: isTab("storage"),
                },
                {
                    text: "Info",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/info", params },
                    isActive: isTab("info"),
                },
            ]}
            classes={{
                root: classes.root,
            }}
        />
    );
}

const useStyles = tss.withName({ DatastoreTertiaryNavigation }).create({
    root: {
        backgroundImage: `linear-gradient(to right, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default})`,
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 2px",
    },
});
