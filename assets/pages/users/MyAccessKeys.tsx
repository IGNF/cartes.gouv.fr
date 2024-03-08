import { fr } from "@codegouvfr/react-dsfr";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useMemo } from "react";
import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import { Translations, getTranslation } from "../../i18n/i18n";
import RQKeys from "../../modules/RQKeys";
import { UserKeysWithAccessesResponseDto } from "../../types/app";
import { PermissionDetailsResponseDto } from "../../types/entrepot";
import UserKeysListTab from "./keys/UserKeysListTab";
import PermissionsListTab from "./permissions/PermissionsListTab";

const { t } = getTranslation("MyAccessKeys");

const MyAccessKeys: FC = () => {
    const navItems = datastoreNavItems();

    // Les cles d'acces
    const { data: keys, isLoading: isLoadingKeys } = useQuery<UserKeysWithAccessesResponseDto[]>({
        queryKey: RQKeys.me_keys(),
        queryFn: ({ signal }) => api.user.getMyKeysWithAccesses({ signal }),
        staleTime: 3600000,
    });

    // Les permissions
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery<PermissionDetailsResponseDto[]>({
        queryKey: RQKeys.me_permissions(),
        queryFn: ({ signal }) => api.user.getMyDetailedPermissions({ signal }),
        staleTime: 3600000,
    });

    const hasPermissions = useMemo(() => {
        return permissions !== undefined && permissions.length > 0;
    }, [permissions]);

    return (
        <AppLayout documentTitle={t("title")} navItems={navItems}>
            {isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                        <h1>{t("title")}</h1>
                        <Tabs
                            tabs={[
                                {
                                    label: t("my_keys"),
                                    iconId: "ri-key-2-line",
                                    isDefault: true,
                                    content: <UserKeysListTab keys={keys} hasPermissions={hasPermissions} />,
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

// traductions
export const { i18n } = declareComponentKeys<"title" | "my_keys" | "permissions">()("MyAccessKeys");

export const MyAccessKeysFrTranslations: Translations<"fr">["MyAccessKeys"] = {
    title: "Mes clés d'accès",
    my_keys: "Mes clés",
    permissions: "Permissions",
};

export const MyAccessKeysEnTranslations: Translations<"en">["MyAccessKeys"] = {
    title: "My access keys",
    my_keys: "My keys",
    permissions: "Permissions",
};
