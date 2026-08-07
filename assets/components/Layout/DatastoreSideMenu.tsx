import { fr } from "@codegouvfr/react-dsfr";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { tss } from "tss-react";

import { useMatchRoute } from "@tanstack/react-router";

import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import { useTranslation } from "@/i18n";

type DatastoreSideMenuProps = {
    datastoreId?: string;
    communityId?: string;
};
export default function DatastoreSideMenu({ datastoreId, communityId }: DatastoreSideMenuProps) {
    const { t: tCommon } = useTranslation("Common");
    const matchRoute = useMatchRoute();
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
                        <span className={fr.cx("fr-icon-database-line", "fr-icon--md")} />
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
                    isActive: !!matchRoute({ to: "/tableau-de-bord/entrepots" }),
                },
                ...datastoreList.map((datastore) => ({
                    text: datastore.is_sandbox === true ? tCommon("sandbox") : datastore.name,
                    linkProps:
                        datastore._id !== undefined
                            ? { to: "/tableau-de-bord/entrepots/$datastoreId/donnees" as const, params: { datastoreId: datastore._id } }
                            : {
                                  href: "#",
                                  onClick: (e) => {
                                      e.preventDefault();
                                      addUserToSandbox();
                                  },
                              },
                    isActive: (datastore._id !== undefined && datastoreId === datastore._id) || communityId === datastore.community_id,
                })),
            ]}
            classes={{
                root: classes.root,
                inner: classes.inner,
            }}
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
