import { fr } from "@codegouvfr/react-dsfr";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { tss } from "tss-react";

import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import { useTranslation } from "@/i18n";
import { routes, useRoute } from "@/router/router";

type DatastoreSideMenuProps = {
    datastoreId?: string;
    communityId?: string;
};
export default function DatastoreSideMenu({ datastoreId, communityId }: DatastoreSideMenuProps) {
    const { t: tCommon } = useTranslation("Common");
    const route = useRoute();
    const { classes, css, cx } = useStyles();

    const { datastoreList, addUserToSandbox, sandboxDatastore, userMemberOfSandbox } = useDatastoreSelection();

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
                        <h1 className={fr.cx("fr-text--xl", "fr-m-0")}>Mes données</h1>
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
                    linkProps: routes.datastore_selection().link,
                    expandedByDefault: true,
                    isActive: route.name === routes.datastore_selection().name,
                },
                ...datastoreList.map((datastore) => ({
                    text: datastore._id === sandboxDatastore?._id ? tCommon("sandbox") : datastore.name,
                    linkProps:
                        datastore.is_sandbox === true && !userMemberOfSandbox
                            ? { ...routes.datasheet_list({ datastoreId: sandboxDatastore!._id }).link, onClick: () => addUserToSandbox() }
                            : routes.datasheet_list({ datastoreId: datastore._id }).link,
                    isActive: datastoreId === datastore._id || communityId === datastore.community_id,
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
