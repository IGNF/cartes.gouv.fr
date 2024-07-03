import { fr } from "@codegouvfr/react-dsfr";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC } from "react";
import { UserKeyDetailedWithAccessesResponseDto } from "../../../@types/app";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../@types/entrepot";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { Translations, getTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/entrepot/RQKeys";
import api from "../../api";
import UserKeysListTab from "./keys/UserKeysListTab";
import PermissionsListTab from "./permissions/PermissionsListTab";

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

// traductions
export const { i18n } = declareComponentKeys<"title" | { K: "explain"; R: JSX.Element } | "my_keys" | "permissions">()("MyAccessKeys");

export const MyAccessKeysFrTranslations: Translations<"fr">["MyAccessKeys"] = {
    title: "Mes clés d’accès",
    explain: (
        <>
            <p>{"Les données publiques sont par défaut disponibles sans création de clé d’accès."}</p>
            <span>Le cas échéant, cette section vous permet :</span>
            <ul className={fr.cx("fr-mb-2w")}>
                <li>{"De consulter les permissions d’accès aux services de diffusion qui vous ont été octroyées par le producteur de la donnée."}</li>
                <li>
                    {
                        "De créer les clés d’accès et d’exploiter dans vos outils (SIG, site internet, etc.) les permissions qui vous ont été accordées par le producteur de la donnée."
                    }
                </li>
            </ul>
        </>
    ),
    my_keys: "Mes clés",
    permissions: "Permissions",
};

export const MyAccessKeysEnTranslations: Translations<"en">["MyAccessKeys"] = {
    title: "My access keys",
    explain: undefined,
    my_keys: "My keys",
    permissions: "Permissions",
};
