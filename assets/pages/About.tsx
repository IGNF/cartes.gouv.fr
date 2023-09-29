import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Card } from "@codegouvfr/react-dsfr/Card";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";

const About = () => {
    return (
        <AppLayout navItems={defaultNavItems} documentTitle="A propos de cartes.gouv.fr">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>A propos de cartes.gouv.fr</h1>

                    <h2>Cartes.gouv.fr, le nouveau portail national de l’information géographique et de la connaissance des territoires</h2>

                    <p>
                        Face aux enjeux contemporains, la carte est un outil de médiation majeur. Le service public de la cartographie, pour révéler ce
                        potentiel, doit s’engager à mettre à disposition de tous, citoyens et acteurs des territoires, les cartes et applications qui
                        nourrissent la réflexion et guident l’action.
                    </p>
                    <p>
                        Le site cartes.gouv.fr lancé à l’automne 2023 porte cette ambition. Il offrira progressivement un accès centralisé aux géodonnées
                        souveraines et aux fonctionnalités de référence pour visualiser, créer, héberger, enrichir ou diffuser des données et des services
                        géographiques.
                    </p>

                    <h2>Co-construire la connaissance et les usages cartographiques de demain</h2>

                    <p>
                        Avec cartes.gouv.fr s’expriment les volontés de faire vivre les données géographiques, de co-construire et de partager la connaissance
                        du territoire avec l’intention de donner plus de force et de cohérence à la cartographie publique, laquelle tient un rôle de premier
                        plan dans le pilotage des politiques publiques et de la transition écologique.
                    </p>
                    <p>
                        Cartes.gouv.fr offre la possibilité de diffuser et de mettre à jour ses géodonnées en autonomie, d’effectuer des traitements ou des
                        croisements afin d’en extraire de nouvelles données à valeur ajoutée, mais également de les mettre en cartographie afin de les partager
                        à tous, citoyens comme décideurs.
                    </p>
                    <p>
                        Le site se construit par briques. Pour offrir au plus tôt l’accès aux services, l’IGN a fait le choix de développer cartes.gouv.fr de
                        manière évolutive. Ainsi, la première interface de cartes.gouv.fr rendue accessible en octobre 2023 rassemble les premières briques
                        disponibles (catalogage, alimentation/diffusion des données) et de nouveaux services sont régulièrement ajoutés.
                    </p>

                    <h2>La Géoplateforme comme infrastructure et moteur pour répondre aux besoins des producteurs et des développeurs de services</h2>

                    <p>
                        En parallèle, l’IGN développe une infrastructure, la Géoplateforme, ouverte et mutualisée pour l’hébergement, le partage, le traitement
                        et la mise en cartographie des géodonnées. Le site cartes.gouv.fr s’appuie sur cette nouvelle plateforme&nbsp;: il en est en quelque
                        sorte la vitrine principale (mais pas exclusive) tout autant qu’un pupitre de commande accessible à tous.
                    </p>

                    <p>
                        En effet, cartes.gouv.fr a vocation à remplacer progressivement les sites geoportail.gouv.fr et geoservices.ign.fr ainsi que d’autres
                        services de l’IGN <a href="#footnote1">(1)</a> couramment utilisés par des publics variés avec l’objectif d’en élargir significativement
                        les cibles respectives. De son côté, l’infrastructure Géoplateforme offre déjà et continuera à déployer des outils et fonctionnalités
                        permettant de mobiliser, de valoriser des données (notamment ici sur cartes.gouv.fr) et de développer facilement des services utiles et
                        performants aux usagers. Il est à noter que ses fonctionnalités peuvent être utilisées sans passer par cartes.gouv.fr.
                    </p>

                    <p>
                        Mise en œuvre par l’IGN avec le soutien du Fonds pour la transformation de l’action publique, la Géoplateforme s’inscrit pleinement dans
                        la <strong>dynamique des géocommuns</strong> soutenue par l’institut. En effet, la Géoplateforme se veut en premier lieu un outil commun
                        porté par un ensemble de partenaires, de producteurs et d’usagers de données parmi lesquels le ministère de la transition écologique et
                        de la cohésion des territoires, le Cerema, le CRIGE PACA, Géobretagne, INERIS, l’OFB, l’ONF ou le Shom.
                    </p>

                    <h2>Les grandes dates clés de la construction de la Géoplateforme</h2>

                    {/* TODO : calendrier */}
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card desc="Lancement du programme Géoplateforme" title="2019" titleAs="h3" />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card desc="Audit DINUM du Géoportail, module API Carto « Nature »" title="2020" titleAs="h3" />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card
                                desc="Premières expérimentations : démonstrateur LiDAR HD, contribution directe à la BD TOPO®, Géotuileur…"
                                title="2021 - 2022"
                                titleAs="h3"
                            />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card
                                desc="Ouverture des premiers services de la Géoplateforme (version bêta) : services de diffusion et de téléchargement, catalogage, chargement/traitement/diffusion vecteur."
                                title="2023"
                                titleAs="h3"
                            />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card desc="Lancement du site cartes.gouv.fr" title="2023" titleAs="h3" />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card
                                start={
                                    <div className={fr.cx("fr-badges-group")}>
                                        <Badge>Bientôt</Badge>
                                    </div>
                                }
                                desc="Ouverture de la visualisation cartographique sur cartes.gouv.fr"
                                title="2024"
                                titleAs="h3"
                            />
                        </div>
                    </div>

                    <p>
                        En savoir plus&nbsp;:{" "}
                        <a
                            href="https://www.ign.fr/geoplateforme/la-geoplateforme-en-bref"
                            target="_blank"
                            title="La Géoplateforme en bref - ouvre une nouvelle fenêtre"
                            rel="noreferrer"
                        >
                            https://www.ign.fr/geoplateforme/la-geoplateforme-en-bref
                        </a>
                    </p>

                    <p id="footnote1">
                        (1) Dont{" "}
                        <a
                            href="https://espacecollaboratif.ign.fr"
                            target="_blank"
                            title="espacecollaboratif.ign.fr - ouvre une nouvelle fenêtre"
                            rel="noreferrer"
                        >
                            espacecollaboratif.ign.fr
                        </a>{" "}
                        et{" "}
                        <a href="https://macarte.ign.fr" target="_blank" title="macarte.ign.fr - ouvre une nouvelle fenêtre" rel="noreferrer">
                            macarte.ign.fr
                        </a>
                        .
                    </p>

                    <em>Mis à jour le 13/09/2023</em>
                </div>
            </div>
        </AppLayout>
    );
};

export default About;
