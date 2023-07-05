import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import PropTypes from "prop-types";
import React from "react";
import { routes } from "../../../router/router";

const DataListTab = ({ datastoreId }) => {
    // TODO : données fictives
    const vectorDbList = [
        {
            _id: "e82d5499-c0c5-4930-a703-f11d9cc7cd7e",
            name: "Contraintes naviforest",
            date: "17 mars 2023 - 17h27",
        },
    ];
    // TODO : il y en aura d'autres types de données aussi (pyramid vector, raster, etc)

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={fr.cx("fr-col")}>
                <div className={fr.cx("fr-grid-row")}>Bases de données vecteur (1)</div>

                {vectorDbList.map((el) => (
                    <div key={el._id} className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col")}>{el.name}</div>
                        <div className={fr.cx("fr-col")}>{el.date}</div>
                        <div className={fr.cx("fr-col")}>
                            <Button linkProps={routes.datastore_wfs_service_new({ datastoreId, storedDataId: el._id }).link}>Créer un service</Button>
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <Button iconId="fr-icon-menu-fill" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

DataListTab.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DataListTab;
