import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToDatastoreList from "../../components/Utils/BtnBackToDatastoreList";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import reactQueryKeys from "../../modules/reactQueryKeys";
import { routes } from "../../router/router";

const DatastoreDashboard = ({ datastoreId }) => {
    const datastoreQuery = useQuery([reactQueryKeys.datastore(datastoreId)], () => api.datastore.getOne(datastoreId), {
        staleTime: 60000,
    });

    const navItems = datastoreNavItems(datastoreId);

    return (
        <AppLayout navItems={navItems}>
            {datastoreQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Espace de travail {datastoreQuery?.data?.name || datastoreId}</h1>

                    <Button linkProps={routes.datastore_data_new({ datastoreId }).link} className={fr.cx("fr-mr-2v")}>
                        Ajouter une fiche de données
                    </Button>

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
