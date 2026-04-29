import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import DataVisualization from "@codegouvfr/react-dsfr/picto/DataVisualization";
import System from "@codegouvfr/react-dsfr/picto/System";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import api from "@/entrepot/api";
import { useApiEspaceCoStore } from "@/espaceco/stores/ApiEspaceCoStore";
import { useSandboxDatastorePrefetchQuery } from "@/hooks/queries/useSandboxDatastoreQuery";
import { routes } from "@/router/router";
import useUserQuery from "@/hooks/queries/useUserQuery";

import accountSvgUrl from "@/img/pictograms/account.svg?no-inline";
import contributorSvgUrl from "@/img/pictograms/contributor.svg?no-inline";
import keyManagerSvgUrl from "@/img/pictograms/key-manager.svg?no-inline";
import uploaderSvgUrl from "@/img/pictograms/uploader.svg?no-inline";

export default function Dashboard() {
    const { data: user } = useUserQuery();

    const isApiEspaceCoDefined = useApiEspaceCoStore((state) => state.isUrlDefined);

    const configDatastore = user?.communities_member?.find((community) => community.community?._id === api.alerts.communityId);
    const canShowConfig = configDatastore?.rights?.includes(CommunityMemberDtoRightsEnum.ANNEX);

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

    useSandboxDatastorePrefetchQuery();

    return (
        <Main noticeProps={noticeProps} title={"Tableau de bord"}>
            <h1 className={fr.cx("fr-mt-4v")}>Tableau de bord</h1>
            <p className={fr.cx("fr-text--xl")}>Bienvenue {user?.first_name ?? user?.user_name}</p>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <Tile
                        linkProps={routes.my_account().link}
                        imageUrl={accountSvgUrl}
                        title="Mon compte"
                        desc="Consulter et modifier mes informations personnelles"
                        orientation="vertical"
                        classes={{
                            img: fr.cx("fr-mb-0"),
                        }}
                    />
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <Tile
                        linkProps={routes.my_access_keys().link}
                        imageUrl={keyManagerSvgUrl}
                        title="Mes clés d’accès"
                        desc="Créer et consulter mes accès aux services restreints"
                        start={
                            <Badge className={fr.cx("fr-badge--brown-opera")} noIcon={true} as="span" small={true}>
                                Clés d’accès
                            </Badge>
                        }
                        orientation="vertical"
                        classes={{
                            img: fr.cx("fr-mb-0"),
                        }}
                    />
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <Tile
                        linkProps={routes.datastore_selection().link}
                        imageUrl={uploaderSvgUrl}
                        title="Mes entrepôts"
                        desc="Gérer mes entrepôts et mes fiches de données"
                        start={
                            <Badge className={fr.cx("fr-badge--green-archipel")} noIcon={true} as="span" small={true}>
                                <span className={fr.cx("fr-icon--sm", "fr-icon-database-line", "fr-mr-1v")} />
                                Publier
                            </Badge>
                        }
                        orientation="vertical"
                        classes={{
                            img: fr.cx("fr-mb-0"),
                        }}
                    />
                </div>
                {isApiEspaceCoDefined() && (
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                        <Tile
                            linkProps={routes.espaceco_community_list().link}
                            imageUrl={contributorSvgUrl}
                            title="Mes guichets"
                            desc="Créer, modifier et partager mes guichets"
                            orientation="vertical"
                            classes={{
                                img: fr.cx("fr-mb-0"),
                            }}
                        />
                    </div>
                )}
                {canShowConfig && (
                    <div key={configDatastore?.community?.datastore} className={fr.cx("fr-col-12", "fr-col-md-4")}>
                        <Tile
                            linkProps={routes.config_alerts().link}
                            title={"Alertes"}
                            pictogram={<System />}
                            orientation="vertical"
                            classes={{
                                img: fr.cx("fr-mb-0"),
                            }}
                        />
                    </div>
                )}

                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <Tile
                        linkProps={routes.stats().link}
                        title={"Mes statistiques de consommation"}
                        pictogram={<DataVisualization />}
                        orientation="vertical"
                        classes={{
                            img: fr.cx("fr-mb-0"),
                        }}
                    />
                </div>
            </div>
        </Main>
    );
}
