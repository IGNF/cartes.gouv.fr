import Main from "@/components/Layout/Main";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { getLink } from "@codegouvfr/react-dsfr/link";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useEffect } from "react";

import { useAlert } from "@/hooks/useAlert";
import placeholder16x9 from "@/img/placeholder.16x9.png";
import SymfonyRouting from "@/modules/Routing";
import { routes, useRoute } from "@/router/router";
import { useAlertStore } from "@/stores/AlertStore";
import { useAuthStore } from "@/stores/AuthStore";
import classes from "./Discover.module.css";
import { externalUrls } from "@/router/externalUrls";
import FeatureCard from "./FeatureCard";

import illustrationServiceExploreUrl from "@/img/discover/service-explorer.png";
import illustrationServiceSearchUrl from "@/img/discover/service-rechercher.png";
import viewerSvgUrl from "@/img/pictograms/viewer.svg";
import catalogueSvgUrl from "@/img/pictograms/catalogue.svg";
import uploaderSvgUrl from "@/img/pictograms/uploader.svg";
import contributorSvgUrl from "@/img/pictograms/contributor.svg";
import editorSvgUrl from "@/img/pictograms/editor.svg";
import bdOrthoThumbUrl from "@/img/discover/data-card/bd-ortho.png";
import scan25ThumbUrl from "@/img/discover/data-card/scan25.png";
import donneesStatPubThumbUrl from "@/img/discover/data-card/donnees-stats-pub.png";
import foretsPubThumbUrl from "@/img/discover/data-card/forets-pub.svg";
import inpeThumbUrl from "@/img/discover/data-card/inpe.svg";
import rpgThumbUrl from "@/img/discover/data-card/rpg.png";
import pebThumbUrl from "@/img/discover/data-card/peb.png";
import projetsZaerThumbUrl from "@/img/discover/data-card/projets-zaer.svg";
import { useToggle } from "usehooks-ts";
import Accordion from "@codegouvfr/react-dsfr/Accordion";

const dataCards = [
    {
        title: "Prises de vues aériennes (BD ORTHO)",
        organisation: "IGN",
        thumbnailUrl: bdOrthoThumbUrl,
    },
    {
        title: "SCAN 25",
        organisation: "IGN",
        thumbnailUrl: scan25ThumbUrl,
    },
    {
        title: "Données Statistiques Publiques",
        organisation: "INSEE",
        thumbnailUrl: donneesStatPubThumbUrl,
    },
    {
        title: "Forêts Publiques",
        organisation: "ONF",
        thumbnailUrl: foretsPubThumbUrl,
    },
    {
        title: "Inventaire National des Plans d'Eau (INPE)",
        organisation: "IGEDD, IGN, CNES",
        thumbnailUrl: inpeThumbUrl,
    },
    {
        title: "Registre Parcellaire Graphique (RPG)",
        organisation: "IGN",
        thumbnailUrl: rpgThumbUrl,
    },
    {
        title: "Plan d'Exposition au Bruit (PEB)",
        organisation: "DGAC",
        thumbnailUrl: pebThumbUrl,
    },
    {
        title: "Projets de zones d'accélération des énergies renouvelables",
        organisation: "DTT 51",
        thumbnailUrl: projetsZaerThumbUrl,
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

            <div className={cx(fr.cx("fr-container"), classes.heroSection)}>
                <div>
                    <h1>
                        Découvrir
                        <br />
                        <strong>cartes.gouv.fr</strong>
                    </h1>

                    <p>
                        Découvrir cartes.gouv.fr : des cartes, des données, des outils pour explorer, comprendre et approfondir la connaissance du territoire.
                    </p>
                </div>

                <img
                    src={placeholder16x9}
                    alt=""
                    style={{
                        border: "1px solid red",
                    }}
                />
            </div>

            <div className={cx(classes.section, classes.bgGrey)}>
                <div className={cx(classes.featureCardsWrapper)}>
                    <FeatureCard
                        illustration={illustrationServiceExploreUrl}
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
                                <Link className={fr.cx("fr-link")} href={routes.discover().href}>
                                    {"En savoir plus"}
                                </Link>
                                <Button
                                    iconId="fr-icon-arrow-right-s-line"
                                    iconPosition="right"
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
                        illustration={illustrationServiceSearchUrl}
                        illustrationPosition="right"
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
                                <Link className={fr.cx("fr-link")} href={routes.discover().href}>
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
                    <div className={classes.featureCardsRow}>
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
                                    <Link className={fr.cx("fr-link")} href={routes.discover().href}>
                                        {"En savoir plus"}
                                    </Link>
                                    <Button iconId="fr-icon-arrow-right-s-line" iconPosition="right" linkProps={routes.dashboard_pro().link}>
                                        Publier
                                    </Button>
                                </>
                            }
                        />
                        <FeatureCard
                            picto={contributorSvgUrl}
                            title="Collaborer sur des données"
                            desc={
                                <>
                                    <strong>Créez des signalements, enrichissez des bases de données</strong>&nbsp;et animez vos communautés de contributeurs.
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

            <div className={classes.section}>
                <h2
                    style={{
                        textAlign: "center",
                    }}
                >
                    Des données utiles, fiables et souveraines sur l’ensemble du territoire
                </h2>

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
                                linkProps={{ href: externalUrls.catalogue }}
                                enlargeLink
                                grey
                                shadow
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
        </Main>
    );
}
