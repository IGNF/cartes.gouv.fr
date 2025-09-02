import { fr } from "@codegouvfr/react-dsfr";

import { catalogueUrl } from "@/env";
import { appRoot, routes } from "../../router/router";
import Main from "../../components/Layout/Main";

const SiteMap = () => {
    return (
        <Main title="Plan du site">
            <h1>Plan du site</h1>

            <section className={fr.cx("fr-py-6v")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                        <ul>
                            <li>
                                <a href={routes.home().href}>Accueil</a>
                            </li>
                            <li>
                                <span>Commencer avec cartes.gouv</span>
                                <ul>
                                    <li>
                                        <a href={appRoot + "/documentation/"}>Documentation</a>
                                    </li>
                                    <li>
                                        <a {...routes.offer().link}>Offre cartes.gouv.fr/Géoplateforme</a>
                                    </li>
                                    <li>
                                        <a {...routes.join().link}>Nous rejoindre</a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a href={catalogueUrl ?? appRoot + "/catalogue"}>Catalogue</a>
                            </li>
                            <li>
                                <a href={appRoot + "/cartes"}>Cartes</a>
                            </li>
                            <li>
                                <a {...routes.news_list().link}>Actualités</a>
                            </li>
                            <li>
                                <span>Assistance</span>
                                <ul>
                                    <li>
                                        <a {...routes.faq().link}>Questions fréquentes</a>
                                    </li>
                                    <li>
                                        <a {...routes.contact().link}>Nous écrire</a>
                                    </li>
                                    <li>
                                        <a {...routes.service_status().link}>Niveau de service</a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a {...routes.about().link}>A propos</a>
                            </li>
                            <li>
                                <a {...routes.accessibility().link}>Accessibilité</a>
                            </li>
                            <li>
                                <a {...routes.legal_notice().link}>Mentions légales</a>
                            </li>
                            <li>
                                <a {...routes.terms_of_service().link}>Conditions générales d’utilisation</a>
                            </li>
                            <li>
                                <a {...routes.personal_data().link}>Données personnelles</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </Main>
    );
};

export default SiteMap;
