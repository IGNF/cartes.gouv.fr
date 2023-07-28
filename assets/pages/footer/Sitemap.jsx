import { fr } from "@codegouvfr/react-dsfr";
import React, { useEffect } from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

import { routes } from "../../router/router";

const SiteMap = () => {
    useEffect(() => {
        document.title = "Plan du site | cartes.gouv.fr";
    }, []);

    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Plan du site</h1>

            <section className={fr.cx("fr-py-6v")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12 fr-col-md-8")}>
                        <ul>
                            <li>
                                <a href={routes.home().href}>Accueil</a>
                            </li>
                            <li>
                                <span>Commencer avec cartes.gouv</span>
                                <ul>
                                    <li>
                                        <a href={routes.docs().href}>Documentation</a>
                                    </li>
                                    <li>
                                        <a href={routes.faq().href}>Questions fréquentes</a>
                                    </li>
                                    <li>
                                        <a href={routes.contact().href}>Nous écrire</a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a href={routes.news_list().href}>Actualités</a>
                            </li>
                            <li>
                                <a href={routes.about().href}>A propos</a>
                            </li>
                            <li>
                                <a href={routes.accessibility().href}>Accessibilité</a>
                            </li>
                            <li>
                                <a href={routes.legal_notice().href}>Mentions légales</a>
                            </li>
                            <li>
                                <a href={routes.personal_data().href}>Données personnelles</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
};

export default SiteMap;
