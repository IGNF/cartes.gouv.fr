import { fr } from "@codegouvfr/react-dsfr";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";

const About = () => {
    return (
        <AppLayout navItems={defaultNavItems} documentTitle="La Géoplateforme en bref">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>La Géoplateforme en bref</h1>

                    <p>
                        Nouvel espace public de l’information géographique, la Géoplateforme a pour objectif d’optimiser la production et la diffusion des
                        géodatas au service de la décision publique.
                    </p>
                    <p>
                        La société connaît une révolution de la donnée géographique qui impose à l’État de se transformer. Le développement des usages
                        numériques dans lesquels l’information géolocalisée est omniprésente se traduit par une mutation des pratiques des professionnels et des
                        citoyens ainsi que par un accroissement des besoins en données. La large mise à disposition des données géographiques offre de nouvelles
                        façons de penser les cartes et doit encourager de nouveaux usages répondant à des besoins publics.
                    </p>
                    <p>
                        Dans ce contexte, le programme Géoplateforme vise à doter la puissance publique d’une{" "}
                        <strong>infrastructure collaborative et mutualisée pour la production et la diffusion des géodonnées</strong>. Son ambition est de
                        permettre aux porteurs de politiques publiques et aux collectivités locales qui le souhaitent de bénéficier très simplement de
                        fonctionnalités avancées pour diffuser leurs propres données et s’ouvrir à des communautés contributives. Cet espace,{" "}
                        <strong>
                            composante géographique de l’État-plateforme{" "}
                            <a
                                href="https://www.numerique.gouv.fr/publications/panorama-grands-projets-si/"
                                target="_blank"
                                title="Panorama des grands projets numériques de l’État - ouvre une nouvelle fenêtre"
                                rel="noreferrer"
                            >
                                reconnue grand projet numérique de l’État
                            </a>
                        </strong>
                        , répond notamment aux enjeux de souveraineté des données de l’État face aux géants de l’Internet.
                    </p>
                    <p>
                        La Géoplateforme s’inscrit pleinement dans la <strong>dynamique des géo-communs</strong> soutenue par l’IGN. En effet, si l’institut a
                        bien vocation à porter ses propres services sur la Géoplateforme, celle-ci se veut en premier lieu un outil commun au monde public.
                        C’est la mobilisation progressive de partenaires, producteurs et usagers de données géographiques qui doit permettre d’atteindre cet
                        objectif.
                    </p>

                    <h2>Enjeux</h2>

                    <ul>
                        <li>
                            <strong>Bâtir une plateforme ouverte et mutualisée</strong> dédiée à l’information géographique et contribuant au déploiement de
                            l’État-plateforme,
                        </li>
                        <li>
                            <strong>Organiser le dispositif collaboratif</strong> pour l’entretien et l’enrichissement de la donnée géographique au sein de la
                            sphère publique,
                        </li>
                        <li>
                            <strong>Constituer un écosystème d’usagers&nbsp;;</strong> outiller, soutenir et connecter les communautés existantes,
                        </li>
                        <li>
                            <strong>Proposer une nouvelle infrastructure robuste</strong> assurant la reprise des services existants de l’IGN et de ses
                            partenaires&nbsp;; optimiser le parcours d’accès à ces ressources et offrir des fonctionnalités complémentaires.
                        </li>
                    </ul>

                    <h2>Objectifs</h2>

                    <h3>Accessibilité aux données</h3>

                    <p>
                        La Géoplateforme mettra à disposition un panel très large de jeux de données géographiques et de services accessibles à tous. Les
                        données de cette plateforme seront ouvertes et la plus grande interopérabilité possible sera recherchée avec les systèmes existants
                        (référencés sur le portail de diffusion de la Géoplateforme).
                    </p>
                    <p>
                        Les utilisateurs pourront facilement mettre à jour des données, rechercher des services et des jeux de données grâce à des critères
                        simples et les utiliser pour leurs propres besoins de diffusion.
                    </p>

                    <h3>Mutualisation des infrastructures</h3>

                    <p>
                        La Géoplateforme pourra héberger les données géographiques produites et co-produites par l’ensemble des partenaires. Cette
                        infrastructure sécurisée et évolutive permettra aux parties prenantes de partager et de déployer des solutions à grande échelle en
                        répondant à leurs exigences de capacité, de fiabilité ou de performance.
                    </p>

                    <h2>Briques fonctionnelles</h2>

                    <p>Pour atteindre ses ambitions, la Géoplateforme s’articule autour de cinq principales briques fonctionnelles&nbsp;:</p>

                    <ul>
                        <li>
                            <strong>Des services&nbsp;:</strong>
                            <br />
                            Pouvoir rechercher, charger, valider, traiter et diffuser ses données en autonomie
                        </li>
                        <li>
                            <strong>Des fonctions collaboratives&nbsp;:</strong>
                            <br />
                            Coproduire et modifier des jeux de données en autonomie tout en améliorant collectivement la qualité de l’ensemble des données
                        </li>
                        <li>
                            <strong>La gestion de communautés&nbsp;:</strong>
                            <br />
                            Fédérer des communautés d’utilisateurs et favoriser la création de nouveaux portails thématiques
                        </li>
                        <li>
                            <strong>La gestion des accès et habilitations&nbsp;:</strong>
                            <br />
                            Attribuer les droits d’accès et d’habilitations sur la Géoplateforme et ses ressources (jeux de données…)
                        </li>
                        <li>
                            <strong>Le support&nbsp;:</strong>
                            <br />
                            Bénéficier d’un appui sur l’utilisation de la Géoplateforme
                        </li>
                    </ul>

                    <h2>Calendrier</h2>

                    <ul>
                        <li>
                            <strong>2021 - 2024&nbsp;:</strong>
                            <br />
                            Mobilisation d’une communauté de partenaires et mise en place progressive d’une gouvernance ouverte
                        </li>
                        <li>
                            <strong>2021&nbsp;:</strong>
                            <br />
                            <a
                                href="https://www.ign.fr/geoplateforme/experimente"
                                target="_blank"
                                title="Expérimentations des premières fonctionnalité - ouvre une nouvelle fenêtre"
                                rel="noreferrer"
                            >
                                Expérimentations de premières fonctionnalités
                            </a>
                            <br />
                            Contractualisation de l’hébergement du socle technique de la Géoplateforme
                            <br />
                            <a
                                href="https://www.ign.fr/espace-presse/lign-finalise-son-choix-de-partenaires-techniques-pour-la-geoplateforme"
                                target="_blank"
                                title="L’IGN finalise son choix de partenaires techniques pour le développement et l’exploitation de la Géoplateforme - ouvre une nouvelle fenêtre"
                                rel="noreferrer"
                            >
                                Passation du marché de construction, d’infogérance et de maintenance de la Géoplateforme
                            </a>
                        </li>
                        <li>
                            <strong>2022&nbsp;:</strong>
                            <br />
                            <a
                                href="https://www.ign.fr/geoplateforme/experimente"
                                target="_blank"
                                title="Expérimentations de nouvelles fonctionnalités - ouvre une nouvelle fenêtre"
                                rel="noreferrer"
                            >
                                Expérimentations de nouvelles fonctionnalités
                            </a>
                            <br />
                            <a
                                href="https://www.ign.fr/geoplateforme/construire-le-socle-de-la-geoplateforme"
                                target="_blank"
                                title="Mise en place du socle technique - ouvre une nouvelle fenêtre"
                                rel="noreferrer"
                            >
                                Mise en place du socle technique
                            </a>{" "}
                            et des premiers services permettant de gérer le cycle de vie de la donnée (chargement, mise à jour, diffusion)
                        </li>
                        <li>
                            <strong>2023 - 2024&nbsp;:</strong>
                            <br />
                            Développement de services et applicatifs&nbsp;: services collaboratifs, communautés, traitements, ouverture des services aux
                            partenaires
                        </li>
                    </ul>

                    <em>Mis à jour le 13/04/2023</em>
                </div>
            </div>
        </AppLayout>
    );
};

export default About;
