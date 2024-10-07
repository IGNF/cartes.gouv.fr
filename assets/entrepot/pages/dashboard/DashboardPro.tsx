import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useMutation, useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { useEffect } from "react";

import { CartesUser, Datastore } from "../../../@types/app";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { Translations, useTranslation } from "../../../i18n/i18n";
import Translator from "../../../modules/Translator";
import RQKeys from "../../../modules/entrepot/RQKeys";
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
    const { t } = useTranslation("DashboardPro");

    const navItems = datastoreNavItems();

    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const isApiEspaceCoDefined = useApiEspaceCoStore((state) => state.isUrlDefined);

    const userQuery = useQuery<CartesUser, CartesApiException>({
        queryKey: RQKeys.user_me(),
        queryFn: ({ signal }) => api.user.getMe({ signal }),
        initialData: user ?? undefined,
        staleTime: 15000,
    });

    // requête exprès pour récupérer le datastore bac à sable
    const sandboxDatastoreQuery = useQuery<Datastore, CartesApiException>({
        queryKey: RQKeys.datastore("sandbox"),
        queryFn: ({ signal }) => api.datastore.getSandbox({ signal }),
        staleTime: 3600000,
    });

    useEffect(() => {
        if (userQuery.data !== undefined) {
            setUser(userQuery.data);
        }
    }, [setUser, userQuery.data]);

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

            <h2>Espaces de travail {(sandboxDatastoreQuery.isLoading || userQuery.isFetching) && <LoadingIcon largeIcon={true} />}</h2>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                {/* si l'utilisateur ne fait pas déjà partie du bac à sable, on affiche une Tile "spéciale" dont le click va ajouter l'utilisateur dans le bac à sable */}
                {/* si l'utilisateur en fait déjà partie, on n'affiche pas cette Tile, on boucle tout simplement sur ses datastores (user.communities_member), voir plus bas */}
                {sandboxDatastoreQuery.data !== undefined && (
                    <>
                        {user?.communities_member.find((community) => community.community?.datastore === sandboxDatastoreQuery.data._id) === undefined && (
                            <div className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                                <Tile
                                    linkProps={{
                                        ...routes.datasheet_list({ datastoreId: sandboxDatastoreQuery.data._id }).link,
                                        onClick: () => handleClick(sandboxDatastoreQuery.data._id),
                                    }}
                                    grey={true}
                                    title={"Découverte"}
                                    desc={t("datastore_for_tests")}
                                />
                            </div>
                        )}

                        {user?.communities_member
                            // tri pour positionner le datastore bac à sable en premier
                            .sort((a, b) => {
                                if (a.community?._id === sandboxDatastoreQuery.data?.community._id) return -1;
                                if (b.community?._id === sandboxDatastoreQuery.data?.community._id) return 1;
                                return 0;
                            })
                            .map((community) => {
                                const datastoreId = community.community?.datastore;
                                if (datastoreId === undefined) return null;

                                return (
                                    <div key={datastoreId} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                                        <Tile
                                            linkProps={routes.datasheet_list({ datastoreId }).link}
                                            grey={true}
                                            title={
                                                community.community?._id === sandboxDatastoreQuery.data?.community._id
                                                    ? "Découverte"
                                                    : community.community?.name
                                            }
                                            desc={community.community?._id === sandboxDatastoreQuery.data?.community._id ? t("datastore_for_tests") : undefined}
                                        />
                                    </div>
                                );
                            })}
                    </>
                )}
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
        </AppLayout>
    );
};

export default DashboardPro;

export const { i18n } = declareComponentKeys<"document_title" | "espaceco_frontoffice_list" | "datastore_for_tests">()("DashboardPro");

export const DashboardProFrTranslations: Translations<"fr">["DashboardPro"] = {
    document_title: "Tableau de bord professionnel",
    espaceco_frontoffice_list: "Liste des guichets de l’espace collaboratif",
    datastore_for_tests: "À des fins de test",
};

export const DashboardProEnTranslations: Translations<"en">["DashboardPro"] = {
    document_title: "Professional dashboard",
    espaceco_frontoffice_list: "List of collaborative space front offices",
    datastore_for_tests: "For testing purposes",
};
