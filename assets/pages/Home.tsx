import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import React from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";
import SymfonyRouting from "../modules/Routing";
import { appRoot, useRoute } from "../router/router";

import hp from "../img/photos/rustrel.jpg";
import "../sass/pages/home.scss";

const Home = () => {
    const { params } = useRoute();

    return (
        <AppLayout navItems={defaultNavItems} documentTitle="Le service public des cartes et données du territoire">
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
                                <p className={fr.cx("fr-mt-4w", "fr-mt-md-7w") + " fr-display--xxs"}>
                                    Construisons ensemble le futur portail de la connaissance du territoire
                                </p>

                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className={fr.cx("fr-icon-check-line")} aria-hidden="true" /> Un accès <strong>unique</strong> et{" "}
                                    <strong>partagé</strong> aux données géographiques <strong>ouvertes</strong>
                                </p>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className={fr.cx("fr-icon-check-line")} aria-hidden="true" /> Des outils plus <strong>simples</strong> pour déposer et
                                    diffuser vos données en toute <strong>autonomie</strong>
                                </p>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className={fr.cx("fr-icon-check-line")} aria-hidden="true" /> Une nouvelle infrastructure plus{" "}
                                    <strong>performante</strong> qui offre des services <strong>utiles pour tous</strong> les usagers
                                </p>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <span className={fr.cx("fr-icon-check-line")} aria-hidden="true" /> La possibilité d&apos;enrichir et améliorer{" "}
                                    <strong>collectivement</strong> les données et les services
                                </p>
                            </div>
                            <div className={fr.cx("fr-col-12", "fr-col-lg-6", "fr-pb-4w", "fr-pl-md-8w", "fr-pr-md-2w", "fr-pt-md-6w")}>
                                <figure className={fr.cx("fr-content-media")} role="group" aria-label="Rustrel (Vaucluse) - IGN">
                                    <div className={fr.cx("fr-content-media__img")}>
                                        <img
                                            className={fr.cx("fr-responsive-img", "fr-ratio-1x1")}
                                            src={hp}
                                            alt=""
                                            role="presentation"
                                            data-fr-js-ratio="true"
                                        />
                                    </div>
                                    <figcaption className={fr.cx("fr-content-media__caption")}>Rustrel (Vaucluse) - IGN</figcaption>
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section : Ce que vous pouvez faire avec cartes.gouv.fr */}
            <div className={fr.cx("fr-container", "fr-mt-8v", "fr-pb-3v", "fr-mt-md-10v", "fr-mb-2v", "fr-mb-md-8v")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col-12")}>
                        <h2 className={fr.cx("fr-my-5w") + " fr-text--center"}>Ce que vous pouvez faire avec cartes.gouv.fr</h2>
                    </div>
                </div>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters") + " fr-text--center"}>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/digital/internet.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Consommez des services</h3>
                        <p>Lorem ipsum dolor sit amet,consectetur adipiscing elit.</p>
                        <Badge small className={"fr-badge--pink"}>
                            Prochainement
                        </Badge>
                    </div>

                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/environment/human-cooperation.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Stocker et partager des géodonnées</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>

                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/digital/data-visualization.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Effectuer des traitements</h3>
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
                    <div className={fr.cx("fr-col-lg-3", "fr-col-md-6", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/map/map.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Lorem ipsum dolor</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>

                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters") + " fr-text--center"}>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/digital/data-visualization.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Consectetur adipiscing elit</h3>
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

                    <div className={fr.cx("fr-col-lg-3", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/map/map.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Sit amet</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>

                    <div className={fr.cx("fr-col-lg-3", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/digital/internet.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Dolor sit amet consectetur</h3>
                        <p>Lorem ipsum dolor sit amet,consectetur adipiscing elit.</p>
                        <Badge small className={"fr-badge--pink"}>
                            Prochainement
                        </Badge>
                    </div>
                    <div className={fr.cx("fr-col-lg-3", "fr-col-12") + " fr-text--center"}>
                        <img src={`${appRoot}/dsfr/artwork/pictograms/environment/human-cooperation.svg`} alt="" role="presentation" />
                        <h3 className={fr.cx("fr-text--lead")}>Adipiscing elits</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Home;
