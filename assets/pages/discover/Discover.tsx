import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import { getLink } from "@codegouvfr/react-dsfr/link";
import CityHall from "@codegouvfr/react-dsfr/picto/CityHall";
import Community from "@codegouvfr/react-dsfr/picto/Community";
import Environment from "@codegouvfr/react-dsfr/picto/Environment";
import Internet from "@codegouvfr/react-dsfr/picto/Internet";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useEffect } from "react";
import { useToggle } from "usehooks-ts";

import Main from "@/components/Layout/Main";
import { useAlert } from "@/hooks/useAlert";
import SymfonyRouting from "@/modules/Routing";
import { externalLink, externalUrls } from "@/router/externalUrls";
import { routes, useRoute } from "@/router/router";
import { useAlertStore } from "@/stores/AlertStore";
import { useAuthStore } from "@/stores/AuthStore";
import classes from "./Discover.module.css";
import FeatureCard from "./FeatureCard";

import bdOrthoThumbUrl from "@/img/discover/data-card/bd-ortho.png";
import donneesStatPubThumbUrl from "@/img/discover/data-card/donnees-stats-pub.png";
import foretsPubThumbUrl from "@/img/discover/data-card/forets-pub.svg";
import ocsgeThumbUrl from "@/img/discover/data-card/ocsge.svg";
import pebThumbUrl from "@/img/discover/data-card/peb.png";
import projetsZaerThumbUrl from "@/img/discover/data-card/projets-zaer.svg";
import rpgThumbUrl from "@/img/discover/data-card/rpg.png";
import scan25ThumbUrl from "@/img/discover/data-card/scan25.png";
import heroImgSrcSet from "@/img/discover/hero.png?w=400;800;1200&format=webp;png&as=srcset";
import geocodingThumbUrl from "@/img/discover/key-feature-card/geocoding.svg";
import geopfApisThumbUrl from "@/img/discover/key-feature-card/geoplateforme-apis.svg";
import geopfQgisPluginThumbUrl from "@/img/discover/key-feature-card/geoplateforme-qgis-plugin.svg";
import geoservicesIntegrationThumbUrl from "@/img/discover/key-feature-card/geoservices-integration.svg";
import hostingSharingThumbUrl from "@/img/discover/key-feature-card/hosting-sharing-sensitive-data.svg";
import lidarhdThumbUrl from "@/img/discover/key-feature-card/lidarhd.svg";
import illustrationServiceExploreSrcSet from "@/img/discover/service-explorer.png?w=400;600;800&format=webp;png&as=srcset";
import illustrationServiceSearchSrcSet from "@/img/discover/service-rechercher.png?w=400;600;800&format=webp;png&as=srcset";
import catalogueSvgUrl from "@/img/pictograms/catalogue.svg";
import contributorSvgUrl from "@/img/pictograms/contributor.svg";
import editorSvgUrl from "@/img/pictograms/editor.svg";
import uploaderSvgUrl from "@/img/pictograms/uploader.svg";
import viewerSvgUrl from "@/img/pictograms/viewer.svg";

const dataCards = [
    {
        title: "Prises de vues aériennes (BD ORTHO)",
        organisation: "IGN",
        thumbnailUrl: bdOrthoThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/IGNF_BD-ORTHO",
        },
    },
    {
        title: "SCAN 25",
        organisation: "IGN",
        thumbnailUrl: scan25ThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/IGNF_SCAN-25",
        },
    },
    {
        title: "Données Statistiques Publiques",
        organisation: "INSEE",
        thumbnailUrl: donneesStatPubThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/INSEE_DONNEES",
        },
    },
    {
        title: "Forêts Publiques",
        organisation: "ONF",
        thumbnailUrl: foretsPubThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/ONF_FORETS-PUBLIQUES",
        },
    },
    {
        title: "Occupation du Sol à grande Échelle (OCS GE)",
        organisation: "DGALN, IGN, MTE",
        thumbnailUrl: ocsgeThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/IGNF_INPE",
        },
    },
    {
        title: "Registre Parcellaire Graphique (RPG)",
        organisation: "IGN",
        thumbnailUrl: rpgThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/IGNF_RPG",
        },
    },
    {
        title: "Plan d'Exposition au Bruit (PEB)",
        organisation: "DGAC",
        thumbnailUrl: pebThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/DGAC_Plan_d_Exposition_au_Bruit_PEB",
        },
    },
    {
        title: "Projets de zones d'accélération des énergies renouvelables",
        organisation: "DTT 51",
        thumbnailUrl: projetsZaerThumbUrl,
        linkProps: {
            href: "https://cartes.gouv.fr/rechercher-une-donnee/dataset/f1a74532-5e5a-4756-b100-b6524f9a1805",
        },
    },
] as const;

export default function Discover() {
    const { params } = useRoute();
    const user = useAuthStore((state) => state.user);
    const alert = useAlertStore(({ alerts }) => alerts.find((alert) => alert.visibility.homepage));
    const alertProps = useAlert(alert);

    const { Link } = getLink();

    useEffect(() => {
        if (user !== null && params?.["authentication_failed"] !== undefined) {
            routes.discover().replace();
        }

        if (user !== null && params?.["session_expired_login_success"] === 1) {
            window.close();
        }
    }, [params, user]);

    const [showAllDataCards, toggleShowAllDataCards] = useToggle(false);
    const displayedDataCards = showAllDataCards ? dataCards : dataCards.slice(0, 4);

    return (
        <Main noticeProps={alertProps} title="Le service public des cartes et données du territoire" fluidContainer={true}>
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
                        "Reconnexion réussie, cette page devrait se fermer automatiquement. Si ce n’est pas le cas, vous pouvez fermer la page en cliquant sur le bouton fermer."
                    }
                    onClose={window.close}
                />
            )}

            <section className={cx(fr.cx("fr-container"), classes.heroSection)}>
                <div>
                    <h1>
                        Découvrir
                        <br />
                        <strong>cartes.gouv.fr</strong>
                    </h1>

                    <p>Des cartes, des données, des outils pour explorer, comprendre et approfondir la connaissance du territoire.</p>
                </div>

                <img srcSet={heroImgSrcSet} alt="" />
            </section>

            <section className={cx(classes.section, classes.bgAltGrey)}>
                <div className={cx(classes.featureCardsWrapper)}>
                    <FeatureCard
                        illustration={{
                            srcSet: illustrationServiceExploreSrcSet,
                        }}
                        picto={viewerSvgUrl}
                        title="Explorer les cartes"
                        desc={
                            <>
                                <strong>Découvrez des cartes thématiques et de référence</strong>&nbsp;
                                {"dont les fonds IGN sur l’ensemble du territoire français."}
                            </>
                        }
                        footer={
                            <>
                                <Link className={fr.cx("fr-link")} {...routes.present_service_maps().link}>
                                    {"En savoir plus"}
                                </Link>
                                <Button
                                    linkProps={{
                                        href: externalUrls.maps,
                                    }}
                                >
                                    Explorer
                                </Button>
                            </>
                        }
                    />
                    <FeatureCard
                        illustration={{
                            srcSet: illustrationServiceSearchSrcSet,
                            position: "right",
                        }}
                        picto={catalogueSvgUrl}
                        title="Rechercher une donnée"
                        desc={
                            <>
                                Accédez rapidement à la donnée dont vous avez besoin,&nbsp;
                                <strong>téléchargez-la, utilisez ses flux et mobilisez des APIs.</strong>
                            </>
                        }
                        footer={
                            <>
                                <Link className={fr.cx("fr-link")} {...routes.present_service_catalogue().link}>
                                    {"En savoir plus"}
                                </Link>
                                <Button
                                    linkProps={{
                                        href: externalUrls.catalogue,
                                    }}
                                >
                                    Rechercher
                                </Button>
                            </>
                        }
                    />
                    <div className={cx(fr.cx("fr-grid-row"), classes.featureCardsRow)}>
                        <div className={fr.cx("fr-col")}>
                            <FeatureCard
                                picto={uploaderSvgUrl}
                                title="Publier une donnée"
                                desc={
                                    <>
                                        Grâce à la Géoplateforme, infrastructure ouverte et souveraine,&nbsp;
                                        <strong>hébergez, actualisez et partagez vos données en toute autonomie.</strong>
                                    </>
                                }
                                footer={
                                    <>
                                        <Link className={fr.cx("fr-link")} {...routes.present_service_publish().link}>
                                            {"En savoir plus"}
                                        </Link>
                                        <Button linkProps={routes.discover_publish().link}>Publier</Button>
                                    </>
                                }
                            />
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <FeatureCard
                                picto={contributorSvgUrl}
                                title="Collaborer sur des données"
                                desc={
                                    <>
                                        <strong>Créez des signalements, enrichissez des bases de données</strong>&nbsp;et animez vos communautés de
                                        contributeurs.
                                    </>
                                }
                                footer={
                                    <>
                                        {/* <Link className={fr.cx("fr-link")} href={routes.discover().href}>
                                        {"En savoir plus"}
                                    </Link> */}
                                        <Badge severity="new">À venir</Badge>
                                    </>
                                }
                            />
                        </div>

                        <div className={fr.cx("fr-col")}>
                            <FeatureCard
                                picto={editorSvgUrl}
                                title="Créer des cartes"
                                desc={
                                    <>
                                        Mobilisez les données de cartes.gouv.fr et&nbsp;
                                        <strong>transformez vos données en cartes personnalisées</strong>, interactives et prêtes à être partagées.
                                    </>
                                }
                                footer={
                                    <>
                                        {/* <Link className={fr.cx("fr-link")} href={routes.discover().href}>
                                        {"En savoir plus"}
                                    </Link> */}
                                        <Badge severity="new">À venir</Badge>
                                    </>
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={classes.section}>
                <div className={cx(classes.featureCardsWrapper)}>
                    <h2 className={classes.sectionTitle}>Des données utiles, fiables et souveraines sur l’ensemble du territoire</h2>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        {displayedDataCards.map((card) => (
                            <div key={card.title} className={fr.cx("fr-col-12", "fr-col-md-3")}>
                                <Card
                                    key={card.title}
                                    size="small"
                                    imageUrl={card.thumbnailUrl}
                                    imageAlt=""
                                    title={card.title}
                                    detail={card.organisation}
                                    linkProps={card.linkProps}
                                    enlargeLink
                                    border={false}
                                    classes={{
                                        body: classes.bgAltBlueFrance,
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <Button
                        iconId={showAllDataCards ? "fr-icon-subtract-line" : "fr-icon-add-line"}
                        iconPosition="right"
                        priority="secondary"
                        onClick={toggleShowAllDataCards}
                    >
                        Afficher {showAllDataCards ? "moins" : "plus"}
                    </Button>
                </div>
            </section>

            <section className={cx(classes.section, classes.bgAltGrey)}>
                <div className={cx(classes.featureCardsWrapper)}>
                    <h2 className={classes.sectionTitle}>Des fonctionnalités clés pour cartographier et analyser son territoire</h2>

                    <div className={cx(fr.cx("fr-accordions-group"), classes.accordionsGroup, classes.bgGrey)}>
                        <Accordion label="Géocoder des fichiers d'adresse" defaultExpanded={true}>
                            <div className={classes.accordionBody}>
                                <img src={geocodingThumbUrl} alt="" />
                                <div>
                                    <p className={fr.cx("fr-m-0", "fr-mb-4v")}>
                                        Téléversez votre fichier d’adresses, obtenez instantanément leur position géographique et générez des cartes pour
                                        visualiser vos équipements et services.
                                    </p>
                                    <div className={classes.accordionButtons}>
                                        <Link
                                            className={fr.cx("fr-link")}
                                            href="https://cartes.gouv.fr/aide/fr/guides-utilisateur/acceder-aux-geodonnees/geocodage/"
                                            target="_blank"
                                        >
                                            En savoir plus
                                        </Link>
                                        {/* <Link className={fr.cx("fr-link")} href="https://cartes.gouv.fr/rechercher-une-donnee/service/GeoPF_Geocodage" target="_blank">
                                            Géocoder
                                        </Link> */}
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                        <Accordion label="Télécharger et analyser les données Lidar HD">
                            <div className={classes.accordionBody}>
                                <img src={lidarhdThumbUrl} alt="" />
                                <div>
                                    <p className={fr.cx("fr-m-0", "fr-mb-4v")}>
                                        Accédez aux données LiDAR HD produites par l’IGN pour visualiser finement le relief, la végétation ou les
                                        infrastructures. Téléchargez les données brutes ou parcourez-les directement dans le visualiseur intégré pour faciliter
                                        l’exploration, les mesures et l’analyse du modèle numérique du territoire.
                                    </p>
                                    <div className={classes.accordionButtons}>
                                        <Link className={fr.cx("fr-link")} href="https://cartes.gouv.fr/telechargement/IGNF_MNT-LIDAR-HD" target="_blank">
                                            Consulter
                                        </Link>
                                        <Link
                                            className={fr.cx("fr-link")}
                                            href="https://cartes.gouv.fr/rechercher-une-donnee/dataset/IGNF_MNT-LIDAR-HD"
                                            target="_blank"
                                        >
                                            Accéder à la fiche du LIDAR HD MNT
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                        <Accordion label="Mobiliser les APIs de la Géoplateforme">
                            <div className={classes.accordionBody}>
                                <img src={geopfApisThumbUrl} alt="" />
                                <div>
                                    <p className={fr.cx("fr-m-0", "fr-mb-4v")}>
                                        Accédez aux APIs mises à disposition par la Géoplateforme : géocodage, calcul d’itinéraires, altimétrie, recherche de
                                        données, génération de tuiles… Ces APIs sécurisées, opérationnelles et documentées permettent d’intégrer facilement des
                                        services géographiques dans vos applications, sans dépendre de solutions externes.
                                    </p>
                                    <div className={classes.accordionButtons}>
                                        <Link
                                            className={fr.cx("fr-link")}
                                            href="https://cartes.gouv.fr/aide/fr/guides-utilisateur/acceder-aux-geodonnees/"
                                            target="_blank"
                                        >
                                            En savoir plus
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                        <Accordion label="Intégrer facilement les flux géographiques dans vos applications">
                            <div className={classes.accordionBody}>
                                <img src={geoservicesIntegrationThumbUrl} alt="" />
                                <div>
                                    <p className={fr.cx("fr-m-0", "fr-mb-4v")}>
                                        Exploitez les flux publics (WMS, WMTS, WFS) de cartes.gouv.fr dans vos sites, applications, tableaux de bord ou SIG. Les
                                        développeurs disposent d’URL directes, de scripts d’intégration et de ressources techniques pour connecter rapidement
                                        les données officielles du territoire à leurs projets numériques.
                                    </p>
                                    <div className={classes.accordionButtons}>
                                        <Link className={fr.cx("fr-link")} {...externalLink("helpUserGuideGeopfServicesTutorial")}>
                                            En savoir plus
                                        </Link>
                                        <Link className={fr.cx("fr-link")} href="https://fab-geocommuns.github.io/carte-facile-site/" target="_blank">
                                            Intégrer dans un site en maplibre
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                        <Accordion label="Héberger et diffuser des données sensibles en toute sécurité">
                            <div className={classes.accordionBody}>
                                <img src={hostingSharingThumbUrl} alt="" />
                                <div>
                                    <p className={fr.cx("fr-m-0", "fr-mb-4v")}>
                                        Stockez vos données sensibles ou stratégiques au sein d’une infrastructure souveraine opérée par l’État. Définissez les
                                        droits d’accès, créez des flux privés ou restreints et maîtrisez totalement la diffusion de vos données. Une solution
                                        conçue pour les collectivités, opérateurs publics et services métiers manipulant des données critiques.
                                    </p>
                                    <div className={classes.accordionButtons}>
                                        <Link
                                            className={fr.cx("fr-link")}
                                            href="https://cartes.gouv.fr/aide/fr/guides-producteur/publier-des-donnees-via-cartes-gouv/"
                                            target="_blank"
                                        >
                                            En savoir plus
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                        <Accordion label="Utiliser le plugin QGIS Géoplateforme ">
                            <div className={classes.accordionBody}>
                                <img src={geopfQgisPluginThumbUrl} alt="" />
                                <div>
                                    <p className={fr.cx("fr-m-0", "fr-mb-4v")}>
                                        Accédez facilement aux principales fonctionnalités de la Géoplateforme (accès au catalogue de données, publication de
                                        données, géocodage...) et retrouvez vos données publiées dans votre compte utilisateur sur cartes.gouv.fr.
                                    </p>
                                    <div className={classes.accordionButtons}>
                                        <Link
                                            className={fr.cx("fr-link")}
                                            href="https://github.com/Geoplateforme/plugin-qgis-geoplateforme/blob/main/README.md"
                                            target="_blank"
                                        >
                                            En savoir plus
                                        </Link>
                                        <Link
                                            className={fr.cx("fr-link")}
                                            href="https://plugins.qgis.org/plugins/geoplateforme/"
                                            // target="_blank"
                                        >
                                            Télécharger le plug-in&nbsp;
                                            <span className={fr.cx("fr-icon--sm", "fr-icon-download-fill")} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                    </div>
                </div>
            </section>

            <section className={cx(classes.section, classes.bgOpenBlueFrance)}>
                <h2 className={classes.sectionTitle}>Des services pour tous et au service de tous</h2>

                <div className={classes.tilesWrapper}>
                    <Tile
                        title="De référence"
                        desc={"Des données produites par des organismes publics reconnus."}
                        pictogram={<Success />}
                        classes={{
                            title: classes.tileNoBorder,
                        }}
                        noBorder
                        className={classes.tile}
                    />

                    <Tile
                        title="Souverains"
                        desc={"Des services conçus et opérés par l’État, garantissant indépendance, sécurité et pérennité."}
                        pictogram={<CityHall />}
                        classes={{
                            title: classes.tileNoBorder,
                        }}
                        noBorder
                        className={classes.tile}
                    />

                    <Tile
                        title="Accessibles en ligne"
                        desc={"Des outils utilisables librement et sans installation."}
                        pictogram={<Internet />}
                        classes={{
                            title: classes.tileNoBorder,
                        }}
                        noBorder
                        className={classes.tile}
                    />

                    <Tile
                        title="Ouverts et collaboratifs"
                        desc={"Des données ouvertes et enrichies par la communauté."}
                        pictogram={<Environment />}
                        classes={{
                            title: classes.tileNoBorder,
                        }}
                        noBorder
                        className={classes.tile}
                    />

                    <Tile
                        title="À l’écoute des utilisateurs"
                        desc={"Des évolutions construites avec la communauté d’utilisateurs."}
                        pictogram={<Community />}
                        classes={{
                            title: classes.tileNoBorder,
                        }}
                        noBorder
                        className={classes.tile}
                    />
                </div>
            </section>

            <section className={cx(classes.section, classes.bgGrey)}>
                <h2 className={classes.sectionTitle}>On vous accompagne</h2>

                <div className={cx(fr.cx("fr-grid-row"), classes.featureCardsRow)}>
                    <div className={fr.cx("fr-col")}>
                        <Card
                            title="Des temps forts"
                            border={false}
                            desc={
                                "Inscrivez-vous à nos prochains événements et ateliers pour découvrir les nouveautés, poser vos questions et partager vos cas d’usages."
                            }
                            endDetail={
                                <Link className={fr.cx("fr-link")} {...routes.news_list().link}>
                                    Voir les actualités&nbsp;
                                    <span className={fr.cx("fr-icon-arrow-right-line")} />
                                </Link>
                            }
                        />
                    </div>
                    <div className={fr.cx("fr-col")}>
                        <Card
                            title="Une communauté"
                            border={false}
                            desc={
                                "Rejoignez une communauté d’utilisateurs et de contributeurs pour échanger, partager vos retours et construire ensemble les services de demain. "
                            }
                            endDetail={
                                <Link className={fr.cx("fr-link")} {...routes.join_cartesgouvfr_community().link}>
                                    Rejoindre la communauté&nbsp;
                                    <span className={fr.cx("fr-icon-arrow-right-line")} />
                                </Link>
                            }
                        />
                    </div>
                    <div className={fr.cx("fr-col")}>
                        <Card
                            title="Une aide"
                            border={false}
                            desc={
                                "Accédez à notre centre d’aide à tout moment pour découvrir nos bonnes pratiques, contacter notre support ou participer à nos webinaires en ligne."
                            }
                            endDetail={
                                <Link className={fr.cx("fr-link")} href={externalUrls.help}>
                                    Consulter l’aide&nbsp;
                                    <span className={fr.cx("fr-icon-arrow-right-line")} />
                                </Link>
                            }
                        />
                    </div>
                </div>
            </section>

            <section className={cx(classes.section, classes.createAccountSection, classes.bgActionHighBlueFrance, classes.textInvertedBlueFrance)}>
                <h3 className={classes.sectionTitle}>Créez votre compte pour sauvegarder vos données et vos productions sur cartes.gouv.fr</h3>

                <Button iconId="fr-icon-arrow-right-line" size="large" linkProps={{ href: externalUrls.login }}>
                    Créer mon compte
                </Button>
            </section>
        </Main>
    );
}
