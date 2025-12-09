import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import Main from "@/components/Layout/Main";
import { externalLink, externalUrls } from "@/router/externalUrls";
import { routes } from "@/router/router";
import classes from "../PresentationService.module.css";

import heroImgSrcSet from "@/img/discover/service-explorer.png?w=400;800;1200&format=webp;png&as=srcset";
import illustrationImgSrcSet from "./img/illustration.png?w=400;800;1200&format=webp;png&as=srcset";
import anticipezAccessImgSrcSet from "./img/anticipez-accessibilite-territoire.png?w=400;600&format=webp;png&as=srcset";
import carteReunionLocaleImgSrcSet from "./img/carte-reunion-concertation-locale.png?w=400;600&format=webp;png&as=srcset";
import exploitezDonneesThemImgSrcSet from "./img/exploitez-donnes-thematiques-publiques.png?w=400;600&format=webp;png&as=srcset";
import projetAmenagementImgSrcSet from "./img/projet-amenagement-mobilite.png?w=400;600&format=webp;png&as=srcset";

export default function PresentationServiceMaps() {
    return (
        <Main title="Explorer les cartes" fluidContainer={true}>
            <div className={classes.bgContrastInfoGrey}>
                <div className={cx(fr.cx("fr-container"), classes.container)}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col--middle")}>
                            <span className={cx(fr.cx("ri-map-2-line"), classes.icon, classes.iconLg)} />
                            <h1 className={fr.cx("fr-mt-4v", "fr-mb-2v")}>Explorer les cartes</h1>
                            <p className={fr.cx("fr-text--lead", "fr-mb-6v")}>Affichez, analysez et partagez des cartes</p>
                            <Button iconId="fr-icon-arrow-right-s-line" iconPosition="right" linkProps={{ href: externalUrls.maps }}>
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
                        <span className={cx(fr.cx("ri-map-2-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Accédez aux fonds de carte IGN</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                            Les cartes de l’IGN sont accessibles en quelques clics. Elles forment la référence du territoire français, offrant des informations
                            à jour, homogènes et essentielles pour toute analyse du territoire.
                        </p>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                            Retrouvez les plans, prises de vues aériennes, les cartes classiques (SCAN 25), cartes topographiques, le cadastre ou encore des
                            cartes historiques.
                        </p>
                    </div>
                </div>
                <hr className={fr.cx("fr-mt-6v")} />
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-4v")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-1")}>
                        <span className={cx(fr.cx("fr-icon-france-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Consultez des cartes thématiques nationales et locales</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                            Consultez une large sélection de cartes thématiques sur des sujets variés comme l’environnement, la mobilité, l’urbanisme, les
                            risques naturels et la biodiversité.
                            <br />
                            Vous pouvez afficher plusieurs cartes pour comparer, enrichir et mieux comprendre les enjeux propres à chaque territoire.
                        </p>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                            Obtenez une lecture exhaustive du territoire en combinant par exemple les prises de vue aériennes (BD ORTHO), le plan IGN, le
                            cadastre (BD Parcellaire) et les données d’occupation du sol (OCS GE).
                        </p>
                    </div>
                </div>
                <hr className={fr.cx("fr-mt-6v")} />
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-4v")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-1")}>
                        <span className={cx(fr.cx("ri-tools-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Bénéficiez d’une boîte à outils pour analyser votre territoire</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>Parmi nos outils, vous pouvez&nbsp;:</p>
                        <ul>
                            <li>Rechercher une adresse, un toponyme ou une parcelle</li>
                            <li>Rechercher ou afficher des coordonnées</li>
                            <li>Mesurer une distance, une surface ou un angle</li>
                            <li>Calculer un itinéraire piéton ou voiture</li>
                            <li>
                                Calculer des zones en fonction d’un temps ou d’une distance de trajet (isochrone/isodistance) pour visualiser l’accessibilité
                                d’un lieu
                            </li>
                            <li>Obtenir un profil altimétrique (altitude) le long d’un itinéraire</li>
                        </ul>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                            Activez vos outils préférés et personnalisez votre interface.
                        </p>
                    </div>
                </div>
                <hr className={fr.cx("fr-mt-6v")} />
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-4v")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-1")}>
                        <span className={cx(fr.cx("ri-pen-nib-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Créez des cartes simples</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                            Importez vos données métiers (fichiers géographiques, flux) et superposez-les aux données de référence pour découvrir de nouvelles
                            corrélations et illustrer des phénomènes.
                        </p>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>
                            Utilisez nos outils pour ajouter des annotations, dessins ou points d’intérêt.
                        </p>
                    </div>
                </div>
                <hr className={fr.cx("fr-mt-6v")} />
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-4v")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-1")}>
                        <span className={cx(fr.cx("ri-share-2-line"), classes.icon)} />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-5")}>
                        <h3 className={fr.cx("fr-m-0", "fr-h6")}>Diffusez des cartes instantanément</h3>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <p className={fr.cx("fr-text--lg", "fr-mb-3v")}>
                            Partagez simplement vos cartes via un lien direct (url unique) ou en l’intégrant dans vos services via une iframe.
                        </p>
                        <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.textMentionGrey)}>Et sauvegardez-les en créant votre compte.</p>
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
                                title="Des cartes fiables et actualisées"
                                desc={
                                    "Accédez aux cartes de référence produites par les organismes publics, mises à jour régulièrement et garanties par l’État."
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
                                title="Une prise en main immédiate"
                                desc={"Explorez le territoire en quelques clics, sans créer de compte ni installer de logiciel."}
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Un service gratuit et ouvert à tous"
                                desc={"L’ensemble des cartes et des outils est accessible gratuitement, pour les citoyens comme pour les professionnels."}
                                classes={{
                                    title: classes.tileNoBorder,
                                }}
                                noBorder
                                className={classes.tile}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md")}>
                            <Tile
                                title="Une boîte à outils pour vos premières analyses"
                                desc={"Mesurez des distances, calculez un itinéraire,  ou analysez un profil altimétrique directement sur la carte."}
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
                            <img srcSet={projetAmenagementImgSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Préparez un projet d’aménagement ou de mobilité</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>Mesurez, analysez et tracez un projet directement sur la carte</p>
                            <p>Pour préparer un diagnostic avant de lancer votre projet d’aménagement ou d’infrastructure&nbsp;:</p>
                            <p>
                                → Utilisez les cartes de référence comme le cadastre, les réseaux ou les reliefs pour préparer un diagnostic avant de lancer
                                votre projet d’aménagement ou d’infrastructure
                            </p>
                            <p>
                                → Utilisez les outils de mesure et d’annotation pour estimer la surface d’un espace, tracer un futur cheminement ou étudier la
                                pente via le profil altimétrique
                            </p>
                            <p>→ Exportez et imprimez votre carte pour l’intégrer dans des rapports ou l’utiliser sur le terrain</p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={anticipezAccessImgSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Anticipez l’accessibilité d’un territoire</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                Calculez des itinéraires, des isochrones ou évaluez l’accessibilité à un service.
                            </p>
                            <p>
                                Pour comprendre comment un territoire est desservi, il est essentiel d’examiner l’accès aux zones rurales, périurbaines et
                                urbaines, ainsi que la proximité des équipements publics&nbsp;:
                            </p>
                            <p>→ Mesurez des distances depuis un point donné</p>
                            <p>→ Calculez des itinéraires piétons ou automobiles</p>
                            <p>→ Visualisez des isochrones (zones atteignables en un temps donné)</p>
                            <p>→ Visualisez des isodistances (zones atteignables en un nombre de kilomètres défini)</p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={exploitezDonneesThemImgSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Exploitez les données thématiques publiques</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                Accédez à une variété de données administratives, environnementales, forestières ou maritimes
                            </p>
                            <p>
                                Pour réaliser une analyse approfondie sur votre territoire, profitez d’une large offre de données fournie par des organismes
                                publics : limites administratives, zones forestières (ONF), données littorales et maritimes (SHOM), risques naturels,
                                localisation des sentiers et habitats naturels (INPN)…
                            </p>
                            <p>→ Sélectionnez et affichez des données</p>
                            <p>→ Ajustez la transparence des couches pour les comparer</p>
                            <p>→ Éditez leur style si l’option est disponible pour personnaliser leur affichage </p>
                            <p>
                                → Consultez leur légende, leurs métadonnées ou encore interrogez directement les données sur la carte si l’option est disponible
                            </p>
                        </div>
                    </div>

                    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--no-gutters"), classes.usageCard, classes.bgDefaultGrey)}>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardImg)}>
                            <img srcSet={carteReunionLocaleImgSrcSet} alt="" />
                        </div>
                        <div className={cx(fr.cx("fr-col-12", "fr-col-md"), classes.usageCardCol)}>
                            <h3 className={fr.cx("fr-h4")}>Préparez une carte pour une réunion de concertation locale</h3>

                            <p className={cx(fr.cx("fr-text--xs"), classes.textMentionGrey)}>
                                Dessinez un tracé, ajoutez des points d’intérêt et partagez une carte interactive
                            </p>
                            <p>
                                Pour préparer une réunion publique sur l’aménagement d’un terrain comme la conception d’une nouvelle piste cyclable, créez votre
                                carte sur mesure et partagez-la aux décideurs et aux citoyens concernés&nbsp;:
                            </p>
                            <p>→ Choisissez un ou plusieurs fonds de carte comme le plan IGN ou les prises de vues aériennes</p>
                            <p>→ Importez le tracé prévisionnel du projet (fichier GPX/GeoJSON) </p>
                            <p>
                                → Ajoutez des annotations et dessinez directement sur votre carte pour montrer les points de conflit, les zones sensibles, les
                                axes traversés...
                            </p>
                            <p>→ Partagez votre carte via un lien direct ou intégrez la directement dans la page web du projet</p>
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
                            <Button className={classes.textActionHighBlueFrance} priority="secondary" linkProps={externalLink("documentationExploreMaps")}>
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
