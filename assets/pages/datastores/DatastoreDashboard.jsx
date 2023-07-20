import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import reactQueryKeys from "../../modules/reactQueryKeys";
import { routes } from "../../router/router";

const DatastoreDashboard = ({ datastoreId }) => {
    const datastoreQuery = useQuery([reactQueryKeys.datastore(datastoreId)], () => api.datastore.get(datastoreId), {
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

                    <ButtonsGroup
                        buttons={[
                            {
                                linkProps: routes.datastore_data_new({ datastoreId }).link,
                                iconId: "fr-icon-add-line",
                                children: "Créer une fiche de données",
                            },
                            {
                                linkProps: routes.datastore_list().link,
                                children: "Retour à la liste de mes espaces de travail",
                            },
                        ]}
                        alignment="left"
                        inlineLayoutWhen="always"
                    />
                </>
            )}
        </AppLayout>
    );
};

DatastoreDashboard.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DatastoreDashboard;
