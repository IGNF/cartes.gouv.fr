import { fr } from "@codegouvfr/react-dsfr";
import avatarSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/avatar.svg?no-inline";
import internetSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/internet.svg?no-inline";
import mailSendSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/mail-send.svg?no-inline";
import humanCoopSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/environment/human-cooperation.svg?no-inline";
import padlockSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/system/padlock.svg?no-inline";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { CartesUser, Datastore } from "../../../@types/app";
import { CommunityMemberDtoRightsEnum } from "../../../@types/entrepot";
import Main from "../../../components/Layout/Main";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import Skeleton from "../../../components/Utils/Skeleton";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { useApiEspaceCoStore } from "../../../espaceco/stores/ApiEspaceCoStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { getArrayRange } from "../../../utils";
import api from "../../api";

const DashboardPro = () => {
    const { t } = useTranslation("DashboardPro");

    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const isApiEspaceCoDefined = useApiEspaceCoStore((state) => state.isUrlDefined);

    const configDatastore = user?.communities_member?.find((community) => community.community?.datastore === api.alerts.datastoreId);
    const canShowConfig = configDatastore?.rights?.includes(CommunityMemberDtoRightsEnum.ANNEX);

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

    const noticeProps = {
        title: "Votre avis compte ! Participez à notre questionnaire pour nous aider à améliorer la fonctionnalité d’alimentation et de diffusion. Merci pour votre contribution précieuse.",
        link: {
            linkProps: {
                href: "https://analytics-eu.clickdimensions.com/ignfr-agj1s/pages/dhzzawfjee4wanoryvba.html?PageId=01d97c744961ef11bfe3000d3ab6156c",
                target: "_blank",
                rel: "noreferrer",
                title: "Questionnaire sur la fonctionnalité alimentation et diffusion - Ouvre une nouvelle fenêtre",
            },
            text: "Participer",
        },
    };

    return (
        <Main noticeProps={noticeProps} title={t("document_title")}>
            <h1>Bienvenue {user?.first_name ?? user?.user_name}</h1>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                    <Tile
                        linkProps={routes.my_account().link}
                        imageUrl={avatarSvgUrl}
                        imageSvg={true}
                        desc="Consulter et modifier mes informations personnelles"
                        orientation="horizontal"
                        title="Mon compte"
                    />
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                    <Tile
                        linkProps={routes.my_access_keys().link}
                        imageUrl={padlockSvgUrl}
                        imageSvg={true}
                        desc="Consulter et modifier mes clés d'accès aux services privés"
                        orientation="horizontal"
                        title="Mes clés d’accès"
                    />
                </div>
            </div>

            <h2>Espaces de travail {(sandboxDatastoreQuery.isLoading || userQuery.isFetching) && <LoadingIcon largeIcon={true} />}</h2>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                {/* affiche indication de chargement pendant que sandboxDatastoreQuery est en cours */}
                {sandboxDatastoreQuery.data === undefined ? (
                    getArrayRange(1, user?.communities_member.length ?? 3).map((i) => (
                        <div key={i} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                            <Skeleton count={1} rectangleHeight={150} />
                        </div>
                    ))
                ) : (
                    // si l'utilisateur ne fait pas déjà partie du bac à sable, on affiche une Tile "spéciale" dont le click va ajouter l'utilisateur dans le bac à sable
                    // si l'utilisateur en fait déjà partie, on n'affiche pas cette Tile, on boucle tout simplement sur ses datastores (user.communities_member), voir plus bas
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

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                    <Tile
                        linkProps={routes.datastore_create_request().link}
                        imageUrl={mailSendSvgUrl}
                        imageSvg={true}
                        desc="Contacter le support pour créer un nouvel espace de travail"
                        orientation="horizontal"
                        title={t("datastore_creation_form")}
                    />
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                    <Tile
                        linkProps={routes.join_community().link}
                        imageUrl={humanCoopSvgUrl}
                        imageSvg={true}
                        desc="Demander à rejoindre une communauté publique"
                        orientation="horizontal"
                        title={t("join_existing_community")}
                    />
                </div>
            </div>

            {canShowConfig && (
                <>
                    <h2>{t("configuration")}</h2>
                    <div key={configDatastore?.community?.datastore} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                        <Tile linkProps={routes.config_alerts().link} grey={true} title={t("alerts")} />
                    </div>
                </>
            )}

            {isApiEspaceCoDefined() && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                        <Tile
                            linkProps={routes.espaceco_community_list().link}
                            imageUrl={internetSvgUrl}
                            imageSvg={true}
                            desc="Voir la liste des guichets"
                            orientation="horizontal"
                            title={t("espaceco_frontoffice_list")}
                        />
                    </div>
                </div>
            )}
        </Main>
    );
};

export default DashboardPro;
