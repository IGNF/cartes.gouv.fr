import { fr } from "@codegouvfr/react-dsfr";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC } from "react";
import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import { Translations, getTranslation } from "../../i18n/i18n";
import RQKeys from "../../modules/RQKeys";
import { AccessKeysAndPermissions } from "../../types/app";
import AccessKeysListTab from "./keys/AccessKeysListTab";

const { t } = getTranslation("MyAccessKeys");

/* const keys: UserKeyResponseDto[] = [
    {
        name: "Ma clé 1",
        type: UserKeyResponseDtoTypeEnum.HASH,
        _id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
    {
        name: "Ma clé 2",
        type: UserKeyResponseDtoTypeEnum.HEADER,
        _id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    },
]; */

const MyAccessKeys: FC = () => {
    const navItems = datastoreNavItems();

    // Les cles d'acces et les permissions
    const { data, isLoading } = useQuery<AccessKeysAndPermissions>({
        queryKey: RQKeys.access_keys_and_permissions(),
        queryFn: ({ signal }) => api.user.getAccessKeysAndPermissions({ signal }),
        staleTime: 3600000,
    });
    console.log(data);

    return (
        <AppLayout documentTitle={t("title")} navItems={navItems}>
            {isLoading ? (
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
                                    content: <AccessKeysListTab access_keys={data?.access_keys} />,
                                },
                                {
                                    label: t("my_permissions"),
                                    iconId: "ri-lock-line",
                                    content: <p>Content of tab2</p>,
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
export const { i18n } = declareComponentKeys<"title" | "my_keys" | "my_permissions">()("MyAccessKeys");

export const MyAccessKeysFrTranslations: Translations<"fr">["MyAccessKeys"] = {
    title: "Mes clés d'accès",
    my_keys: "Mes clés",
    my_permissions: "Mes permissions",
};

export const MyAccessKeysEnTranslations: Translations<"en">["MyAccessKeys"] = {
    title: "My access keys",
    my_keys: "My keys",
    my_permissions: "My permissions",
};
