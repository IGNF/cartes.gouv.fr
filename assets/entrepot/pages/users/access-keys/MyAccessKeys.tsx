import { fr } from "@codegouvfr/react-dsfr";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { UserKeyDetailedWithAccessesResponseDto } from "../../../../@types/app";
import { PermissionWithOfferingsDetailsResponseDto, UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum } from "../../../../@types/entrepot";
import LoadingText from "../../../../components/Utils/LoadingText";
import { getTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import api from "../../../api";
import UserKeysListTab from "../keys/UserKeysListTab/UserKeysListTab";
import PermissionsListTab from "../permissions/PermissionsListTab";
import { routes } from "../../../../router/router";
import Main from "../../../../components/Layout/Main";
import Button from "@codegouvfr/react-dsfr/Button";
import "../../../../sass/components/buttons.scss";
import { useAuthStore } from "@/stores/AuthStore";

type MyAccessKeysProps = {
    activeTab: string;
};

const { t } = getTranslation("MyAccessKeys");

const MyAccessKeys: FC<MyAccessKeysProps> = ({ activeTab }) => {
    const user = useAuthStore((state) => state.user);

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

    /* Y-a-t-il deja une cle OAUTH2 */
    const hasOauth2 = useMemo(() => {
        const f = keys?.find((key) => key.type === UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum.OAUTH2);
        return !!f;
    }, [keys]);

    /* l'utilisateur a-t-il des permissions */
    const hasPermissions = useMemo(() => {
        return permissions !== undefined && permissions.length > 0;
    }, [permissions]);

    /* Ces permissions sont-elles toutes only_oauth a true */
    const permissionsAreAllOnlyOauth = useMemo(() => {
        const oauths = permissions?.filter((permission) => permission.only_oauth) ?? [];
        return oauths.length === permissions?.length;
    }, [permissions]);

    const canAdd = useMemo(() => {
        const hasReachedQuota = (user?.keys_use ?? 0) >= (user?.keys_quota ?? Infinity);
        return hasPermissions && !(hasOauth2 && permissionsAreAllOnlyOauth) && !hasReachedQuota;
    }, [hasPermissions, hasOauth2, permissionsAreAllOnlyOauth, user?.keys_use, user?.keys_quota]);

    return (
        <Main title={documentTitle}>
            <h1>{t("title")}</h1>
            {isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-4", "fr-mb-5v")}>
                        <SideMenu
                            align="left"
                            burgerMenuButtonText={t("burger_menu")}
                            className={fr.cx("fr-sidemenu--sticky-full-height")}
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
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                    <div className={fr.cx("fr-col-12", "fr-col-sm-7")}>
                                        <h2 className={fr.cx("fr-m-0")}>{t("my_access_keys")}</h2>
                                    </div>
                                    <div className={`frx-btns-group--right-sm frx-mt-sm-0 ${fr.cx("fr-col-12", "fr-col-sm-5", "fr-mt-5v")}`}>
                                        <Button
                                            iconId="fr-icon-arrow-right-s-line"
                                            iconPosition="right"
                                            {...(canAdd ? { linkProps: routes.user_key_add().link } : { disabled: true })}
                                        >
                                            {t("add_access_keys")}
                                        </Button>
                                    </div>
                                </div>
                                <UserKeysListTab keys={keys} permissions={permissions} />
                            </>
                        ) : (
                            <>
                                <h2>{t("my_permissions")}</h2>
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
