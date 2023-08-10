import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect } from "react";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RCKeys from "../../../modules/RCKeys";
import { routes } from "../../../router/router";
import { Datasheet } from "../../../types/app";
import DatasheetListItem from "./DatasheetListItem";

import "../../../sass/components/spinner.scss";

type DatasheetListProps = {
    datastoreId: string;
};
const DatasheetList: FC<DatasheetListProps> = ({ datastoreId }) => {
    const abortController = new AbortController();
    const queryClient = useQueryClient();

    const [datastoreQuery, datasheetListQuery] = useQueries({
        queries: [
            {
                queryKey: RCKeys.datastore(datastoreId),
                queryFn: () => api.datastore.get(datastoreId, { signal: abortController?.signal }),
                staleTime: 60000,
            },
            {
                queryKey: RCKeys.datastore_datasheet_list(datastoreId),
                queryFn: () => api.datasheet.getList(datastoreId, { signal: abortController?.signal }),
                refetchInterval: 10000,
            },
        ],
    });

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({
                queryKey: [...RCKeys.datastore(datastoreId), ...RCKeys.datastore_datasheet_list(datastoreId)],
            });
        };
    }, [queryClient, datastoreId]);

    return (
        <DatastoreLayout datastoreId={datastoreId}>
            {datastoreId === undefined ? (
                <LoadingText />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row")}>
                        <h1>
                            Données {datastoreQuery?.data && datastoreQuery?.data?.name}
                            {(datastoreQuery?.isFetching || datasheetListQuery?.isFetching) && (
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-ml-2w") + " icons-spin"} />
                            )}
                        </h1>
                    </div>

                    <div className={fr.cx("fr-grid-row")}>
                        <Button linkProps={routes.datastore_datasheet_new({ datastoreId: datastoreId }).link} iconId={"fr-icon-add-line"}>
                            Créer une fiche de données
                        </Button>
                    </div>

                    {!datasheetListQuery.isLoading &&
                        datasheetListQuery?.data?.map((datasheet: Datasheet) => (
                            <DatasheetListItem key={datasheet.name} datastoreId={datastoreId} datasheet={datasheet} />
                        ))}
                </>
            )}
        </DatastoreLayout>
    );
};

export default DatasheetList;
