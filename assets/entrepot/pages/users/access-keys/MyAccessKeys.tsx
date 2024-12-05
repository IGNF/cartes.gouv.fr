import { fr } from "@codegouvfr/react-dsfr";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
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

const { t } = getTranslation("MyAccessKeys");

const MyAccessKeys: FC = () => {
    const navItems = datastoreNavItems();

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
        <AppLayout documentTitle={t("title")} navItems={navItems}>
            {isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                        <h1>{t("title")}</h1>
                        {t("explain")}
                        <Tabs
                            tabs={[
                                {
                                    label: t("my_keys"),
                                    iconId: "ri-key-2-line",
                                    isDefault: true,
                                    content: <UserKeysListTab keys={keys} permissions={permissions} />,
                                },
                                {
                                    label: t("permissions"),
                                    iconId: "ri-lock-line",
                                    content: <PermissionsListTab permissions={permissions} />,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default MyAccessKeys;
