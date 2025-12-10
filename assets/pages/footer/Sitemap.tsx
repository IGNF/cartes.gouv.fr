import { fr } from "@codegouvfr/react-dsfr";

import { externalUrls } from "@/router/externalUrls";
import Main from "../../components/Layout/Main";
import { routes } from "../../router/router";

const SiteMap = () => {
    return (
        <Main title="Plan du site">
            <h1>Plan du site</h1>

            <section className={fr.cx("fr-py-6v")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                        <ul>
                            <li>
                                <a href={externalUrls.maps}>Explorer les cartes</a>
                            </li>
                            <li>
                                <a href={externalUrls.catalogue}>Rechercher une donnée</a>
                            </li>
                            <li>
                                <a {...routes.discover().link}>Découvrir cartes.gouv.fr</a>
                            </li>
                            <li>
                                <span>Services</span>
                                <ul>
                                    <li>
                                        <a {...routes.present_service_maps().link}>Description du service Explorer les cartes</a>
                                    </li>
                                    <li>
                                        <a {...routes.present_service_catalogue().link}>Description du service Rechercher une donnée</a>
                                    </li>
                                    <li>
                                        <a {...routes.present_service_publish().link}>Description du service Publier une donnée</a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a {...routes.offer().link}>Offres</a>
                            </li>
                            <li>
                                <a {...routes.news_list().link}>Actualités</a>
                            </li>
                            <li>
                                <a {...routes.join_cartesgouvfr_community().link}>Communautés</a>
                            </li>
                            <li>
                                <a {...routes.service_status().link}>Niveau de service</a>
                            </li>
                            <li>
                                <span>Mon espace</span>
                                <ul>
                                    <li>
                                        <a {...routes.dashboard().link}>Tableau de bord</a>
                                    </li>
                                    <li>
                                        <a {...routes.my_account().link}>Mon compte</a>
                                    </li>
                                    <li>
                                        <a {...routes.my_access_keys().link}>Mes clés d’accès</a>
                                    </li>
                                    <li>
                                        <a {...routes.datastore_selection().link}>Mes données</a> (Publier une donnée)
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <span>Aide</span>
                                <ul>
                                    <li>
                                        <a href={externalUrls.help}>Questions fréquentes</a>
                                    </li>
                                    <li>
                                        <a href={externalUrls.help}>Guides d’utilisation</a>
                                    </li>
                                    <li>
                                        <a {...routes.contact().link}>Nous écrire</a>
                                    </li>
                                </ul>
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
