import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import Main from "@/components/Layout/Main";
import { externalLink, externalUrls } from "@/router/externalUrls";
import { routes } from "@/router/router";
import classes from "../PresentationService.module.css";

import heroImgSrcSet from "@/img/discover/service-rechercher.png?w=400;800;1200&format=webp;png&as=srcset";
import alimentezFluxCartoSrcSet from "./img/alimentez-flux-carto.png?w=400;600&format=webp;png&as=srcset";
import donneesCadastralesSrcSet from "./img/donnees-cadastrales.png?w=400;600&format=webp;png&as=srcset";
import explorezDonneesEnvrionSrcSet from "./img/explorez-donnees-environnement.png?w=400;600&format=webp;png&as=srcset";
import illustrationImgSrcSet from "./img/illustration.png?w=400;800;1200&format=webp;png&as=srcset";
import telechargezBdtopoSrcSet from "./img/telechargez-bdtopo.png?w=400;600&format=webp;png&as=srcset";

export default function PresentationServiceCatalogue() {
    return (
        <Main title="Rechercher une donnée" fluidContainer={true}>
            <div className={classes.bgContrastInfoGrey}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col--middle")}>
                            <span className={cx(fr.cx("ri-search-line"), classes.icon, classes.iconLg)} />
                            <h1 className={fr.cx("fr-mt-4v", "fr-mb-2v")}>Rechercher une donnée</h1>
                            <p className={fr.cx("fr-text--lead", "fr-mb-6v")}>Filtrer, télécharger et exploitez des données</p>
                            <Button iconId="fr-icon-arrow-right-s-line" iconPosition="right" linkProps={{ href: externalUrls.catalogue }}>
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

                <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-4v"))}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-1")}>
                        <span className={cx(fr.cx("ri-search-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Recherchez une ressource</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                            Le moteur de recherche vous permet d’accéder à toutes les ressources publiques des producteurs et fournisseurs institutionnels comme
                            l’IGN, la DGFIP, le SHOM, et bien d’autres. Vous pouvez filtrer votre recherche par :
                        </p>
                        <ul>
                            <li>Type de ressource : donnée, service ou réutilisation</li>
                            <li>Thème : agriculture, environnement, hydrographie, télécommunications...</li>
                            <li>Producteur</li>
                            <li>Date de mise à jour</li>
                        </ul>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                            Filtrer avec “Plus Récent” pour voir les dernières mises à jour de vos données favorites.
                        </p>
                    </div>
                </div>
                <hr className={fr.cx("fr-mt-6v")} />
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-4v")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-1")}>
                        <span className={cx(fr.cx("fr-icon-file-text-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Consultez des fiches complètes pour chaque jeu de données</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>Chaque jeu de données dispose d’une fiche détaillée comprenant :</p>
                        <ul>
                            <li>Description et contexte</li>
                            <li>Producteur et son contact</li>
                            <li>Dates clés de production et de mise à jour</li>
                            <li>Mots-clés et thématiques</li>
                            <li>Aperçu de la donnée sur fonds cartographique</li>
                            <li>Accès aux ressources</li>
                            <li>Téléchargement (formats SIG, tableurs, etc.)</li>
                            <li>Flux standardisés (WMS, WMTS, WFS, TMS)</li>
                            <li>API, lorsque proposées par le producteur</li>
                            <li>Liens annexes et documents joints</li>
                        </ul>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                            Évaluez immédiatement la qualité, l’actualité et les modalités d’usage de la donnée.
                        </p>
                    </div>
                </div>
                <hr className={fr.cx("fr-mt-6v")} />
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-4v")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-1")}>
                        <span className={cx(fr.cx("fr-icon-download-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Utilisez la donnée en la téléchargeant ou via les flux et APIs</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                            Téléchargez une grande variété de données dans des formats compatibles avec vos outils métiers (SIG, tableurs, traitements
                            spécialisés)Vous pouvez également exploiter les données sous formes de flux standardisés (WMS, WMTS, WFS, TMS) et, selon les
                            services, via des APIs, ce qui facilite leur intégration dans vos outils métiers et portails cartographiques.
                        </p>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                            Lorsque que vous récupérez les données, vous pouvez filtrer par territoire ou via une interface dédiée, afin de ne récupérer que ce
                            qui est essentiel.
                        </p>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                            Récupérez les données du Lidar MNT seulement et uniquement sur votre territoire.
                        </p>
                    </div>
                </div>
            </div>

            <div className={cx(classes.bgAltGrey)}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-10", "fr-col-offset-md-1")}>
                            <img srcSet={illustrationImgSrcSet} alt="illustration" className={classes.illustrationImg} />
                            <hr className={fr.cx("fr-mt-6v")} />
                            <p className={cx(fr.cx("fr-text--lg", "fr-m-0"), classes.textCenter)}>
                                Successeur du <strong>Géoservices</strong>, retrouvez toutes vos fonctionnalités préférées. Accédez désormais à plus de données
                                et construisez avec nous le service publique cartographique de demain.
                            </p>
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
                                title="Un accès centralisé aux des données géographiques publiques"
                                desc={
                                    "Retrouvez en un seul endroit les données, services et réutilisations issues des producteurs institutionnels, sans avoir à multiplier les sources."
                                }
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Une transparence sur la qualité et l’origine des données"
                                desc={
                                    "Chaque ressource est accompagnée de métadonnées détaillées : producteur, mise à jour, méthodes, limites d’usage et conditions d’accès."
                                }
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Des téléchargements adaptés à vos besoins"
                                desc={"Accédez aux données par millésime, format ou territoire pour ne récupérer que ce qui est utile à vos analyses."}
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Une intégration simplifiée grâce aux flux et APIs"
                                desc={
                                    "Les services standardisés (WMS, WMTS, WFS, APIs) facilitent l’usage des données dans vos SIG, sites web ou outils métiers, avec des mises à jour automatiques."
                                }
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
                            <img srcSet={telechargezBdtopoSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Téléchargez la dernière version de la BD TOPO® pour un usage SIG</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                Trouvez rapidement la BD TOPO® actualisée et téléchargez-la dans le format SIG adapté
                            </p>
                            <p>Urbaniste, géomaticien, recherchez « BD TOPO » et utilisez-la immédiatement dans vos projets d’analyse ou d’aménagement.</p>
                            <p>→ Accédez à la fiche du jeu de données et à un aperçu cartographique des différents thèmes</p>
                            <p>→ Vérifiez la date de mise à jour</p>
                            <p>→ Sélectionnez le téléchargement qui vous convient (zone, thème, projection, millésime)</p>
                            <p>→ Choisissez le format (gpkg, shp, sql) pour une intégration optimale dans votre SIG </p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={donneesCadastralesSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Récupérez les données cadastrales pour un projet foncier</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                Localisez et exploitez les données cadastrales nécessaires à une étude foncière
                            </p>
                            <p>Pour une mission d’aménagement, un bureau d’étude peut rechercher le Parcellaire Express (PCI) et :</p>
                            <p>→ Consultez sa fiche (producteur, point de contact, date de mise à jour) </p>
                            <p>→ Visualisez la donnée sur fonds cartographiques</p>
                            <p>→ Téléchargez les fichiers cadastraux (emprise départementale)</p>
                            <p>→ Ou intégrez directement les flux (WMS/WFS/MAPLIBRE...) dans votre projet afin d’en simplifier les mises à jour régulières</p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={explorezDonneesEnvrionSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Explorez les données environnementales (habitats, forêts, eau…)</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                Identifiez rapidement des données par thème (environnement, eau…) pour une analyse thématique
                            </p>
                            <p>
                                Collectivité, bureau de biodiversité ou chef de projet environnement, filtrez avec le thème « Environnement » pour accéder aux
                                données de l’ONF, des DREAL et DDT
                            </p>
                            <p>→ Les fiches fournissent les métadonnées complètes, les cartes d’aperçu et les conditions d’accès </p>
                            <p>→ Les flux OGC permettent une intégration et visualisation instantanée dans vos outils</p>
                            <p>
                                →Les téléchargements facilitent des analyses approfondies sur le carbone, les continuités écologiques ou la qualité des milieux
                                aquatiques
                            </p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={alimentezFluxCartoSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Alimentez un portail cartographique grâce aux flux et APIs</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                Intégrez des services de visualisation ou d’interrogation directement dans un portail interne
                            </p>
                            <p>
                                Intégrez bien plus que des données dans vos outils métiers et portails géographqiues. Enrichissez-les avec d’autres services
                                tels que ceux de géocodage, de calcul d’itinéraire ou encore d’altimétrie. Simples à configurer, ils s’appuient sur des
                                ressources mises à jour régulièrement sans intervention manuelle.
                            </p>
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
                                Consulter notre documentation pour apprendre à utiliser notre service, pas à pas, jusqu’à maîtriser les fonctionnalités plus
                                avancées.
                            </p>
                            <Button
                                className={classes.textActionHighBlueFrance}
                                priority="secondary"
                                linkProps={externalLink("documentationUserGuideCatalogueGeneral")}
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
                            <Button linkProps={routes.join().link}>Rejoindre la communauté</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}
