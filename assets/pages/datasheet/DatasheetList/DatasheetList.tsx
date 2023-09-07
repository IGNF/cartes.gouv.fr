import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect } from "react";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RQKeys from "../../../modules/RQKeys";
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

    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: () => api.datastore.get(datastoreId, { signal: abortController?.signal }),
        staleTime: 120000,
    });

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: () => api.datasheet.getList(datastoreId, { signal: abortController?.signal }),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({
                queryKey: [...RQKeys.datastore(datastoreId), ...RQKeys.datastore_datasheet_list(datastoreId)],
            });
        };
    }, [queryClient, datastoreId]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Mes données">
            {datastoreQuery.isLoading === undefined ? (
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
