import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import PropTypes from "prop-types";
import React from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import { routes } from "../../router/router";

const DataView = ({ datastoreId, dataName }) => {
    const navItems = datastoreNavItems(datastoreId);

    return (
        <AppLayout navItems={navItems}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <Button iconId="fr-icon-arrow-left-s-line" priority="tertiary no outline" linkProps={routes.datastore_data_list({ datastoreId }).link} />
                    {dataName}
                    <Badge noIcon={true} severity="info">
                        Non Publié
                    </Badge>
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
