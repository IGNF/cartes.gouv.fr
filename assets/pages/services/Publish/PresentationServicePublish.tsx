import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import Main from "@/components/Layout/Main";
import { routes } from "@/router/router";
import classes from "../PresentationService.module.css";

import illustrationImgSrcSet from "./img/illustration.png?w=400;800;1200&format=webp;png&as=srcset";
import heroImgSrcSet from "./img/hero.png?w=400;800;1200&format=webp;png&as=srcset";
import alimentezPortailThematiqueSrcSet from "./img/alimentez-portail-thematique.png?w=400;600&format=webp;png&as=srcset";
import donneesRasterSrcSet from "./img/donnee-raster.png?w=400;600&format=webp;png&as=srcset";
import openDataSrcSet from "./img/open-data.png?w=400;600&format=webp;png&as=srcset";
import suiviDonneesEnvironSrcSet from "./img/suivi-donnees-environ.png?w=400;600&format=webp;png&as=srcset";
import { externalLink } from "@/router/externalUrls";

export default function PresentationServicePublish() {
    return (
        <Main title="Publier une donnée" fluidContainer={true}>
            <div className={classes.bgContrastInfoGrey}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col--middle")}>
                            <span className={cx(fr.cx("fr-icon-database-line"), classes.icon, classes.iconLg)} />
                            <h1 className={fr.cx("fr-mt-4v", "fr-mb-2v")}>Publier une donnée</h1>
                            <p className={fr.cx("fr-text--lead", "fr-mb-6v")}>Hébergez, créez des flux, partagez</p>
                            <Button iconId="fr-icon-arrow-right-s-line" iconPosition="right" linkProps={routes.discover_publish().link}>
                                Accédez au service
                            </Button>
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                            <img srcSet={heroImgSrcSet} alt="" className={classes.heroImage} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx(fr.cx("fr-container"), classes.container)}>
                <h2 className={fr.cx("fr-m-0")}>Ce que vous pouvez faire</h2>

                <div className={classes.featureRowWrapper}>
                    <div className={cx(classes.featureRow)}>
                        <span className={cx(fr.cx("fr-icon-database-line"), classes.icon)} />
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Collaborez sur un espace dédié</h3>
                        <div>
                            <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                                Collaborez et organisez vos données dans un entrepôt sécurisé conçu pour le travail en équipe. Vous pouvez gérer vos jeux de
                                données dans un espace unique tout en contrôlant les accès grâce à une authentification et une gestion précise des droits.
                            </p>
                            <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                                Testez au préalable les fonctionnalités de dépôt et de publication dans l’espace Découverte pour prendre en main la procédure
                                sans conséquence sur le catalogue.
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className={cx(classes.featureRow)}>
                        <span className={cx(fr.cx("fr-icon-upload-line"), classes.icon)} />
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Déposez des données</h3>
                        <div>
                            <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                                Déposez et hébergez directement vos données via l’interface cartes.gouv.fr sur l’infrastructure prévue, la Géoplateforme. Nul
                                besoin de compétences techniques avancées ou de manipulation d’API, laissez-vous guider pour déposer vos fichiers et remplir les
                                métadonnées.
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className={cx(classes.featureRow)}>
                        <span className={cx(fr.cx("fr-icon-global-line"), classes.icon)} />
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Créez des services de diffusion</h3>
                        <div>
                            <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                                Choisissez un type de service standard (WFS, WMS, TMS, WMTS) pour vos jeux de données et générez votre service en quelques
                                étapes.
                            </p>
                            <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                                Importez ou créez directement vos styles pour personnaliser le rendu de vos flux.
                            </p>
                            <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                                Visualisez le résultat dans la fiche catalogue du service “Rechercher une donnée” et dans le service “Explorer les cartes”.
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className={cx(classes.featureRow)}>
                        <span className={cx(fr.cx("fr-icon-lock-line"), classes.icon)} />
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Gérez les droits d’accès à vos ressources</h3>
                        <div>
                            <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                                Choisissez de publier vos données en accès libre à tous, ou en accès restreint. Contrôlez finement quels utilisateurs ou quelles
                                communautés pourront consulter vos services.
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className={cx(classes.featureRow)}>
                        <span className={cx(classes["frx-icon-accroche-option"], classes.icon)} />
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Publiez vos données raster déposées sur la Géoplateforme</h3>
                        <div>
                            <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                                Retrouvez facilement vos données raster déposées sur la Géoplateforme sur cartes.gouv.fr, et finalisez la création des services
                                de diffusion associés via l’interface, pas à pas.
                            </p>
                            <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                                Publiez en toute cohérence, quel que soit le type de données.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx(classes.bgAltGrey)}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-10", "fr-col-offset-md-1")}>
                            <img srcSet={illustrationImgSrcSet} alt="illustration" className={classes.illustrationImg} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx(classes.bgOpenBlueFrance)}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <h2 className={fr.cx("fr-m-0")}>Les avantages</h2>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Un hébergement public et souverain"
                                desc={"Vos données sont hébergées en France, sans infrastructure ni ressources techniques à mobiliser."}
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title={"Un espace unique et centralisé"}
                                desc={"Retrouvez vos entrepôts, vos données et vos services depuis un tableau de bord centralisé."}
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Une maîtrise totale de la diffusion"
                                desc={"Choisissez une publication publique ou restreinte et contrôlez précisément les accès utilisateurs."}
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Une mise en ligne immédiate"
                                desc={"Une fois publiée, vos données apparaissent aussitôt dans cartes.gouv.fr, sans action supplémentaire."}
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx(classes.bgAltGrey)}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <h2 className={fr.cx("fr-m-0")}>Adapté à vos usages</h2>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={suiviDonneesEnvironSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Mettez à disposition un suivi restreint de vos données environnementales</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                N’autorisez que certains utilisateurs à suivre l’évolution de vos données
                            </p>
                            <p>
                                OFB ou DDTM, mettez à disposition auprès des acteurs publics ou opérationnels habilités un suivi de l’évolution d’habitats
                                protégés ou d’espèces sensibles.
                            </p>
                            <p>→ Déposez la donnée vectorielle sensible dans l’espace de stockage sécurisé</p>
                            <p>→ Générez un flux WMS-V en lui appliquant un style afin de faciliter la compréhension et l’interprétation de la donnée</p>
                            <p>
                                → Renseignez et complétez les métadonnées afin de contextualiser la couche et de la rendre repérable dans le catalogue de
                                cartes.gouv.fr (Rechercher une donnée).
                            </p>
                            <p>→ Attribuez les droits d’accès à la communauté ciblée ou directement aux utilisateurs habilités.</p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={donneesRasterSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Stockez une donnée raster et rendez-la accessible à tous</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>Stockez différents formats de jeux de données</p>
                            <p>Parc naturel régional, observatoires, diffusez simplement vos orthophotos locales et cartes thermiques au grand public</p>
                            <p>→ Déposez la donnée raster (COG, GeoTIFF, etc.) dans l’entrepôt de la Géoplateforme</p>
                            <p>→ Ajoutez un tag “datasheet_name” sur la donnée stockée pour rendre la donnée visible dans cartes.gouv.fr</p>
                            <p>
                                → Créez les services de diffusion depuis cartes.gouv.fr en flux WMTS ou TMS et en configurant la résolution des pyramides selon
                                vos besoins d’affichage.
                            </p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={alimentezPortailThematiqueSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Alimentez votre portail thématique</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>Hébergez vos données en un point unique</p>
                            <p>Opérateur public, institut de recherche, diffusez vos données dans votre portail pour exposer vos données thématiques.</p>
                            <p>→ Déposez votre donnée dans votre entrepôt</p>
                            <p>→ Générez vos flux de diffusion (WMS, WFS, TMS, WMTS) et définissez leur style d’affichage</p>
                            <p>→ Renseignez les métadonnées pour garantir la traçabilité, l’interopérabilité et la réutilisation.</p>
                            <p>→ Exposez vos flux dans votre portail sans dupliquer aucune donnée.</p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={openDataSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Déposez vos données en open data, de cartes.gouv.fr à data.gouv.fr</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>Déposez vos données à travers les services publics</p>
                            <p>
                                Pour diffuser toutes vos données sur data.gouv.fr tout en bénéficiant de l’infrastructure de cartes.gouv.fr, la Géoplateforme,
                                et de ses performances&nbsp;:
                            </p>
                            <p>→ Déposez votre donnée géographique (vecteur ou raster) et renseignez les métadonnées complètes</p>
                            <p>→ Publiez la ressource sous forme d’un ou plusieurs services de diffusion (WMS, WFS, WMTS, TMS)</p>
                            <p>→ Autorisez le moissonnage par data.gouv.fr </p>
                            <p>→ Retrouvez automatiquement votre donnée dans data.gouv.fr.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx(classes.bgActionHighBlueFrance, classes.textInvertedBlueFrance)}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <h2 className={fr.cx("fr-m-0")}>Pour aller plus loin</h2>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
                        <div
                            className={cx(
                                fr.cx("fr-col-12", "fr-col-md", "fr-mx-4v", "fr-mr-10v", "fr-p-md-10v", "fr-col--middle"),
                                classes.bgContrastInfoGrey,
                                classes.textDefaultGrey,
                                classes.equalHeightCol
                            )}
                        >
                            <p className={fr.cx("fr-text--lg")}>
                                Consultez notre documentation pour apprendre à utiliser notre service, pas à pas, jusqu’à maîtriser les fonctionnalités plus
                                avancées.
                            </p>
                            <Button
                                className={classes.textActionHighBlueFrance}
                                priority="secondary"
                                linkProps={externalLink("documentationProducerGuideGeneral")}
                            >
                                Consulter la documentation
                            </Button>
                        </div>
                        <div
                            className={cx(
                                fr.cx("fr-col-12", "fr-col-md", "fr-mx-4v", "fr-p-md-10v", "fr-col--middle"),
                                classes.borderDefaultGrey,
                                classes.equalHeightCol
                            )}
                        >
                            <p className={fr.cx("fr-text--lg")}>
                                Rejoignez une communauté d’utilisateurs et de contributeurs pour échanger, partager vos retours et construire ensemble les
                                services cartographiques de demain.
                            </p>
                            <Button linkProps={routes.join_cartesgouvfr_community().link}>Rejoindre la communauté</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}
