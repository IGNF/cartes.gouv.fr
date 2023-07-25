import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
// import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
// import Routing from "fos-router";

import React/*, { useContext }*/ from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";
// import { UserContext } from "../contexts/UserContext";
import { appRoot/*, routes*/ } from "../router/router";

import hp from "../img/hp.jpg";
import "../sass/pages/home.scss";

const Home = () => {
    // const { user } = useContext(UserContext);

    return (
        <AppLayout navItems={defaultNavItems}>
            {/* Section : Présentation */}
            <div className={fr.cx("c-section", "c-section--gray")}>
                <div className={fr.cx("fr-container--fluid")}>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            <div className={fr.cx("fr-col-12", "fr-col-lg-6", "fr-px-0v", "fr-pl-md-14v")}>
                                <p className={fr.cx("fr-mt-4w", "fr-mt-md-7w", "fr-display--xxs")}>
                                    Construisons ensemble le futur portail de la connaissance du territoire
                                </p>

                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className="fr-icon-check-line" aria-hidden="true" /> Un accès <strong>unique</strong> et <strong>partagé</strong> aux
                                    données géographiques <strong>ouvertes</strong>
                                </p>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className="fr-icon-check-line" aria-hidden="true" /> Des outils plus <strong>simple</strong> pour déposer et diffuser
                                    vos données en toute <strong>autonomie</strong>
                                </p>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className="fr-icon-check-line" aria-hidden="true" /> Une nouvelle infrastructure plus <strong>performante</strong> qui
                                    offre des services <strong>utiles pour tous</strong> les usagers
                                </p>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className="fr-icon-check-line" aria-hidden="true" /> La possibilité d&apos;enrichir et améliorer{" "}
                                    <strong>collectivement</strong> les données et les services
                                </p>
                            </div>
                            <div className={fr.cx("fr-col-12", "fr-col-lg-6", "fr-pb-4w", "fr-pl-md-8w", "fr-pr-md-2w", "fr-pt-md-6w", "aligncenter")}>
                                <img src={hp} className={fr.cx("fr-responsive-img")} alt="" data-fr-js-ratio="true" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section : Ce que vous pouvez faire avec cartes.gouv.fr */}
            <div className={fr.cx("fr-container", "fr-mt-8v", "fr-pb-3v", "fr-mt-md-10v", "fr-mb-2v", "fr-mb-md-8v")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col-12")}>
                        <h2 className={fr.cx("fr-my-5w", "fr-text--center")}>Ce que vous pouvez faire avec cartes.gouv.fr</h2>
                    </div>
                </div>

                <Tabs
                    className={fr.cx("fr-tabs--full")}
                    tabs={[
                        {
                            label: "Outils cartes.gouv.fr",
                            content: (
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-text--center")}>
                                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/digital/internet.svg`}
                                            className={fr.cx("fin-service-picto", "svg-fin-fc-finger")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Consommez des services</h4>
                                        <p>Lorem ipsum dolor sit amet,consectetur adipiscing elit.</p>
                                        <Badge small className={fr.cx("fr-badge--pink")}>
                                            Prochainement
                                        </Badge>
                                    </div>

                                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/environment/human-cooperation.svg`}
                                            className={fr.cx("fin-service-pict", "svg-fin-majorite")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Stocker et partager des géodonnées</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </div>

                                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/digital/data-visualization.svg`}
                                            className={fr.cx("fin-service-picto", "svg-fin-procuration")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Effectuer des traitements</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                        {/* <p>
                                            {user === null ? (
                                                <Button
                                                    linkProps={{ href: Routing.generate("cartesgouvfr_security_login") }}
                                                    iconId={fr.cx("fr-icon-account-circle-fill")}
                                                >
                                                    Se connecter
                                                </Button>
                                            ) : (
                                                <Button
                                                    linkProps={routes.datastore_list().link}
                                                    iconId={fr.cx("fr-icon-arrow-right-line")}
                                                    className={fr.cx("fr-btn--icon-right")}
                                                >
                                                    {Translator.trans("home.start")}
                                                </Button>
                                            )}
                                        </p> */}
                                    </div>
                                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/map/map.svg`}
                                            className={fr.cx("fin-service-picto", "svg-fin-service-picto")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Lorem ipsum dolor</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            label: "Pour aller plus loin",
                            content: (
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-text--center")}>
                                    <div className={fr.cx("fr-col-lg-3", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/digital/data-visualization.svg`}
                                            className={fr.cx("fin-service-picto", "svg-fin-procuration")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Consectetur adipiscing elit</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                        {/* <p>
                                            {user === null ? (
                                                <Button
                                                    linkProps={{ href: Routing.generate("cartesgouvfr_security_login") }}
                                                    iconId={fr.cx("fr-icon-account-circle-fill")}
                                                >
                                                    Se connecter
                                                </Button>
                                            ) : (
                                                <Button
                                                    linkProps={routes.datastore_list().link}
                                                    iconId={fr.cx("fr-icon-arrow-right-line")}
                                                    className={fr.cx("fr-btn--icon-right")}
                                                >
                                                    {Translator.trans("home.start")}
                                                </Button>
                                            )}
                                        </p> */}
                                    </div>

                                    <div className={fr.cx("fr-col-lg-3", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/map/map.svg`}
                                            className={fr.cx("fin-service-picto", "svg-fin-service-picto")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Sit amet</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </div>

                                    <div className={fr.cx("fr-col-lg-3", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/digital/internet.svg`}
                                            className={fr.cx("fin-service-picto", "svg-fin-fc-finger")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Dolor sit amet consectetur</h4>
                                        <p>Lorem ipsum dolor sit amet,consectetur adipiscing elit.</p>
                                        <Badge small className={fr.cx("fr-badge--pink")}>
                                            Prochainement
                                        </Badge>
                                    </div>
                                    <div className={fr.cx("fr-col-lg-3", "fr-col-12", "fr-text--center")}>
                                        <img
                                            src={`${appRoot}/dsfr/artwork/pictograms/environment/human-cooperation.svg`}
                                            className={fr.cx("fin-service-picto", "svg-fin-majorite")}
                                            role="presentation"
                                        />
                                        <h4 className={fr.cx("fr-text--lead")}>Adipiscing elits</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </AppLayout>
    );
};

export default Home;
