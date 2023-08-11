import { fr } from "@codegouvfr/react-dsfr";

import { useEffect } from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

import { routes } from "../../router/router";

const Accessibility = () => {
    const siteName = "cartes.gouv.fr";

    useEffect(() => {
        document.title = "Accessibilité | cartes.gouv.fr";
    }, []);

    return (
        <AppLayout navItems={defaultNavItems}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8", "fr-py-12v")}>
                    <h1>Accessibilité&nbsp;: partiellement conforme</h1>

                    <h2>État de conformité</h2>

                    <p>
                        Le site {siteName} est partiellement conforme avec le référentiel général d’amélioration de l’accessibilité (RGAA), version 4.1 en
                        raison des non-conformités et des dérogations énumérées ci-dessous.
                    </p>

                    <h2>Résultats des tests</h2>

                    <p>L’audit de conformité réalisé par Maroua OURI (CHEZ SMILE) révèle que&nbsp;:</p>

                    <ul>
                        <li>75% des critères du RGAA version 4.1 sont respectés</li>
                    </ul>

                    <h2>Contenus non accessibles</h2>

                    <h3>Non-conformités</h3>

                    <ul>
                        <li>
                            De nombreuses anomalies vont pénaliser les utilisateurs en situation de handicap, naviguant ou non à l’aide de technologies
                            d’assistance.
                        </li>
                        <li>
                            Les non-conformités les plus bloquantes pour les utilisateurs concernent&nbsp;:
                            <ul>
                                <li>Certaines images de décoration ne sont pas correctement ignorées par les outils d’assistance.</li>
                                <li>Alternative textuelle pas pertinente pour l’image porteuse d’information.</li>
                                <li>Élément graphique n’est pas relié à sa définition dans la page.</li>
                                <li>Le code source généré est non valide.</li>
                                <li>Certaines balises sont utilisées à des fins de présentation.</li>
                                <li>Des contenus avec une structuration (titres et intertitres) incorrecte.</li>
                                <li>Quand le css est désactivé le contenu n’est pas totalement pertinent.</li>
                                <li>A 320px de largeur, un scrolle horizontal s’affiche sur un contenu.</li>
                                <li>L’indication des champs obligatoires n’est pas mise en place.</li>
                                <li>Aide à la saisie sur un champ qui nécessite un format particulier n’est pas mis en place.</li>
                                <li>Attribut auto-complétion manquant sur les champs de saisie personnels.</li>
                                <li>Lien d’accès rapide manquant sur tout le site.</li>
                            </ul>
                        </li>
                    </ul>

                    <h3>Établissement de cette déclaration d’accessibilité</h3>

                    <p>Cette déclaration a été établie le 03/08/2023</p>

                    <h3>Technologies utilisées pour la réalisation de {siteName}</h3>

                    <ul>
                        <li>HTML5</li>
                        <li>CSS</li>
                        <li>Javascript</li>
                        <li>React</li>
                    </ul>

                    <h3>Environnement de test</h3>

                    <p>
                        Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA
                        4.1, avec les versions suivantes&nbsp;:
                    </p>

                    <ul>
                        <li>Agent utilisateur&nbsp;: Firefox</li>
                        <li>Technologie d’assistance&nbsp;: NVDA</li>
                    </ul>

                    <h3>Outils pour évaluer l’accessibilité</h3>

                    <ul>
                        <li>Wave</li>
                        <li>WCAG color contrast checker</li>
                        <li>Headings maps</li>
                        <li>Stylus</li>
                        <li>web développer toolbar</li>
                        <li>Inspecteur du navigateur </li>
                        <li>Validateur en ligne du W3C</li>
                    </ul>

                    <h3>Pages du site ayant fait l’objet de la vérification de conformité</h3>

                    <ol>
                        <li>Accueil</li>
                        <li>Mentions légales</li>
                        <li>Faq</li>
                        <li>Plan du site</li>
                        <li>A propos</li>
                        <li>Détail actualité</li>
                        <li>Actualités</li>
                        <li>Contact</li>
                        <li>Accessibilité</li>
                    </ol>

                    <h2>Retour d’information et contact</h2>

                    <p>
                        Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable de {siteName} pour être orienté vers
                        une alternative accessible ou obtenir le contenu sous une autre forme.
                    </p>

                    <ul>
                        <li>
                            Envoyer un message par le biais du <a href={routes.contact().href}>formulaire de contact en ligne</a>
                        </li>
                        <li>
                            ou contacter l’IGN par courrier ou par téléphone&nbsp;:
                            <br />
                            Institut national de l’information géographique et forestière
                            <br />
                            73 avenue de Paris
                            <br />
                            94165 Saint-Mandé Cedex
                            <br />
                            Tél. : 01 43 98 80 00
                        </li>
                    </ul>

                    <h2>Voies de recours</h2>

                    <p>Cette procédure est à utiliser dans le cas suivant.</p>

                    <p>
                        Vous avez signalé au responsable du site internet un défaut d’accessibilité qui vous empêche d’accéder à un contenu ou à un des services
                        du portail et vous n’avez pas obtenu de réponse satisfaisante.
                    </p>

                    <ul>
                        <li>
                            Écrire un message au Défenseur des droits&nbsp;:{" "}
                            <a
                                href="https://formulaire.defenseurdesdroits.fr/"
                                target="_blank"
                                title="Saisir le Défenseur des droits - ouvre une nouvelle fenêtre"
                                rel="noreferrer"
                            >
                                formulaire.defenseurdesdroits.fr/
                            </a>
                        </li>
                        <li>
                            Contacter le délégué du Défenseur des droits dans votre région&nbsp;:{" "}
                            <a
                                href="https://www.defenseurdesdroits.fr/saisir/delegues"
                                target="_blank"
                                title="Trouver un délégué du Défenseur des droits - ouvre une nouvelle fenêtre"
                                rel="noreferrer"
                            >
                                www.defenseurdesdroits.fr/saisir/delegues
                            </a>
                        </li>
                        <li>
                            Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)&nbsp;:
                            <br />
                            Défenseur des droits
                            <br />
                            Libre réponse 71120
                            <br />
                            75342 Paris CEDEX 07
                        </li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
};

export default Accessibility;
