import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { routes } from "../../router/router";
import { datastoreNavItems } from "../../config/datastoreNavItems";

const DatastoreDataList = ({ datastoreId }) => {
    const [datastore, setDatastore] = useState(null);

    useEffect(() => {
        api.datastore
            .getOne(datastoreId)
            .then((response) => setDatastore(response))
            .catch((error) => console.error(error));
    }, []);

    const navItems = datastoreNavItems(datastoreId);

    return (
        <AppLayout navItems={navItems}>
            {datastore === null ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Données {datastore?.name || datastoreId}</h1>

                    <Button
                        linkProps={routes.datastore_data_new({ datastoreId }).link}
                        className={fr.cx("fr-mr-2v")}
                        iconId={fr.cx("fr-icon-add-line")}
                    >
                        Créer une fiche de données
                    </Button>

                    <p>A venir : tableau des fiches de données</p>
                </>
            )}
        </AppLayout>
    );
};

DatastoreDataList.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DatastoreDataList;
