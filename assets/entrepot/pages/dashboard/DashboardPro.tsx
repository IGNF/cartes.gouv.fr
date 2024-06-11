import { fr } from "@codegouvfr/react-dsfr";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import useDatastoreList from "../../../hooks/useDatastoreList";
import Translator from "../../../modules/Translator";
import { routes } from "../../../router/router";
import { useAuthStore } from "../../../stores/AuthStore";
import { useMutation } from "@tanstack/react-query";
import { CartesApiException } from "../../../modules/jsonFetch";
import api from "../../api";
import Button from "@codegouvfr/react-dsfr/Button";
import { useApiEspaceCoStore } from "../../../stores/ApiEspaceCoStore";
import { declareComponentKeys } from "i18nifty";
import { Translations, useTranslation } from "../../../i18n/i18n";

const DashboardPro = () => {
    const datastoreListQuery = useDatastoreList();
    const navItems = datastoreNavItems();

    const { user } = useAuthStore();
    const isApiEspaceCoDefined = useApiEspaceCoStore((state) => state.isUrlDefined);

    const { t } = useTranslation("DashboardPro");

    const { mutate } = useMutation<undefined, CartesApiException>({
        mutationFn: () => {
            return api.user.addToSandbox();
        },
    });

    const handleClick = (datastoreId) => {
        mutate(undefined, { onSuccess: () => routes.datasheet_list({ datastoreId: datastoreId }).push() });
    };

    return (
        <AppLayout navItems={navItems} documentTitle={t("document_title")}>
            {datastoreListQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Bienvenue {user?.first_name ?? user?.user_name}</h1>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        {datastoreListQuery.data?.map((datastore) => {
                            const link = { ...routes.datasheet_list({ datastoreId: datastore._id }).link, onClick: () => handleClick(datastore._id) };
                            return (
                                <div key={datastore._id} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                                    <Tile linkProps={link} grey={true} title={datastore.name} />
                                </div>
                            );
                        })}
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                            <Tile linkProps={routes.datastore_create_request().link} grey={true} title={Translator.trans("datastore_creation_request.title")} />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                            <Tile linkProps={routes.join_community().link} grey={true} title={Translator.trans("communities_list.title")} />
                        </div>
                    </div>
                    {isApiEspaceCoDefined() && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--left", "fr-mt-4w")}>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("espaceco_frontoffice_list")}</Button>
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
};

export default DashboardPro;

export const { i18n } = declareComponentKeys<"document_title" | "espaceco_frontoffice_list">()("DashboardPro");

export const DashboardProFrTranslations: Translations<"fr">["DashboardPro"] = {
    document_title: "Tableau de bord professionnel",
    espaceco_frontoffice_list: "Liste des guichets de l’espace collaboratif",
};

export const DashboardProEnTranslations: Translations<"fr">["DashboardPro"] = {
    document_title: "Professional dashboard",
    espaceco_frontoffice_list: "List of collaborative space front offices",
};
