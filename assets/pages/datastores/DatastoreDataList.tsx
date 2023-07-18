import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect } from "react";
import { symToStr } from "tsafe/symToStr";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import functions from "../../functions";
import reactQueryKeys from "../../modules/reactQueryKeys";
import { routes } from "../../router/router";
import { type Data } from "../../types/app";

type DataListItemProps = {
    datastoreId: string;
    data: Data;
};

const DataListItem: FC<DataListItemProps> = ({ datastoreId, data }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-my-1w", "fr-p-2v", "fr-card--grey")}>
            <div className={fr.cx("fr-col")}>
                <Button linkProps={routes.datastore_data_view({ datastoreId, dataName: data.data_name }).link} priority="tertiary no outline">
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <img src="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png" width={"64px"} className={fr.cx("fr-mr-1v")} />
                        <strong className={fr.cx("fr-ml-2w")}>{data.data_name}</strong>
                        {data.categories?.map((category, i) => (
                            <Tag key={i} dismissible={false} className={fr.cx("fr-ml-2w")} small={true} pressed={false}>
                                {category}
                            </Tag>
                        ))}
                    </div>
                </Button>
            </div>
            <div className={fr.cx("fr-col-2")}>{data?.date ? functions.date.format(data.date) : ""}</div>
            <div className={fr.cx("fr-col-2")}>
                <Badge noIcon={true} severity="info">
                    {data?.nb_publications > 0 ? `Publié (${data?.nb_publications})` : "Non Publié"}
                </Badge>
            </div>
        </div>
    );
};

DataListItem.displayName = symToStr({ DataListItem });

type DatastoreDataListType = {
    datastoreId: string;
};

const DatastoreDataList: FC<DatastoreDataListType> = ({ datastoreId }) => {
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
                queryKey: [reactQueryKeys.datastore_dataList_detailed(datastoreId)],
                queryFn: () => api.data.getList(datastoreId, { signal: abortController?.signal }),
                refetchInterval: 10000,
            },
        ],
    });

    const navItems = datastoreNavItems(datastoreId);

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({ queryKey: [reactQueryKeys.datastore(datastoreId), reactQueryKeys.datastore_dataList_detailed(datastoreId)] });
        };
    }, [datastoreId, queryClient]);

    return (
        <AppLayout navItems={navItems}>
            {datastoreQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Données {datastoreQuery?.data?.name || datastoreId}</h1>

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

                    {!dataListQuery.isLoading &&
                        dataListQuery?.data.map((data: Data) => <DataListItem key={data?.data_name} datastoreId={datastoreId} data={data} />)}
                </>
            )}
        </AppLayout>
    );
};

DatastoreDataList.displayName = symToStr({ DatastoreDataList });

export default DatastoreDataList;
