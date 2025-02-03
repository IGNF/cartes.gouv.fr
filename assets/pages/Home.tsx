import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useEffect } from "react";

import AppLayout from "@/components/Layout/AppLayout";
import SymfonyRouting from "@/modules/Routing";
import { catalogueUrl, routes, useRoute } from "@/router/router";
import { useAuthStore } from "@/stores/AuthStore";

import "@/sass/pages/home.scss";

import homeImgUrl from "@/img/home/home.png";
import dataVisuSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/data-visualization.svg?no-inline";
import humanCoopSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/environment/human-cooperation.svg?no-inline";
import locationFranceSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/map/location-france.svg?no-inline";
import mapSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/map/map.svg?no-inline";
import systemSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/system/system.svg?no-inline";

const Home = () => {
    const { params } = useRoute();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user !== null && params?.["authentication_failed"] !== undefined) {
            routes.home().replace();
        }

        if (user !== null && params?.["session_expired_login_success"] === 1) {
            window.close();
        }
    }, [params, user]);

    const infoBannerMsg = (
        <>
            Devenez acteur de cartes.gouv.fr et co-construisez les fonctionnalités en participant à des ateliers thématiques.{" "}
            <a
                href="https://analytics-eu.clickdimensions.com/ignfr-agj1s/pages/dbg2dmemee4wanorp13w.html?PageId=0eb6b1752661ef11bfe3000d3aba75df"
                target="_blank"
                rel="noreferrer"
                title="Formulaire d’inscription à des ateliers cartes.gouv.fr - Ouvre une nouvelle fenêtre"
            >
                Inscrivez-vous
            </a>
        </>
    );

    return (
        <AppLayout documentTitle="Le service public des cartes et données du territoire" infoBannerMsg={infoBannerMsg}>
            {params?.["authentication_failed"] === 1 && (
                <Alert
                    severity="error"
                    closable={true}
                    title={"Échec de la connexion"}
                    description={
                        <p>
                            La tentative de connexion a échoué, veuillez <a href={SymfonyRouting.generate("cartesgouvfr_security_login")}>réessayer</a>.
                        </p>
                    }
                />
            )}

            {params?.["session_expired_login_success"] === 1 && (
                <Alert
                    severity="success"
                    closable={true}
                    title={"Reconnexion réussie"}
                    description={
                        "Reconnexion réussie, cette page devrait se fermer automatiquement. Si ce n'est pas le cas, vous pouvez fermer la page en cliquant sur le bouton fermer."
                    }
                    onClose={window.close}
                />
            )}

            {/* Section : Présentation */}
            <div className="c-section">
                <div className={fr.cx("fr-container--fluid")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-lg-7")}>
                            <p className={fr.cx("fr-mt-4w", "fr-mt-md-7w") + " frx-display--xxs"}>Le service public des cartes et données du territoire</p>
                            <p className={fr.cx("fr-text--lg", "fr-pr-10v")}>
                                Déposez et diffusez vos données géographiques en toute autonomie, c’est simple grâce aux outils de cartes.gouv.fr
                            </p>
                            <ul>
                                <li>Je dépose ma donnée et configure mon service</li>
                                <li>Je publie dans le catalogue</li>
                                <li>Je visualise sur une carte</li>
                            </ul>
                            <ButtonsGroup
                                buttons={[
                                    {
                                        iconId: "fr-icon-cursor-line",
                                        linkProps: routes.dashboard_pro().link,
                                        children: "Je dépose ma donnée",
                                        priority: "primary",
                                    },
                                    {
                                        iconId: "fr-icon-file-download-line",
                                        linkProps: {
                                            href: "./catalogue",
                                        },
                                        children: "J’accède au catalogue",
                                        priority: "secondary",
                                    },
                                ]}
                                inlineLayoutWhen="always"
                                buttonsEquisized={true}
                                className={fr.cx("fr-mt-2w")}
                            />
                        </div>

                        <div className={fr.cx("fr-col-12", "fr-col-lg-5", "fr-pb-4w", "fr-pl-md-8w", "fr-pr-md-2w", "fr-mt-4w")}>
                            <figure
                                className={fr.cx("fr-content-media", "fr-mt-0", "fr-mb-0")}
                                role="group"
                                aria-label="Carte des grandes régions écologiques (GRECO), IGN - 2023"
                            >
                                <div className={fr.cx("fr-content-media__img")}>
                                    <img
                                        className={fr.cx("fr-responsive-img", "fr-ratio-1x1")}
                                        src={homeImgUrl}
                                        alt=""
                                        role="presentation"
                                        data-fr-js-ratio="true"
                                    />
                                </div>
                                <figcaption className={fr.cx("fr-content-media__caption")}>
                                    Source : Carte des grandes régions écologiques (GRECO), IGN - 2023
                                </figcaption>
                            </figure>
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-2w")}>
                        <div className={fr.cx("fr-col-10")}>
                            <CallOut colorVariant="blue-cumulus">
                                Le site ne cesse de s’enrichir de nouveaux services en s’appuyant sur les besoins et attentes des utilisateurs, n’hésitez pas à
                                nous faire part de vos retours d’expérience en rejoignant{" "}
                                <a
                                    href="https://www.ign.fr/geoplateforme/rejoindre-la-communaute"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Rejoindre la communauté Géoplateforme - ouvre une nouvelle fenêtre"
                                >
                                    la communauté Géoplateforme
                                </a>
                            </CallOut>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section proposition de valeur : Ce que vous pouvez faire avec cartes.gouv.fr */}
            <div className={fr.cx("fr-container--fluid", "fr-mt-8v", "fr-pb-3v", "fr-mt-md-10v", "fr-mb-2v", "fr-mb-md-8v")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center", "fr-px-md-8w")}>
                    <div className={fr.cx("fr-col-12")}>
                        <h2 className={fr.cx("fr-my-5w") + " frx-text--center"}>Ce que vous pouvez faire avec cartes.gouv.fr</h2>
                        <p className={fr.cx("fr-my-5w") + " frx-text--center"}>
                            La première bêta publique de <strong>cartes.gouv.fr</strong> est désormais disponible. En tant que premiers utilisateurs, vous
                            pouvez participer à l’amélioration des fonctionnalités (catalogue, alimentation/diffusion) en testant les pré-versions et en nous
                            transmettant vos commentaires.
                        </p>
                    </div>
                </div>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4") + " frx-text--center"}>
                        <Tile
                            title="Stockez, traitez et partagez vos données"
                            desc={"En toute autonomie, selon la diffusion de votre choix depuis cartes.gouv.fr et sur vos sites et applis."}
                            start={
                                <Badge severity="success" noIcon={true}>
                                    Disponible en bêta
                                </Badge>
                            }
                            linkProps={routes.dashboard_pro().link}
                            enlargeLinkOrButton={true}
                            imageUrl={systemSvgUrl}
                            imageSvg={true}
                        />
                    </div>

                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4") + " frx-text--center"}>
                        <Tile
                            title="Consultez et utilisez des géodonnées"
                            desc={"Grâce au catalogue et aux cartes en ligne, grâce aux services et données de la communauté Géoplateforme."}
                            start={
                                <Badge severity="success" noIcon={true}>
                                    Disponible en bêta
                                </Badge>
                            }
                            linkProps={{
                                href: catalogueUrl,
                            }}
                            enlargeLinkOrButton={true}
                            imageUrl={mapSvgUrl}
                            imageSvg={true}
                        />
                    </div>

                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4") + " frx-text--center"}>
                        <Tile
                            title="Gérez et animez vos communautés"
                            desc={"Via des guichets collaboratifs pour entretenir et enrichir les données."}
                            start={
                                <Badge severity="info" noIcon={true}>
                                    Intégré en 2025
                                </Badge>
                            }
                            detail={
                                <span className="frx-text--center">
                                    {"Aujourd'hui disponible sur "}
                                    <a href="https://espacecollaboratif.ign.fr" rel="noreferrer">
                                        espacecollaboratif.ign.fr
                                    </a>
                                </span>
                            }
                            imageUrl={humanCoopSvgUrl}
                            imageSvg={true}
                        />
                    </div>

                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4") + " frx-text--center"}>
                        <Tile
                            title="Créez des cartes"
                            desc={
                                "Grâce aux outils de traitement, de datavisualisation, de création et habillage de cartes et, à terme de création et habillage de portails cartographiques personnalisés."
                            }
                            start={
                                <Badge severity="info" noIcon={true}>
                                    Intégré en 2025
                                </Badge>
                            }
                            detail={
                                <span className="frx-text--center">
                                    {"Aujourd'hui disponible sur "}
                                    <a href="https://macarte.ign.fr" rel="noreferrer">
                                        macarte.ign.fr
                                    </a>
                                </span>
                            }
                            imageUrl={locationFranceSvgUrl}
                            imageSvg={true}
                        />
                    </div>

                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4") + " frx-text--center"}>
                        <Tile
                            title="Ajoutez de nouvelles fonctionnalités"
                            desc={
                                "Grâce aux outils mis à disposition et en appui sur l’usine logicielle de la Géoplateforme, enrichissez l’offre de service de la Géoplateforme."
                            }
                            start={
                                <Badge severity="info" noIcon={true}>
                                    Intégré en 2025
                                </Badge>
                            }
                            imageUrl={dataVisuSvgUrl}
                            imageSvg={true}
                        />
                    </div>
                </div>
            </div>

            <div className="c-section c-section--gray fr-py-5w">
                <div className={fr.cx("fr-container--fluid")}>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            <div className={fr.cx("fr-col-12", "fr-px-0", "fr-px-md-14v")}>
                                <p className={fr.cx("fr-text--lg")}>
                                    Avec cette version bêta, <strong>cartes.gouv.fr</strong> reprend de premières fonctionnalités des sites Géoservices et
                                    Géoportail ainsi que de premiers outils pour la gestion des données par les acteurs publics. Il s’enrichira progressivement
                                    de fonctionnalités nouvelles au bénéfice de tous.
                                </p>
                                <p className={fr.cx("fr-text--lg")}>
                                    <strong>Cartes.gouv.fr</strong> s’appuie sur une nouvelle infrastructure ouverte et collaborative, la Géoplateforme,
                                    soutenue par le Ministère de la Transition écologique et de la Cohésion des territoires ainsi que par le Fonds de
                                    transformation de l’action publique.
                                </p>
                                <p className={fr.cx("fr-text--lg")}>
                                    <a
                                        href="https://geoservices.ign.fr"
                                        target="_blank"
                                        rel="noreferrer"
                                        title="geoservices.ign.fr - ouvre une nouvelle fenêtre"
                                    >
                                        Géoservices
                                    </a>{" "}
                                    et{" "}
                                    <a
                                        href="https://www.geoportail.gouv.fr"
                                        target="_blank"
                                        rel="noreferrer"
                                        title="geoportail.gouv.fr - ouvre une nouvelle fenêtre"
                                    >
                                        Géoportail
                                    </a>{" "}
                                    restent en activité le temps que leurs fonctionnalités soient reprises dans cartes.gouv.fr.
                                </p>
                                <p className={fr.cx("fr-text--lg")}>
                                    Pour en savoir + sur <strong>cartes.gouv.fr</strong>,{" "}
                                    <a
                                        href="https://www.ign.fr/geoplateforme/rejoindre-la-communaute"
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Rejoindre la communauté Géoplateforme - ouvre une nouvelle fenêtre"
                                    >
                                        rejoignez la communauté Géoplateforme
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Home;
