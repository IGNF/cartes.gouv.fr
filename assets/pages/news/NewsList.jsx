import { fr } from "@codegouvfr/react-dsfr";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import React from "react";
import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

const NewsList = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <div className={fr.cx("c-section", "c-section--blue")}>
                <div className={fr.cx("fr-container fr-container--blue card  fr-pt-8v fr-pt-18v fr-mb-md-8v")}>
                    <h1>Actualités</h1>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-xs-12 fr-col-sm-12 fr-col-md-4 fr-col-lg-4")}>
                            <Card
                                badges={[
                                    <Tag key="1" className={fr.cx("fr-tag--pink-tuile")}>
                                        Autour de la terre
                                    </Tag>,
                                ]}
                                desc="Les Communs d’utilité publique ! Une journée d’échanges pour une nouvelle manière de relever ensemble les défis d’intérêt général"
                                detail="17 janvier 2023"
                                enlargeLink
                                imageAlt="illustration de l'article"
                                imageUrl="https://2fresh-studio.com/projets/ign/assets/img/actu1.jpg"
                                linkProps={{
                                    href: "#",
                                }}
                                title="Ceci est un titre d'article"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default NewsList;
