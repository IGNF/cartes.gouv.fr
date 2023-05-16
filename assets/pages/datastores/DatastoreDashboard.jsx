import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToDatastoreList from "../../components/Utils/BtnBackToDatastoreList";
import LoadingText from "../../components/Utils/LoadingText";
import { defaultNavItems } from "../../config/navItems";

const DatastoreDashboard = ({ datastoreId }) => {
    const [datastore, setDatastore] = useState(null);

    useEffect(() => {
        api.datastore
            .get(datastoreId)
            .then((response) => setDatastore(response))
            .catch((error) => console.error(error));
    }, []);

    return (
        <AppLayout navItems={defaultNavItems}>
            {datastore === null ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Espace de travail {datastore?.name || datastoreId}</h1>
                    <BtnBackToDatastoreList />
                </>
            )}
        </AppLayout>
    );
};

DatastoreDashboard.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DatastoreDashboard;
