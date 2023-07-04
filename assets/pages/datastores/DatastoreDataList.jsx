import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { useQueries } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import functions from "../../functions";
import queryKeys from "../../modules/queryKeys";
import { routes } from "../../router/router";

const DataListItem = ({ data }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-my-1w", "fr-p-2v", "fr-card--grey")}>
            <div className={fr.cx("fr-col")}>
                <Button linkProps={{ href: "#" }} priority="tertiary no outline">
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <img src="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png" width={"64px"} className={fr.cx("fr-mr-1v")} />
                        <strong>{data?.data_name || data?.name}</strong>
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
    data: PropTypes.object.isRequired,
};

const DatastoreDataList = ({ datastoreId }) => {
    const [datastoreQuery, dataListQuery] = useQueries({
        queries: [
            {
                queryKey: [queryKeys.datastore(datastoreId)],
                queryFn: () => api.datastore.getOne(datastoreId),
                staleTime: 60000,
            },
            {
                queryKey: [queryKeys.datastore_dataList(datastoreId)],
                queryFn: () => api.data.getList(datastoreId),
            },
        ],
    });

    const navItems = datastoreNavItems(datastoreId);

    return (
        <AppLayout navItems={navItems}>
            {datastoreQuery.isLoading ? (
                <LoadingText />
            ) : (
                <MuiDsfrThemeProvider>
                    <h1>Données {datastoreQuery?.data?.name || datastoreId}</h1>

                    <Button linkProps={routes.datastore_data_new({ datastoreId }).link} className={fr.cx("fr-mr-2v")} iconId={fr.cx("fr-icon-add-line")}>
                        Créer une fiche de données
                    </Button>

                    {!dataListQuery.isLoading && dataListQuery?.data.map((data) => <DataListItem key={data?._id} data={data} />)}
                </MuiDsfrThemeProvider>
            )}
        </AppLayout>
    );
};

DatastoreDataList.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DatastoreDataList;
