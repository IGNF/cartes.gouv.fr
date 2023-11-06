import { fr } from "@codegouvfr/react-dsfr";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";

import AppLayout from "../components/Layout/AppLayout";

const Faq = () => {
    return (
        <AppLayout documentTitle="Questions fréquentes">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Questions fréquentes</h1>

                    <div className={fr.cx("fr-accordions-group")}>
                        <Accordion label="Qu’est-ce que cartes.gouv.fr&nbsp;?" titleAs="h2">
                            <p>
                                Cartes.gouv.fr est le service public des cartes et données du territoire. Prochainement, cartes.gouv.fr offrira à tous les bases
                                de données et les outils utiles pour se saisir de ces opportunités : collectivités territoriales, acteurs publics, entreprises,
                                associations, citoyens…
                            </p>
                            <p>
                                Le site contiendra d’abord des cartes et données publiques librement accessibles sur de nombreux thèmes (topographie, écologie,
                                sécurité, foncier, réglementations…). Il proposera aussi des services qui vont s’enrichir pour permettre à chacun de créer,
                                héberger, contribuer, partager, visualiser et publier des données et des cartes en autonomie.
                            </p>
                        </Accordion>
                        <Accordion label="Qui est derrière carte.gouv.fr&nbsp;?" titleAs="h2">
                            <p>
                                Cartes.gouv.fr s’appuie sur une nouvelle infrastructure ouverte et collaborative, la Géoplateforme, soutenue par le Ministère de
                                la Transition écologique et de la Cohésion des territoires ainsi que par le Fonds de transformation de l’action publique.
                            </p>
                            <p>
                                Mises en œuvre par l’IGN , la Géoplateforme et cartes.gouv.fr s’inscrivent pleinement dans la dynamique des géocommuns soutenue
                                par l’institut. En effet, cartes.gouv.fr se veut en premier lieu un outil commun porté par un ensemble de partenaires, de
                                producteurs et d’usagers de données parmi lesquels aujourd’hui le ministère de la transition écologique et de la cohésion des
                                territoires, le Cerema, le CRIGE PACA, Géobretagne, INERIS, l’OFB, l’ONF ou le Shom.
                            </p>
                        </Accordion>
                        <Accordion label="Que deviendront le Géoportail et les Géoservices de l’IGN&nbsp;?" titleAs="h2">
                            <p>
                                Cartes.gouv.fr reprendra dans un premier temps les fonctions des sites Géoservices puis Géoportail ainsi que des premiers outils
                                pour la gestion des données par les acteurs publics.
                            </p>
                            <p>Il s’enrichira progressivement de fonctionnalités nouvelles au bénéfice de tous.</p>
                        </Accordion>
                        <Accordion label="Quand les prochains services arriveront-ils&nbsp;?" titleAs="h2">
                            <p>
                                Cartes.gouv.fr s’enrichira au fur et à mesure des contributions de l’IGN et de ses partenaires. Début 2024 arriveront les
                                premières fonctionnalités telles que le catalogue des données et services ainsi que le chargement et diffusion des données par
                                les producteurs en toute autonomie.
                            </p>
                        </Accordion>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Faq;
