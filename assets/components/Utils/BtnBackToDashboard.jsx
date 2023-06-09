import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import PropTypes from "prop-types";
import React from "react";

import { routes } from "../../router/router";

const BtnBackToDashboard = ({ datastoreId, className }) => {
    return (
        <Button linkProps={routes.datastore_dashboard({ datastoreId }).link} className={fr.cx("fr-my-2w", className)}>
            {"Retour au tableau de bord"}
        </Button>
    );
};

BtnBackToDashboard.propTypes = {
    datastoreId: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default BtnBackToDashboard;
