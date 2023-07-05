import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React, { useEffect } from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import functions from "../../functions";
import reactQueryKeys from "../../modules/reactQueryKeys";
import { routes } from "../../router/router";

const DataListItem = ({ datastoreId, data }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-my-1w", "fr-p-2v", "fr-card--grey")}>
            <div className={fr.cx("fr-col")}>
                <Button linkProps={routes.datastore_data_view({ datastoreId, dataName: data?.name }).link} priority="tertiary no outline">
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <img src="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png" width={"64px"} className={fr.cx("fr-mr-1v")} />
                        <strong>{data?.data_name || data?.name}</strong>
                        &nbsp;
                        <Tag dismissible={false}>Tag 1</Tag>
                        <Tag dismissible={false}>Tag 2</Tag>
                    </div>
                </Button>
            </div>
            <div className={fr.cx("fr-col-2")}>{data?.date || functions.date.format(new Date().toISOString())}</div>
            <div className={fr.cx("fr-col-2")}>
                <Badge noIcon={true} severity="info">
                    Non Publié
                </Badge>
            </div>
        </div>
    );
};

DataListItem.propTypes = {
    datastoreId: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

const DatastoreDataList = ({ datastoreId }) => {
    const abortController = new AbortController();
    const queryClient = useQueryClient();

    const [datastoreQuery, dataListQuery] = useQueries({
        queries: [
            {
                queryKey: [reactQueryKeys.datastore(datastoreId)],
                queryFn: () => api.datastore.getOne(datastoreId, { signal: abortController?.signal }),
                staleTime: 60000,
            },
            {
                queryKey: [reactQueryKeys.datastore_dataList(datastoreId)],
                queryFn: () => api.data.getList(datastoreId, { signal: abortController?.signal }),
                refetchInterval: 10000,
            },
        ],
    });

    const navItems = datastoreNavItems(datastoreId);

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({ queryKey: [reactQueryKeys.datastore(datastoreId), reactQueryKeys.datastore_dataList(datastoreId)] });
        };
    }, []);

    return (
        <AppLayout navItems={navItems}>
            {datastoreQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Données {datastoreQuery?.data?.name || datastoreId}</h1>

                    <Button linkProps={routes.datastore_data_new({ datastoreId }).link} className={fr.cx("fr-mr-2v")} iconId={fr.cx("fr-icon-add-line")}>
                        Créer une fiche de données
                    </Button>

                    {!dataListQuery.isLoading && dataListQuery?.data.map((data) => <DataListItem key={data?._id} datastoreId={datastoreId} data={data} />)}
                </>
            )}
        </AppLayout>
    );
};

DatastoreDataList.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DatastoreDataList;
