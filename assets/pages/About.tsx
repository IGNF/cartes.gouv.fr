import { fr } from "@codegouvfr/react-dsfr";
import { Card } from "@codegouvfr/react-dsfr/Card";

import AppLayout from "../components/Layout/AppLayout";

const About = () => {
    return (
        <AppLayout documentTitle="A propos de cartes.gouv.fr">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>A propos de cartes.gouv.fr</h1>

                    <h2>Cartes.gouv.fr, le service public des cartes et données du territoire</h2>

                    <p>
                        La carte est un outil de médiation majeur. Par sa capacité inégalée à montrer des phénomènes complexes, parfois peu visibles voire
                        invisibles, elle est la plus efficace des invitations à nous faire agir. Dans le contexte actuel de changements rapides de notre
                        environnement, la carte constitue un guide de lecture indispensable pour permettre à chacun de comprendre ces changements et de se les
                        approprier pour faciliter la prise de décision et le passage à l’action.
                    </p>
                    <p>
                        L’IGN, service public de la cartographie, s’engage pour mettre à disposition de tous, citoyens et acteurs des territoires, les cartes et
                        données qui nourrissent la connaissance, invitent à la réflexion et guident l’action. Le site cartes.gouv.fr porte cette ambition de
                        co-construire et de partager la connaissance du territoire avec l’intention de donner plus de force et de cohérence à la cartographie
                        publique, laquelle tient un rôle de premier plan dans le pilotage des politiques publiques et de la transition écologique. Pour cela, il
                        offrira progressivement à tous un accès centralisé aux géodonnées souveraines et permettra à chacun, en toute autonomie, de créer,
                        héberger, contribuer, partager, visualiser et publier des données et des cartes, accessibles à tous, citoyens comme décideurs.
                    </p>
                    <p>
                        Le site se construit par briques et a vocation à reprendre progressivement les fonctions des sites geoportail.gouv.fr et
                        geoservices.ign.fr ainsi que d’autres services de l’IGN (1). Ainsi, la première interface de cartes.gouv.fr rassemblera début 2024 les
                        premières briques disponibles de catalogage, d’alimentation/diffusion des données. De nouveaux services seront régulièrement ajoutés.
                    </p>

                    <h2>La Géoplateforme comme infrastructure et moteur pour répondre aux besoins des producteurs et des développeurs de services</h2>

                    <p>
                        En parallèle, l’IGN développe la Géoplateforme, une infrastructure ouverte et collaborative pour l’hébergement, le partage, le
                        traitement et la mise en cartographie des géodonnées. Le site cartes.gouv.fr s’appuie sur cette nouvelle plateforme : il en est en
                        quelque sorte la vitrine principale (mais pas exclusive) tout autant qu’un pupitre de commande accessible à tous. Les fonctionnalités de
                        la Géoplateforme peuvent être utilisées sans passer par cartes.gouv.fr.
                    </p>

                    <p>
                        Mise en œuvre par l’IGN avec le soutien du Ministère de la Transition écologique et de la Cohésion des territoires (MTECT) et du Fonds
                        pour la transformation de l’action publique, la Géoplateforme s’inscrit dans la dynamique des géocommuns soutenue par l’institut. En
                        effet, elle constitue en premier lieu un outil commun porté par un ensemble de partenaires, de producteurs et d’usagers de données parmi
                        lesquels le MTECT, le Cerema, le CRIGE PACA, Géobretagne, INERIS, l’OFB, l’ONF ou le Shom.
                    </p>

                    <h2>Les grandes dates clés de la construction de la Géoplateforme</h2>

                    {/* TODO : calendrier */}
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card
                                desc="Premières expérimentations : démonstrateur LiDAR HD, contribution directe à la BD TOPO®, Géotuileur…"
                                title="2021 - 2022"
                                titleAs="h3"
                            />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card
                                desc={
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: "Ouverture des premiers services de la <strong>Géoplateforme</strong> (version bêta) : services de diffusion et de téléchargement, catalogage, chargement/traitement/diffusion vecteur",
                                        }}
                                    />
                                }
                                title="2023"
                                titleAs="h3"
                            />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card
                                desc={
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: "Mise en ligne sur <strong>Cartes.gouv.fr</strong> des fonctionnalités de catalogage et d’alimentation/diffusion des données",
                                        }}
                                    />
                                }
                                title="Début 2024"
                                titleAs="h3"
                            />
                        </div>
                        <div className={fr.cx("fr-col-sm-12", "fr-col-md-4", "fr-col-lg-4")}>
                            <Card
                                desc={
                                    <div
                                        dangerouslySetInnerHTML={{ __html: "Ouverture de la visualisation cartographique sur <strong>Cartes.gouv.fr</strong>" }}
                                    />
                                }
                                title="Courant 2024"
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

                    <em>Mis à jour le 24/10/2023</em>
                </div>
            </div>
        </AppLayout>
    );
};

export default About;
