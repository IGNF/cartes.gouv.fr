import { fr } from "@codegouvfr/react-dsfr";
import MainNavigation from "@codegouvfr/react-dsfr/MainNavigation";

import { routes, useRoute } from "@/router/router";
import { tss } from "tss-react";

type DatastoreTertiaryNavigationProps = {
    datastoreId: string;
    communityId: string;
};
export default function DatastoreTertiaryNavigation(props: DatastoreTertiaryNavigationProps) {
    const { datastoreId, communityId } = props;
    const { name: routeName } = useRoute();

    const { classes } = useStyles();

    return (
        <MainNavigation
            items={[
                {
                    text: "Fiches de données",
                    linkProps: routes.datasheet_list({ datastoreId }).link,
                    isActive: routeName === "datasheet_list",
                },
                {
                    text: "Membres",
                    linkProps: routes.members_list({ communityId: communityId }).link,
                    isActive: routeName === "members_list",
                },
                {
                    text: "Permissions",
                    linkProps: routes.datastore_manage_permissions({ datastoreId }).link,
                    isActive: routeName === "datastore_manage_permissions",
                },
                {
                    text: "Consommation",
                    linkProps: routes.datastore_manage_storage({ datastoreId }).link,
                    isActive: routeName === "datastore_manage_storage",
                },
                // {
                //     text: "Info",
                //     linkProps: {
                //         href: "",
                //     },
                //     isActive: false,
                // },
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
