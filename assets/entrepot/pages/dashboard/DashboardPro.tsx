import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useMutation } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";

import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import useDatastoreList from "../../../hooks/useDatastoreList";
import { Translations, useTranslation } from "../../../i18n/i18n";
import Translator from "../../../modules/Translator";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { useApiEspaceCoStore } from "../../../stores/ApiEspaceCoStore";
import { useAuthStore } from "../../../stores/AuthStore";
import api from "../../api";

import avatarSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/avatar.svg";
import mailSendSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/mail-send.svg";
import humanCoopSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/environment/human-cooperation.svg";
import padlockSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/system/padlock.svg";

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

    const infoBannerMsg = (
        <>
            Votre avis compte ! Participez à notre questionnaire pour nous aider à améliorer la fonctionnalité d’alimentation et de diffusion. Merci pour votre
            contribution précieuse.{" "}
            <a
                href="https://analytics-eu.clickdimensions.com/ignfr-agj1s/pages/dhzzawfjee4wanoryvba.html?PageId=01d97c744961ef11bfe3000d3ab6156c"
                target="_blank"
                rel="noreferrer"
                title="Questionnaire sur la fonctionnalité alimentation et diffusion - Ouvre une nouvelle fenêtre"
            >
                Participer
            </a>
        </>
    );

    return (
        <AppLayout navItems={navItems} documentTitle={t("document_title")} infoBannerMsg={infoBannerMsg}>
            {datastoreListQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Bienvenue {user?.first_name ?? user?.user_name}</h1>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Tile
                                linkProps={routes.my_account().link}
                                imageUrl={avatarSvgUrl}
                                desc="Consulter et modifier mes informations personnelles"
                                orientation="horizontal"
                                title="Mon compte"
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Tile
                                linkProps={routes.my_access_keys().link}
                                imageUrl={padlockSvgUrl}
                                desc="Consulter et modifier mes clés d'accès aux services privés"
                                orientation="horizontal"
                                title="Mes clés d’accès"
                            />
                        </div>
                    </div>

                    <h2>Espaces de travail</h2>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        {datastoreListQuery.data?.map((datastore) => {
                            const link = { ...routes.datasheet_list({ datastoreId: datastore._id }).link, onClick: () => handleClick(datastore._id) };
                            return (
                                <div key={datastore._id} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                                    <Tile linkProps={link} grey={true} title={datastore.name} />
                                </div>
                            );
                        })}
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Tile
                                linkProps={routes.datastore_create_request().link}
                                imageUrl={mailSendSvgUrl}
                                desc="Contacter le support pour créer un nouvel espace de travail"
                                orientation="horizontal"
                                title={Translator.trans("datastore_creation_request.title")}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Tile
                                linkProps={routes.join_community().link}
                                imageUrl={humanCoopSvgUrl}
                                desc="Demander à rejoindre une communauté publique"
                                orientation="horizontal"
                                title={Translator.trans("communities_list.title")}
                            />
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
