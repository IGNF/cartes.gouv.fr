import { fr } from "@codegouvfr/react-dsfr";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import AppLayout from "../../components/Layout/AppLayout";
import { dashboardProNavItems } from "../../config/dashboardProNavItems";
import useUser from "../../hooks/useUser";
import { routes } from "../../router/router";

const DashboardPro = () => {
    const navItems = dashboardProNavItems;
    const { user } = useUser();

    return (
        <AppLayout navItems={navItems}>
            <h2>Bienvenue {user?.firstName || "utilisateur-rice"}</h2>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-2")}>
                    <Tile linkProps={routes.datasheet_list().link} grey={true} title="Données" desc="25" />
                </div>
                <div className={fr.cx("fr-col", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-2")}>
                    <Tile
                        linkProps={{
                            href: "#",
                        }}
                        grey={true}
                        title="Visualisations"
                        desc="4"
                    />
                </div>
                <div className={fr.cx("fr-col", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-2")}>
                    <Tile
                        linkProps={{
                            href: "#",
                        }}
                        grey={true}
                        title="Outils & Traitements"
                        desc="3"
                    />
                </div>
                <div className={fr.cx("fr-col", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-2")}>
                    <Tile
                        linkProps={{
                            href: "#",
                        }}
                        grey={true}
                        title="Collaboration"
                        desc="13"
                    />
                </div>
                <div className={fr.cx("fr-col", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-2")}>
                    <Tile
                        linkProps={{
                            href: "#",
                        }}
                        grey={true}
                        title="Portails"
                        desc="13"
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default DashboardPro;
