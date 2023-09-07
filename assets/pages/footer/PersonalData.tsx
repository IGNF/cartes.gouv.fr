import { fr } from "@codegouvfr/react-dsfr";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

const PersonalData = () => {
    return (
        <AppLayout navItems={defaultNavItems} documentTitle="Données à caractère personnel">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Données à caractère personnel</h1>

                    <h2>Inscriptions aux événements</h2>

                    <p>
                        L’inscription aux événements (physique ou en ligne) sur le site cartes.gouv.fr donne lieu à la collecte, au stockage et au traitement de
                        données à caractère personnel par l’organisateur de cet événement, responsable de traitement.
                    </p>
                    <p>
                        Pour tous les évènements organisés par l’IGN, nous vous invitons à consulter le site&nbsp;:{" "}
                        <a
                            href="https://www.ign.fr/institut/donnees-caractere-personnel"
                            target="_blank"
                            title="L’IGN protège vos données personnelles - ouvre une nouvelle fenêtre"
                            rel="noreferrer"
                        >
                            L’IGN protège vos données personnelles - Institut - IGN
                        </a>
                    </p>
                    <p>
                        Pour les évènements organisés par les partenaires, nous vous invitons à consulter la page relative aux données personnelles directement
                        sur le site du partenaire organisateur de cet événement.
                    </p>

                    <h2>Création d’un compte personnel</h2>

                    <p>
                        Le site cartes.gouv.fr offre aux utilisateurs la possibilité de créer un compte personnel pour accéder à des fonctions particulières et
                        à des capacités de stockage de ses contenus.
                    </p>
                    <p>
                        Les données à caractère personnel sur l’utilisateur sont recueillies par l’IGN et font l’objet d’un traitement informatique ayant pour
                        seule fonction la gestion du compte des utilisateurs et la gestion et l’amélioration de la plateforme, à l’exclusion de toute
                        exploitation commerciale.
                    </p>

                    <h3>Quels sont les objectifs du recueil de ces données&nbsp;?</h3>

                    <ul>
                        <li>Identification d’un utilisateur</li>
                        <li>Gestion du compte utilisateur</li>
                        <li>Gestion du fonctionnement du service, de ses améliorations et évolutions</li>
                        <li>
                            Communication avec les utilisateurs sur les produits et services IGN, notamment dans le cadre de la gestion et de l’animation des
                            communautés
                        </li>
                        <li>Production de statistiques sur l’utilisation du service</li>
                    </ul>

                    <h3>
                        Quelles sont les données personnelles collectées <a href="#footnote1">(i)</a>&nbsp;?
                    </h3>

                    <ul>
                        <li>
                            <strong>Nom d’utilisateur</strong>
                        </li>
                        <li>
                            <strong>Adresse mail</strong>
                        </li>
                    </ul>
                    <p>
                        L’utilisateur peut, à sa seule discrétion, communiquer d’autres données personnelles qui seront utilisées pour les communications avec
                        les utilisateurs, notamment dans le cadre de la gestion et de l’animation des communautés, à savoir&nbsp;:
                    </p>
                    <ul>
                        <li>Nom</li>
                        <li>Prénom</li>
                        <li>Photo de profil</li>
                        <li>Numéro de téléphone</li>
                        <li>Adresse postale</li>
                        <li>Catégorie professionnel/particulier</li>
                        <li>Organisme</li>
                        <li>Fonction</li>
                    </ul>

                    <h3>Quelle est la base juridique du traitement&nbsp;?</h3>

                    <p>Contrat</p>

                    <h3>Qui pourra en prendre connaissance&nbsp;?</h3>

                    <p>Agents de l’IGN et prestataire</p>

                    <h3>Quelle est la durée de conservation des données&nbsp;?</h3>

                    <p>2 ans à compter de la date de dernière connexion ou de la suppression deu compte personnel ou du service</p>

                    <h2>Prise de contact via le formulaire de contact</h2>

                    <p>
                        La prise de contact via le formulaire de contact donne lieu à la collecte, au stockage et au traitement de données à caractère personnel
                        par l’IGN, responsable de traitement. Pour toutes les demandes concernant les partenaires, IGN renvoie vers les partenaires. Les
                        traitements sont référencés ci-dessous&nbsp;:
                    </p>

                    <h3>Quels sont les objectifs du recueil de ces données (finalités)&nbsp;?</h3>

                    <ul>
                        <li>Gestion de la demande de l’utilisateur</li>
                        <li>Gestion des suites données à la demande de l’utilisateur</li>
                        <li>Gestion du fonctionnement du service, de ses améliorations et évolutions</li>
                        <li>Communication avec les utilisateurs aux fins d’amélioration et d’évolution du service</li>
                        <li>Production de statistiques sur l’utilisation du service</li>
                    </ul>

                    <h3>
                        Quelles sont les données personnelles collectées <a href="#footnote1">(i)</a>&nbsp;?
                    </h3>
                    <ul>
                        <li>
                            <strong>Adresse courriel</strong>
                        </li>
                        <li>Nom</li>
                        <li>Prénom</li>
                        <li>Organisme</li>
                    </ul>

                    <h3>Quelle est la base juridique du traitement&nbsp;?</h3>

                    <p>Consentement</p>

                    <h3>Qui pourra prendre en connaissance (destinataires)&nbsp;?</h3>

                    <p>IGN et le cas échéant les partenaires</p>

                    <h3>Quelle est la durée de conservation des données&nbsp;?</h3>

                    <p>La durée de conservation des données à caractère personnel est fixée par l’IGN à trois ans à compter de la dernière sollicitation</p>

                    <h2>Participation à une enquête utilisateur</h2>

                    <p>
                        La participation à une enquête utilisateur donne lieu à la collecte, au stockage et au traitement de données à caractère personnel par
                        l’IGN, responsable de traitement. Les traitements sont référencés ci-dessous&nbsp;:
                    </p>

                    <h3>Quels sont les objectifs du recueil de ces données (finalités)&nbsp;?</h3>

                    <ul>
                        <li>Organisation d’une enquête utilisateur IGN</li>
                        <li>
                            Communication avec les utilisateurs aux fins de participer à de nouvelles enquêtes, d’évaluer le service ou de proposer des
                            améliorations
                        </li>
                        <li>Evaluation qualité et production de statistiques relatives aux enquêtes</li>
                    </ul>

                    <h3>
                        Quelles sont les données personnelles collectées <a href="#footnote1">(i)</a>&nbsp;?
                    </h3>
                    <ul>
                        <li>
                            <strong>Secteur d’activité</strong>
                        </li>
                        <li>
                            <strong>Tranche d’âge</strong>
                        </li>
                        <li>
                            <strong>Département de résidence</strong>
                        </li>
                        <li>Sexe</li>
                        <li>Adresse mail</li>
                    </ul>

                    <h3>Quelle est la base juridique du traitement&nbsp;?</h3>

                    <p>Consentement</p>

                    <h3>Qui pourra prendre en connaissance (destinataires)&nbsp;?</h3>

                    <p>IGN et sous-traitant pour l’organisation de l’enquête utilisateur IGN</p>

                    <h3>Quelle est la durée de conservation des données&nbsp;?</h3>

                    <p>La durée de conservation des données est fixée à 5 ans à compter de la date de participation à une enquête utilisateur.</p>

                    <h2>Inscription aux communautés d’utilisateurs</h2>

                    <p>
                        L’inscription aux communautés d’utilisateurs IGN donne lieu à la collecte, au stockage et au traitement de données à caractère personnel
                        par l’IGN, responsable de traitement. Les traitements sont référencés ci-dessous&nbsp;:
                    </p>

                    <h3>Quels sont les objectifs du recueil de ces données (finalités)&nbsp;?</h3>

                    <ul>
                        <li>Animation des communautés d’utilisateurs IGN</li>
                        <li>Gestion du fonctionnement des communautés d’utilisateurs IGN</li>
                        <li>
                            Communication avec les utilisateurs aux fins de participer à des enquêtes, d’évaluer le service ou de proposer des améliorations
                        </li>
                        <li>Evaluation qualité et production de statistiques relatives aux communautés</li>
                    </ul>

                    <h3>
                        Quelles sont les données personnelles collectées <a href="#footnote1">(i)</a>&nbsp;?
                    </h3>
                    <ul>
                        <li>
                            <strong>Nom</strong>
                        </li>
                        <li>
                            <strong>Prénom</strong>
                        </li>
                        <li>
                            <strong>Code postal</strong>
                        </li>
                        <li>
                            <strong>Adresse courriel professionnelle, universitaire ou personnelle</strong>
                        </li>
                        <li>
                            <strong>Organisme</strong>
                        </li>
                        <li>
                            <strong>Secteur d’activité</strong>
                        </li>
                        <li>
                            <strong>Fonction</strong>
                        </li>
                    </ul>

                    <h3>Quelle est la base juridique du traitement&nbsp;?</h3>

                    <p>Consentement</p>

                    <h3>Qui pourra prendre en connaissance (destinataires)&nbsp;?</h3>

                    <p>IGN et, le cas échéant, sous-traitant assistant l’IGN dans la gestion des communautés.</p>

                    <h3>Quelle est la durée de conservation des données&nbsp;?</h3>

                    <p>Les données à caractère personnel sont conservées jusqu’à la désinscription ou suppression de la communauté.</p>

                    <p id="footnote1">
                        (i) Les données en gras correspondent aux données nécessaires au fonctionnement du service. En cas de non fourniture d’une de ces
                        données, l’utilisateur ne peut accéder au service proposé.
                    </p>
                    <p>
                        Les services proposés (création d’un compte personnel, prise de contact via le formulaire de contact, participation à une enquête
                        utilisateur, inscription à une communautés d’utilisateurs) sont exclusivement réservés aux personnes âgées d’au moins 15 ans.
                    </p>
                    <p>
                        Conformément à la législation en vigueur relative à l’informatique, aux fichiers et aux libertés, l’utilisateur dispose d’un droit
                        d’accès, de rectification et d’effacement des données à caractère personnel le concernant. Il bénéficie, en outre, de la possibilité de
                        limiter ou de s’opposer au traitement qui le concerne. Il dispose, de plus, du droit à la portabilité des données à caractère personnel
                        le concernant. Il peut, enfin, définir les directives relatives au sort des données à caractère personnel le concernant après son décès.
                    </p>
                    <p>Lorsque le traitement est fondé sur le consentement, l’utilisateur a le droit de retirer son consentement à tout moment.</p>
                    <p>
                        L’exercice de ces droits peut se faire par courriel à l’adresse dpo@ign.fr ou à l’adresse postale suivante&nbsp;:
                        <br />
                    </p>
                    <p>
                        Institut national de l’information géographique et forestière
                        <br />
                        Délégué à la protection des données (Dpo)
                        <br />
                        73 avenue de Paris
                        <br />
                        94165 SAINT-MANDE Cedex.
                    </p>
                    <p>Le cas échéant, l’utilisateur peut introduire une réclamation auprès de la CNIL.</p>
                    <p>
                        <em>
                            A noter que cette page sera enrichie avec la mise en ligne de la future entrée cartographique qui remplacera le Géoportail&nbsp;:
                            outil de signalement d’anomalie sur les contenus.
                        </em>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
};

export default PersonalData;
