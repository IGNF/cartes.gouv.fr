import { fr } from "@codegouvfr/react-dsfr";
import MainNavigation from "@codegouvfr/react-dsfr/MainNavigation";
import { useMatchRoute } from "@tanstack/react-router";
import { tss } from "tss-react";

type DatastoreTertiaryNavigationProps = {
    datastoreId: string;
    communityId: string;
};
export default function DatastoreTertiaryNavigation(props: DatastoreTertiaryNavigationProps) {
    const { datastoreId, communityId } = props;
    const matchRoute = useMatchRoute();

    const { classes } = useStyles();

    return (
        <MainNavigation
            items={[
                {
                    text: "Fiches de données",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } },
                    isActive: !!matchRoute({ to: "/tableau-de-bord/entrepots/$datastoreId/donnees" }),
                },
                {
                    text: "Membres",
                    linkProps: { to: "/tableau-de-bord/communaute/$communityId/membres", params: { communityId } },
                    isActive: !!matchRoute({ to: "/tableau-de-bord/communaute/$communityId/membres" }),
                },
                {
                    text: "Permissions",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/permissions", params: { datastoreId } },
                    isActive: !!matchRoute({ to: "/tableau-de-bord/entrepots/$datastoreId/permissions" }),
                },
                {
                    text: "Consommation",
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/consommation", params: { datastoreId } },
                    isActive: !!matchRoute({ to: "/tableau-de-bord/entrepots/$datastoreId/consommation" }),
                },
                {
                    text: "Info",
                    linkProps: { to: "/tableau-de-bord/communaute/$communityId", params: { communityId } },
                    isActive: !!matchRoute({ to: "/tableau-de-bord/communaute/$communityId" }),
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
