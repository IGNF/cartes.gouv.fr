import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { useMatches } from "@tanstack/react-router";
import { MouseEvent } from "react";
import { tss } from "tss-react";

import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import { useTranslation } from "@/i18n";
import SidePanelHeader from "./SidePanelHeader";

type DatastoreSideMenuProps = {
    datastoreId?: string;
    communityId?: string;
};
export default function DatastoreSideMenu({ datastoreId, communityId }: DatastoreSideMenuProps) {
    const { t: tCommon } = useTranslation("Common");
    const onSelection = useMatches({ select: (matches) => matches.at(-1)?.routeId === "/_private/_panneau/tableau-de-bord/entrepots/" });
    const { classes } = useStyles();

    const { datastoreList, addUserToSandbox } = useDatastoreSelection();

    return (
        <SideMenu
            title={<SidePanelHeader iconId="fr-icon-database-line" title="Mes entrepôts" description="Gérer mes entrepôts et mes fiches de données" />}
            burgerMenuButtonText="Entrepôts"
            items={[
                {
                    text: "Tous les entrepôts",
                    linkProps: { to: "/tableau-de-bord/entrepots" },
                    expandedByDefault: true,
                    isActive: onSelection,
                },
                ...datastoreList.map((datastore) => ({
                    text: tCommon("datastore_name", { name: datastore.name, isSandbox: datastore.is_sandbox }),
                    linkProps: (datastore._id !== undefined
                        ? { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId: datastore._id } }
                        : {
                              href: "#",
                              onClick: (e: MouseEvent<HTMLAnchorElement>) => {
                                  e.preventDefault();
                                  addUserToSandbox();
                              },
                          }) satisfies RegisteredLinkProps as RegisteredLinkProps,
                    isActive: (datastore._id !== undefined && datastoreId === datastore._id) || communityId === datastore.community_id,
                })),
            ]}
            classes={{
                root: classes.root,
                inner: classes.inner,
            }}
            // @ts-expect-error react-dsfr SideMenu ne type pas role mais le propage sur sa balise nav
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- rendu sur un <nav>, role explicite du balisage DSFR (#1188)
            role="navigation"
        />
    );
}

const useStyles = tss.withName({ DatastoreSideMenu }).create({
    root: {
        padding: 0,
    },
    inner: {
        padding: 0,
        boxShadow: "none",
    },
});
