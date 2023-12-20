import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";

import AppLayout from "../components/Layout/AppLayout";
import SymfonyRouting from "../modules/Routing";
import { appRoot, useRoute } from "../router/router";

import hp from "../img/home/home.png";
import "../sass/pages/home.scss";

const Home = () => {
    const { params } = useRoute();

    return (
        <AppLayout documentTitle="Le service public des cartes et données du territoire">
            {params?.["authentication_failed"] === 1 && (
                <Alert
                    severity="error"
                    closable={true}
                    title={"Connexion échouée"}
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
                                    Bienvenue sur le futur service public des cartes et données du territoire
                                </p>

                                <p className={fr.cx("fr-mt-4v", "fr-mt-md-7v", "fr-text--xl")}>
                                    <strong>En construction, le site Cartes.gouv.fr arrive bientôt&nbsp;!</strong>
                                </p>

                                <p className={fr.cx("fr-text--lg", "fr-pr-10v")}>
                                    La carte et le territoire bientôt réunis&nbsp;? Le besoin en données explose pour connaître la réalité terrain, analyser des
                                    phénomènes, piloter des activités multiples.
                                </p>
                                <p className={fr.cx("fr-text--lg", "fr-pr-10v")}>
                                    Collectivités territoriales, acteurs publics, entreprises, associations, citoyens…
                                </p>
                                <p className={fr.cx("fr-text--lg", "fr-pr-10v")}>
                                    <strong>Cartes.gouv.fr</strong> offrira à tous les bases de données et les outils utiles pour se saisir de ces opportunités,
                                    avec en premier lieu des cartes et données publiques librement accessibles sur de nombreux thèmes (topographie, écologie,
                                    sécurité, foncier, réglementations…).
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
                                    Le site proposera également des services qui vont s’enrichir pour permettre à chacun de créer, héberger, contribuer,
                                    partager, visualiser et publier des données et des cartes en autonomie.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section proposition de valeur : Ce que vous pourrez faire avec cartes.gouv.fr */}
            <div className={fr.cx("fr-container", "fr-mt-8v", "fr-pb-3v", "fr-mt-md-10v", "fr-mb-2v", "fr-mb-md-8v")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col-12")}>
                        <h2 className={fr.cx("fr-my-5w") + " frx-text--center"}>Ce que vous pourrez faire avec cartes.gouv.fr</h2>
                    </div>
                </div>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center")}>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/map/map.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Consultez et utilisez des géodonnées</h3>
                        <p>Grâce au catalogue et aux cartes en ligne, grâce aux services et données de la communauté Géoplateforme.</p>
                    </div>

                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/map/location-france.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Créez des cartes</h3>
                        <p>
                            Grâce aux outils de traitement, de datavisualisation, de création et habillage de cartes et, à terme de création et habillage de
                            portails cartographiques personnalisés.
                        </p>
                    </div>

                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/system/system.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Stockez, traitez et partagez vos données</h3>
                        <p>En toute autonomie, selon la diffusion de votre choix depuis cartes.gouv.fr et sur vos sites et applis.</p>
                    </div>
                </div>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center")}>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/environment/human-cooperation.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Gérez et animez vos communautés</h3>
                        <p>Via des guichets collaboratifs pour entretenir et enrichir les données.</p>
                    </div>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-12") + " frx-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/digital/data-visualization.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Contribuez aux données et services</h3>
                        <p>Grâce aux outils collaboratifs pour échanger, entretenir et enrichir les géodonnées et géoservices.</p>
                    </div>
                </div>
            </div>

            <div className="c-section c-section--gray">
                <div className={fr.cx("fr-container--fluid")}>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            <div className={fr.cx("fr-col-12", "fr-px-0", "fr-px-md-14v")}>
                                <p className={fr.cx("fr-mt-4w", "fr-mt-md-7w", "fr-text--lg")}>
                                    <strong>Cartes.gouv.fr</strong> rassemblera ainsi et ouvrira à tous des fonctionnalités dont certaines sont utilisables dès
                                    aujourd’hui sur différents sites opérés par l’IGN tels que&nbsp;:
                                </p>
                                <ul>
                                    <li className={fr.cx("fr-text--lg")}>
                                        <a
                                            href="https://www.geoportail.gouv.fr"
                                            target="_blank"
                                            rel="noreferrer"
                                            title="geoportail.gouv.fr - ouvre une nouvelle fenêtre"
                                        >
                                            geoportail.gouv.fr
                                        </a>{" "}
                                        : rechercher et visualiser un lieu, une photographie aérienne, une carte, des données sur un territoire et les
                                        superposer,
                                    </li>
                                    <li className={fr.cx("fr-text--lg")}>
                                        <a
                                            href="https://geoservices.ign.fr"
                                            target="_blank"
                                            rel="noreferrer"
                                            title="geoservices.ign.fr - ouvre une nouvelle fenêtre"
                                        >
                                            geoservices.ign.fr
                                        </a>{" "}
                                        : télécharger et utiliser les flux de toutes les données et tous les services en accès libre et gratuit, ainsi que les
                                        scans,
                                    </li>
                                    <li className={fr.cx("fr-text--lg")}>
                                        <a
                                            href="https://espacecollaboratif.ign.fr"
                                            target="_blank"
                                            rel="noreferrer"
                                            title="espacecollaboratif.ign.fr - ouvre une nouvelle fenêtre"
                                        >
                                            espacecollaboratif.ign.fr
                                        </a>{" "}
                                        : ouvrir l’enrichissement de vos bases de données à des communautés et participer à l’amélioration et l’enrichissement
                                        des données publiques ou de partenaires,
                                    </li>
                                    <li className={fr.cx("fr-text--lg")}>
                                        <a href="https://macarte.ign.fr" target="_blank" rel="noreferrer" title="macarte.ign.fr - ouvre une nouvelle fenêtre">
                                            macarte.ign.fr
                                        </a>{" "}
                                        : créer ses cartes en quelques clics, à partir des données Géoportail ou de ses propres données, et les publier sur une
                                        adresse dédiée ou sur son propre site internet.
                                    </li>
                                </ul>
                                <p className={fr.cx("fr-text--lg")}>
                                    <strong>Cartes.gouv.fr</strong> reprendra dans un premier temps les fonctions des sites Géoservices puis Géoportail ainsi
                                    que de premiers outils pour la gestion des données par les acteurs publics. Il s’enrichira progressivement de
                                    fonctionnalités nouvelles au bénéfice de tous.
                                </p>
                                <p className={fr.cx("fr-text--lg")}>
                                    <strong>Cartes.gouv.fr</strong> s’appuie sur une nouvelle infrastructure ouverte et collaborative, la Géoplateforme,
                                    soutenue par le Ministère de la Transition écologique et de la Cohésion des territoires ainsi que par le Fonds de
                                    transformation de l’action publique.
                                </p>
                                <p className={fr.cx("fr-text--lg")}>
                                    En attendant, retrouvez les données et services dont vous avez besoin sur{" "}
                                    <a
                                        href="https://www.geoportail.gouv.fr"
                                        target="_blank"
                                        rel="noreferrer"
                                        title="geoportail.gouv.fr - ouvre une nouvelle fenêtre"
                                    >
                                        Géoportail
                                    </a>{" "}
                                    et{" "}
                                    <a
                                        href="https://geoservices.ign.fr"
                                        target="_blank"
                                        rel="noreferrer"
                                        title="geoservices.ign.fr - ouvre une nouvelle fenêtre"
                                    >
                                        Géoservices
                                    </a>
                                    .
                                </p>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg")}>
                                    Et pour en savoir + sur <strong>cartes.gouv.fr</strong>,{" "}
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
