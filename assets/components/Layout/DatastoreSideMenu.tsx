import { fr } from "@codegouvfr/react-dsfr";
import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { useMatches } from "@tanstack/react-router";
import { MouseEvent } from "react";
import { tss } from "tss-react";

import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import { useTranslation } from "@/i18n";

type DatastoreSideMenuProps = {
    datastoreId?: string;
    communityId?: string;
};
export default function DatastoreSideMenu({ datastoreId, communityId }: DatastoreSideMenuProps) {
    const { t: tCommon } = useTranslation("Common");
    const onSelection = useMatches({ select: (matches) => matches.at(-1)?.routeId === "/_private/_panneau/tableau-de-bord/entrepots/" });
    const { classes, css, cx } = useStyles();

    const { datastoreList, addUserToSandbox } = useDatastoreSelection();

    return (
        <SideMenu
            title={
                <div
                    className={css({
                        margin: `${fr.spacing("6v")} ${fr.spacing("8v")} ${fr.spacing("4v")} 0`,
                        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                    })}
                >
                    <div
                        className={css({
                            display: "flex",
                            gap: fr.spacing("2v"),
                            flexDirection: "row",
                            alignItems: "center",
                            alignSelf: "stretch",
                        })}
                    >
                        <span className={fr.cx("fr-icon-database-line", "fr-icon--md")} aria-hidden="true" />
                        <h1 className={fr.cx("fr-text--xl", "fr-m-0")}>Mes entrepôts</h1>
                    </div>
                    <p
                        className={cx(
                            fr.cx("fr-text--xs", "fr-mb-4v"),
                            css({
                                color: fr.colors.decisions.text.mention.grey.default,
                                fontWeight: "normal",
                            })
                        )}
                    >
                        Gérer mes entrepôts et mes fiches de données
                    </p>
                </div>
            }
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
