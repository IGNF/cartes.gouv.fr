import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useEffect } from "react";

import AppLayout from "../components/Layout/AppLayout";
import SymfonyRouting from "../modules/Routing";
import { appRoot, routes, useRoute } from "../router/router";
import { useAuthStore } from "../stores/AuthStore";

import hp from "../img/home/home.png";
import "../sass/pages/home.scss";

const Home = () => {
    const { params } = useRoute();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user !== null && params?.["authentication_failed"] !== undefined) {
            routes.home().replace();
        }
    }, [params, user]);

    return (
        <AppLayout documentTitle="Le service public des cartes et données du territoire">
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

            {/* Section : Présentation */}
            <div className="c-section c-section--gray">
                <div className={fr.cx("fr-container--fluid")}>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            <div className={fr.cx("fr-col-12", "fr-col-lg-6", "fr-px-0", "fr-pl-md-14v")}>
                                <p className={fr.cx("fr-mt-4w", "fr-mt-md-7w") + " frx-display--xxs"}>
                                    Bienvenue sur le service public des cartes et données du territoire
                                </p>

                                <p className={fr.cx("fr-text--lg", "fr-pr-10v")}>
                                    La carte et le territoire enfin réunis&nbsp;? Le besoin en données explose pour connaître la réalité terrain, analyser des
                                    phénomènes, piloter des activités multiples.
                                </p>
                                <p className={fr.cx("fr-text--lg", "fr-pr-10v")}>
                                    Collectivités territoriales, acteurs publics, entreprises, associations, citoyens…
                                </p>
                                <p className={fr.cx("fr-text--lg", "fr-pr-10v")}>
                                    <strong>Cartes.gouv.fr</strong> offre à tous les bases de données et les outils utiles pour se saisir de ces opportunités,
                                    avec en premier lieu des cartes et données publiques librement accessibles sur de nombreux thèmes (topographie, écologie,
                                    sécurité, foncier, réglementations…) ainsi que la diffusion en toute autonomie de vos propres données géographiques.
                                </p>
                            </div>
                            <div className={fr.cx("fr-col-12", "fr-col-lg-6", "fr-pb-4w", "fr-pl-md-8w", "fr-pr-md-2w", "fr-mt-4w")}>
                                <figure
                                    className={fr.cx("fr-content-media")}
                                    role="group"
                                    aria-label="Carte des grandes régions écologiques (GRECO), IGN - 2023"
                                >
                                    <div className={fr.cx("fr-content-media__img")}>
                                        <img
                                            className={fr.cx("fr-responsive-img", "fr-ratio-1x1")}
                                            src={hp}
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

                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            <div className={fr.cx("fr-col-12", "fr-px-0", "fr-px-md-14v")}>
                                <p className={fr.cx("fr-text--lg")}>
                                    Le site s’enrichira de nouveaux services pour la contribution, le partage et la visualisation des données et cartes, en
                                    s’appuyant sur les besoins et attentes des utilisateurs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section proposition de valeur : Ce que vous pouvez faire avec cartes.gouv.fr */}
            <div className={fr.cx("fr-container", "fr-mt-8v", "fr-pb-3v", "fr-mt-md-10v", "fr-mb-2v", "fr-mb-md-8v")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col-12")}>
                        <h2 className={fr.cx("fr-my-5w") + " frx-text--center"}>Ce que vous pouvez faire avec cartes.gouv.fr</h2>
                        <p>
                            La première bêta publique de <strong>cartes.gouv.fr</strong> est désormais disponible. En tant que premiers utilisateurs, vous
                            pouvez participer à l’amélioration des fonctionnalités (catalogue, alimentation/diffusion) en testant les pré-versions et en nous
                            transmettant vos commentaires.
                        </p>
                    </div>
                </div>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center")}>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/system/system.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead", "fr-mb-3v")}>Stockez, traitez et partagez vos données</h3>
                        <p className={fr.cx("fr-badge", "fr-badge--success", "fr-badge--no-icon")}>Disponible en bêta</p>
                        <p>En toute autonomie, selon la diffusion de votre choix depuis cartes.gouv.fr et sur vos sites et applis.</p>
                    </div>

                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/map/map.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead", "fr-mb-3v")}>Consultez et utilisez des géodonnées</h3>
                        <p className={fr.cx("fr-badge", "fr-badge--success", "fr-badge--no-icon")}>Disponible en bêta</p>
                        <p>Grâce au catalogue et aux cartes en ligne, grâce aux services et données de la communauté Géoplateforme.</p>
                    </div>

                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/environment/human-cooperation.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead", "fr-mb-3v")}>Gérez et animez vos communautés</h3>
                        <p>Via des guichets collaboratifs pour entretenir et enrichir les données.</p>
                        <p className={fr.cx("fr-text--sm")}>
                            Aujourd’hui disponible sur <a href="https://espacecollaboratif.ign.fr">espacecollaboratif.ign.fr</a>,<br />
                            intégré en 2025 dans cartes.gouv.fr
                        </p>
                    </div>
                </div>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center")}>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/map/location-france.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead", "fr-mb-3v")}>Créez des cartes</h3>
                        <p>
                            Grâce aux outils de traitement, de datavisualisation, de création et habillage de cartes et, à terme de création et habillage de
                            portails cartographiques personnalisés.
                        </p>
                        <p className={fr.cx("fr-text--sm")}>
                            Aujourd’hui disponible sur <a href="https://macarte.ign.fr">macarte.ign.fr</a>,<br />
                            intégré en 2025 dans cartes.gouv.fr
                        </p>
                    </div>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/digital/data-visualization.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead", "fr-mb-3v")}>Ajoutez de nouvelles fonctionnalités</h3>
                        <p>
                            Grâce aux outils mis à disposition et en appui sur l’usine logicielle de la Géoplateforme, enrichissez l’offre de service de la
                            Géoplateforme.
                        </p>
                        <p className={fr.cx("fr-text--sm")}>À venir en 2025</p>
                    </div>
                </div>
            </div>

            <div className="c-section c-section--gray">
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
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg")}>
                                    Pour en savoir + sur <strong>cartes.gouv.fr</strong>,{" "}
                                    <a
                                        href="https://ign.fr/geoplateforme/rejoindre-la-communaute"
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
