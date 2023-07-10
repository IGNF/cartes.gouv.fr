import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import PropTypes from "prop-types";

import AppLayout from "../../../components/Layout/AppLayout";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { routes } from "../../../router/router";
import DatasetListTab from "./DatasetListTab/DatasetListTab";

const DataView = ({ datastoreId, dataName }) => {
    const navItems = datastoreNavItems(datastoreId);

    return (
        <AppLayout navItems={navItems}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--left", "fr-grid-row--middle", "fr-mb-4w")}>
                <Button
                    iconId="fr-icon-arrow-left-s-line"
                    priority="tertiary no outline"
                    linkProps={routes.datastore_data_list({ datastoreId }).link}
                    title="Retour à la liste de mes données"
                />
                {dataName}&nbsp;
                <Badge noIcon={true} severity="info">
                    Non Publié
                </Badge>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                <div className={fr.cx("fr-col-2")}>
                    <img src="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png" width="128px" />
                </div>
                <div className={fr.cx("fr-col")}>
                    <p>
                        <strong>Création de la fiche de données :</strong>13 Mar. 2023
                    </p>
                    <p>
                        <strong>Mise à jour :</strong>17 Mar. 2023
                    </p>
                </div>
                <div className={fr.cx("fr-col-3")}>
                    <ButtonsGroup
                        buttons={[
                            {
                                children: "Supprimer la donnée",
                                linkProps: {
                                    href: "#",
                                },
                                iconId: "fr-icon-delete-fill",
                            },
                            {
                                children: "Bouton à définir",
                                linkProps: {
                                    href: "#",
                                },
                            },
                        ]}
                    />
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                <div className={fr.cx("fr-col-4")}>
                    <Button linkProps={routes.datastore_data_new({ datastoreId }).link} className={fr.cx("fr-mr-2v")}>
                        Ajouter une fiche de données
                    </Button>
                </div>
            </div>

            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col")}>
                    <Tabs
                        tabs={[
                            { label: "Métadonnées", content: <p>...liste de métadonnées...</p> },
                            { label: "Jeux de données", isDefault: true, content: <DatasetListTab datastoreId={datastoreId} dataName={dataName} /> },
                            { label: "Services", content: <p>...liste de services...</p> },
                        ]}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

DataView.propTypes = {
    datastoreId: PropTypes.string.isRequired,
    dataName: PropTypes.string.isRequired,
};

export default DataView;
