import { fr } from "@codegouvfr/react-dsfr";
import MainNavigation from "@codegouvfr/react-dsfr/MainNavigation";
import { useMatches } from "@tanstack/react-router";
import { tss } from "tss-react";

type DatastoreTertiaryNavigationProps = {
    datastoreId: string;
};

const TABS = "/_private/tableau-de-bord/entrepots/$datastoreId/_onglets";
const COMMUNITY_TABS = "/_private/tableau-de-bord/communaute/$communityId/_onglets";

export default function DatastoreTertiaryNavigation({ datastoreId }: DatastoreTertiaryNavigationProps) {
    const routeId = useMatches({ select: (matches) => matches.at(-1)?.routeId });
    const params = { datastoreId };

    const { classes } = useStyles();

    return (
        <MainNavigation
            items={[
                {
                    text: "Fiches de données",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params },
                    isActive: routeId === `${TABS}/donnees/`,
                },
                {
                    text: "Membres",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/membres", params },
                    isActive: routeId === `${TABS}/membres` || routeId === `${COMMUNITY_TABS}/membres`,
                },
                {
                    text: "Permissions",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/permissions", params },
                    isActive: routeId === `${TABS}/permissions/`,
                },
                {
                    text: "Consommation",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/consommation", params },
                    isActive: routeId === `${TABS}/consommation`,
                },
                {
                    text: "Info",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/info", params },
                    isActive: routeId === `${TABS}/info` || routeId === `${COMMUNITY_TABS}/`,
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
