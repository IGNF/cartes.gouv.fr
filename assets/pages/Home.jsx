import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import React, { useContext } from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";
import { UserContext } from "../contexts/UserContext";
import { appRoot, routes } from "../router/router";

import hp from "../img/hp.jpg";
import "../sass/pages/home.scss";

const Home = () => {
    const { user } = useContext(UserContext);

    return (
        <AppLayout navItems={defaultNavItems}>
            {/* Section : Présentation */}
            <div className={fr.cx("c-section", "c-section--gray")}>
                <div className={fr.cx("fr-container--fluid")}>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            <div className={fr.cx("fr-col-12", "fr-col-lg-6", "fr-px-0v", "fr-pl-md-14v")}>
                                <p className={fr.cx("fr-mt-4w", "fr-mt-md-7w", "fr-display--xxs")}>cartes.gouv.fr</p>

                                <h1 className={fr.cx("fr-mt-2w", "fr-mt-md-3w", "fr-mb-4w", "fr-display--xs")}>
                                    Le portail national
                                    <br />
                                    des géocommuns <br />
                                    et de la connaissance <br />
                                    du territoire
                                </h1>
                                <p className={fr.cx("fr-mb-5w", "fr-text--lg", "fr-pr-10v")}>
                                    <strong>une solution dédiée à l’information géographique au service des professionnels et des citoyens</strong>
                                </p>
                                <p className={fr.cx("fr-mb-2w")}>
                                    <a
                                        href=""
                                        className={fr.cx(
                                            "fr-btn",
                                            "fr-btn--secondary",
                                            "fr-btn--lg",
                                            "fr-mb-6v",
                                            "fr-btn--icon-left",
                                            "fr-icon-play-circle-fill"
                                        )}
                                        aria-hidden="true"
                                    >
                                        Présentation vidéo
                                    </a>
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
                                        <p>
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
                                        </p>
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
                                        <p>
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
                                        </p>
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

            {/* Section : Actualités */}
            <div className={fr.cx("c-section", "c-section--blue")}>
                <div className={fr.cx("fr-container fr-container--blue card  fr-pt-8v fr-pt-18v fr-mb-md-8v")}>
                    <h2 className={fr.cx("fr-text--center  fr-mb-12v")}>Actualités</h2>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        {/* TODO : boucler sur 3 items */}
                        <div className={fr.cx("fr-col-xs-12 fr-col-sm-12 fr-col-md-4 fr-col-lg-4")}>
                            <Card
                                badges={[
                                    <Tag key="1" className={fr.cx("fr-tag--pink-tuile")}>
                                        Autour de la terre
                                    </Tag>,
                                ]}
                                desc="Les Communs d’utilité publique ! Une journée d’échanges pour une nouvelle manière de relever ensemble les défis d’intérêt général"
                                detail="17 janvier 2023"
                                enlargeLink
                                imageAlt="illustration de l'article"
                                imageUrl="https://2fresh-studio.com/projets/ign/assets/img/actu1.jpg"
                                linkProps={{
                                    href: "#",
                                }}
                                title="Ceci est un titre d'article"
                            />
                        </div>
                    </div>

                    <div className={fr.cx("fr-col-12 text--center fr-pt-6w fr-pb-8w")}>
                        <Button linkProps={routes.news().link}>Voir toutes les actualités</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Home;
