import { fr } from "@codegouvfr/react-dsfr";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

import { UserKeyDetailedWithAccessesResponseDto } from "../../../../@types/app";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../../@types/entrepot";
import LoadingText from "../../../../components/Utils/LoadingText";
import { getTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import api from "../../../api";
import UserKeysListTab from "../keys/UserKeysListTab/UserKeysListTab";
import PermissionsListTab from "../permissions/PermissionsListTab";
import { routes } from "../../../../router/router";
import Main from "../../../../components/Layout/Main";

type MyAccessKeysProps = {
    activeTab: string;
};

const { t } = getTranslation("MyAccessKeys");

const MyAccessKeys: FC<MyAccessKeysProps> = ({ activeTab }) => {
    const tab = activeTab;

    const documentTitle = tab === "keys" ? t("my_access_keys") : t("my_permissions");

    // Les cles d'acces
    const { data: keys, isLoading: isLoadingKeys } = useQuery<UserKeyDetailedWithAccessesResponseDto[]>({
        queryKey: RQKeys.my_keys(),
        queryFn: ({ signal }) => api.user.getMyKeysDetailedWithAccesses({ signal }),
        staleTime: 30000,
    });

    // Les permissions
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery<PermissionWithOfferingsDetailsResponseDto[]>({
        queryKey: RQKeys.my_permissions(),
        queryFn: ({ signal }) => api.user.getMyPermissions({ signal }),
        staleTime: 30000,
    });

    return (
        <Main title={documentTitle}>
            {isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                        <SideMenu
                            align="left"
                            burgerMenuButtonText={t("burger_menu")}
                            items={[
                                {
                                    isActive: tab === "keys",
                                    linkProps: routes.my_access_keys().link,
                                    text: t("my_access_keys"),
                                },
                                {
                                    isActive: tab === "permissions",
                                    linkProps: routes.my_permissions().link,
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
        </Main>
    );
};

export default MyAccessKeys;
