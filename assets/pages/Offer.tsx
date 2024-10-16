import { fr } from "@codegouvfr/react-dsfr";
import CallOut from "@codegouvfr/react-dsfr/CallOut";

import AppLayout from "../components/Layout/AppLayout";
import { routes } from "../router/router";

import "../sass/pages/offer.scss";

const Offer = () => {
    return (
        <AppLayout documentTitle="Offre">
            <h1>Offre</h1>

            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-lg-8")}>
                    <p>La plupart des usages de la Géoplateforme, et par conséquent de cartes.gouv.fr, sont gratuits.</p>
                    <p>
                        Les producteurs de données ayant besoin de stocker et diffuser un volume important de données sont amenés à contribuer financièrement au
                        fonctionnement du service, selon le volume concerné. Ils participent à la gouvernance de la Géoplateforme et aux choix pour son
                        évolution, comme décrit ci-dessous.
                    </p>
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-3w")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                    <CallOut
                        title="Offre Essentielle"
                        titleAs="h2"
                        colorVariant="green-emeraude"
                        classes={{
                            title: fr.cx("fr-mb-4v") + " frx-text--center",
                            root: "frx-callout--offer-root",
                            text: "frx-callout--offer-text",
                        }}
                    >
                        <p className={fr.cx("fr-py-2v") + " frx-text--center frx-callout--offer-text-tagline"}>
                            {
                                "Une offre adaptée aux besoins les plus courants, avec l'ensemble des fonctionnalités et un premier niveau de stockage et de diffusion associé."
                            }
                        </p>

                        <ul className="frx-callout--offer-text-list">
                            <li>
                                500 Go
                                <br />
                                Hébergés sur un entrepôt
                            </li>
                            <li>50 couches de données</li>
                            <li>1 To max de trafic par an</li>
                            <li>Animation des communautés de contributeurs</li>
                            <li>Support par mail</li>
                        </ul>

                        <p className={fr.cx("fr-text--xl", "fr-text--heavy") + " frx-text--center frx-callout--offer-text-price"}>Gratuit</p>
                    </CallOut>
                </div>

                <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                    <CallOut
                        title="Offre Premium"
                        titleAs="h2"
                        colorVariant="brown-caramel"
                        classes={{
                            title: fr.cx("fr-mb-4v") + " frx-text--center",
                            root: "frx-callout--offer-root",
                            text: "frx-callout--offer-text",
                        }}
                    >
                        <p className={fr.cx("fr-py-2v") + " frx-text--center frx-callout--offer-text-tagline"}>
                            {"Une offre calibrée pour les volumes de données les plus importants tels que PCRS ou portail cartographique national."}
                        </p>
                        <ul className="frx-callout--offer-text-list">
                            <li>
                                20 To
                                <br />
                                Hébergés sur un ou plusieurs entrepôts
                            </li>
                            <li>Couches de données illimitées</li>
                            <li>Au-delà de 1 To max de trafic par an</li>
                            <li>Animation des communautés de contributeurs</li>
                            <li>Support par mail et formation</li>
                            <li>Participation à la gouvernance</li>
                        </ul>
                        <p className={"frx-text--center frx-callout--offer-text-price"}>
                            <p className={fr.cx("fr-text--sm")}>à partir de</p>
                            <p className={fr.cx("fr-text--xl", "fr-text--heavy")}>10 K€ HT par an</p>
                            <p className={fr.cx("fr-text--sm")}>(tarif dégressif selon le volume de trafic : de 3,3 k€ à 1,5 k€ par To et par an)</p>
                        </p>
                    </CallOut>
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-12", "fr-col-lg-8")}>
                    <p>
                        Un « bac à sable » permet de tester gratuitement les fonctions d’alimentation et de diffusion de la Géoplateforme en quelques clics
                        (disponible à l’automne 2024).
                    </p>
                    <p>
                        <a {...routes.terms_of_service().link}>Conditions générales d’utilisation</a>
                    </p>
                    <p>
                        <a {...routes.contact().link}>Nous contacter.</a>
                    </p>
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-12", "fr-col-lg-8")}>
                    <h2>Cartes.gouv.fr</h2>

                    <p>Cartes.gouv.fr est le nouveau service public des cartes et données du territoire.</p>

                    <p>
                        Ce site permet à chacun de créer, héberger, contribuer, partager, visualiser et publier des données et des cartes en autonomie en
                        utilisant les ressources proposées par la Géoplateforme.
                    </p>

                    <p>
                        Construit dans une démarche Produit avec une première version minimum viable, cartes.gouv.fr va progressivement s’enrichir. Depuis le 28
                        juin 2024, cartes.gouv.fr vous permet d’accéder à :
                    </p>

                    <ul>
                        <li>
                            Un <strong>catalogue recensant les géodonnées du territoire français et les géoservices associés</strong>, avec leurs descriptions
                            détaillées (métadonnées). L’interface du catalogue vous permet d’affiner vos recherches grâce à des mots-clés et des filtres
                            avancés. Visualisez ensuite les métadonnées et les géodonnées pertinentes, accédez aux géoservices associés et téléchargez les
                            données dont vous avez besoin.
                        </li>
                        <li>
                            Un <strong>espace personnel pour partager vos données vectorielles via des géoservices WFS, TMS et WMS</strong>. En pratique :
                            <ul>
                                <li>Alimentation de géodonnées : Téléversez vos données vectorielles sur l’entrepôt de la Géoplateforme.</li>
                                <li>Intégration des géodonnées : Stockez vos données de manière pérenne et exploitable pour les services de diffusion.</li>
                                <li>
                                    Configuration des géoservices : Personnalisez vos services en définissant le nom, les contrôles d’accès, le type de service,
                                    les styles et les métadonnées.
                                </li>
                                <li>Publication des services : Rendez vos données accessibles à tous ou à un public restreint.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
};

export default Offer;
