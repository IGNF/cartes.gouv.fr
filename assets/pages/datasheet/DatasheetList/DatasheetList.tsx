import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { dashboardProNavItems } from "../../../config/dashboardProNavItems";
import RCKeys from "../../../modules/RCKeys";
import { routes } from "../../../router/router";

import "../../../sass/components/spinner.scss";
import DatasheetListItem from "./DatasheetListItem";
import { Datasheet } from "../../../types/app";

const DatasheetList = () => {
    const navItems = dashboardProNavItems;
    const abortController = new AbortController();
    const queryClient = useQueryClient();

    const datastoreListQuery = useQuery({
        queryKey: RCKeys.datastore_list,
        queryFn: () => api.user.getDatastoresList(),
        staleTime: 60000,
    });

    const [selectedDatastoreId, setSelectedDatastoreId] = useState<string | undefined>(undefined);

    useEffect(() => {
        setSelectedDatastoreId(datastoreListQuery?.data?.[0]?._id || undefined);
    }, [datastoreListQuery?.data]);

    const [datastoreQuery, datasheetListQuery] = useQueries({
        queries: [
            {
                queryKey: RCKeys.datastore(selectedDatastoreId || "id"),
                queryFn: () => {
                    if (selectedDatastoreId) return api.datastore.get(selectedDatastoreId, { signal: abortController?.signal });
                    return undefined;
                },
                staleTime: 60000,
                enabled: !!selectedDatastoreId,
            },
            {
                queryKey: RCKeys.datastore_datasheet_list(selectedDatastoreId || "id"),
                queryFn: () => {
                    if (selectedDatastoreId) return api.datasheet.getList(selectedDatastoreId, { signal: abortController?.signal });
                    return undefined;
                },
                refetchInterval: 10000,
                enabled: !!selectedDatastoreId,
            },
        ],
    });

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({
                queryKey: [...RCKeys.datastore(selectedDatastoreId || "id"), ...RCKeys.datastore_datasheet_list(selectedDatastoreId || "id")],
            });
        };
    }, [queryClient, selectedDatastoreId]);

    return (
        <AppLayout navItems={navItems}>
            {selectedDatastoreId === undefined || datastoreListQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <Select
                        label={"Espace de travail"}
                        nativeSelectProps={{
                            value: selectedDatastoreId,
                            onChange: (e) => setSelectedDatastoreId(e.target.value),
                        }}
                    >
                        <option value="" disabled>
                            Selectionnez un espace de travail
                        </option>
                        {datastoreListQuery?.data?.map((datastore) => (
                            <option key={datastore._id} value={datastore._id}>
                                {datastore.name}
                            </option>
                        ))}
                    </Select>
                    <div className={fr.cx("fr-grid-row")}>
                        <h1>
                            Données {datastoreQuery?.data && datastoreQuery?.data?.name}
                            {(datastoreQuery?.isFetching || datasheetListQuery?.isFetching) && (
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-ml-2w") + " icons-spin"} />
                            )}
                        </h1>
                    </div>

                    <div className={fr.cx("fr-grid-row")}>
                        <Button linkProps={routes.datastore_datasheet_new({ datastoreId: selectedDatastoreId }).link} iconId={"fr-icon-add-line"}>
                            Créer une fiche de données
                        </Button>
                    </div>

                    {!datasheetListQuery.isLoading &&
                        datasheetListQuery?.data?.map((datasheet: Datasheet) => (
                            <DatasheetListItem key={datasheet.name} datastoreId={selectedDatastoreId} datasheet={datasheet} />
                        ))}
                </>
            )}
        </AppLayout>
    );
};

export default DatasheetList;
