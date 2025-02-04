import { fr } from "@codegouvfr/react-dsfr";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

import { UserKeyDetailedWithAccessesResponseDto } from "../../../../@types/app";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../../@types/entrepot";
import AppLayout from "../../../../components/Layout/AppLayout";
import LoadingText from "../../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../../config/navItems/datastoreNavItems";
import { getTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import api from "../../../api";
import UserKeysListTab from "../keys/UserKeysListTab/UserKeysListTab";
import PermissionsListTab from "../permissions/PermissionsListTab";
import { routes } from "../../../../router/router";

type MyAccessKeysProps = {
    activeTab: string;
};

const { t } = getTranslation("MyAccessKeys");

const MyAccessKeys: FC<MyAccessKeysProps> = ({ activeTab }) => {
    const navItems = datastoreNavItems();

    const tab = activeTab;

    const documentTitle = tab === "keys" ? t("my_access_keys") : t("my_permissions");

    // Les cles d'acces
    const { data: keys, isLoading: isLoadingKeys } = useQuery<UserKeyDetailedWithAccessesResponseDto[]>({
        queryKey: RQKeys.my_keys(),
        queryFn: ({ signal }) => api.user.getMyKeysDetailedWithAccesses({ signal }),
        staleTime: 3600000,
    });

    // Les permissions
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery<PermissionWithOfferingsDetailsResponseDto[]>({
        queryKey: RQKeys.my_permissions(),
        queryFn: ({ signal }) => api.user.getMyPermissions({ signal }),
        staleTime: 3600000,
    });

    return (
        <AppLayout documentTitle={documentTitle} navItems={navItems}>
            {isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                        <SideMenu
                            align="left"
                            burgerMenuButtonText={"Dans cette rubrique"}
                            items={[
                                {
                                    isActive: tab === "keys",
                                    linkProps: {
                                        href: "#",
                                        onClick: async () => {
                                            routes.my_access_keys().push();
                                        },
                                    },
                                    text: t("my_access_keys"),
                                },
                                {
                                    isActive: tab === "permissions",
                                    linkProps: {
                                        href: "#",
                                        onClick: async () => {
                                            routes.my_permissions().push();
                                        },
                                    },
                                    text: t("my_permissions"),
                                },
                            ]}
                        />
                    </div>

                    <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                        {tab === "keys" ? (
                            <>
                                <h1>{t("my_access_keys")}</h1>
                                {t("explain_my_keys")}
                                <UserKeysListTab keys={keys} permissions={permissions} />
                            </>
                        ) : (
                            <>
                                <h1>{t("my_permissions")}</h1>
                                {t("explain_my_permissions")}
                                <PermissionsListTab permissions={permissions} />
                            </>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default MyAccessKeys;
