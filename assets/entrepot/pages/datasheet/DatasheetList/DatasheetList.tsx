import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import { Datasheet, EndpointTypeEnum } from "../../../../@types/app";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import Skeleton from "../../../../components/Utils/Skeleton";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { routes, useRoute } from "../../../../router/router";
import api from "../../../api";
import DatasheetListItem from "./DatasheetListItem";
import { useDatastore } from "../../../../contexts/datastore";
import Main from "../../../../components/Layout/Main";

type DatasheetListProps = {
    datastoreId: string;
};
const DatasheetList: FC<DatasheetListProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatasheetList");
    const { datastore, isFetching } = useDatastore();

    const { params } = useRoute();
    const pagination = {
        page: params["page"] ? parseInt(params["page"]) : 1,
        limit: params["limit"] ? parseInt(params["limit"]) : 20,
    };

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        staleTime: 60000,
        refetchInterval: 60000,
        enabled: datastore !== undefined,
    });

    const metadataEndpoint = useMemo(
        () => datastore?.endpoints?.find((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.METADATA),
        [datastore?.endpoints]
    );

    return (
        <Main title="Mes données">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col")}>
                    <h1>
                        {t("title", { datastoreName: datastore?.name })}
                        {(isFetching || datasheetListQuery?.isFetching) && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon={true} />}
                    </h1>

                    {datastore?.is_sandbox === true && t("sandbox_datastore_explanation")}
                </div>
            </div>

            {metadataEndpoint && (
                <div className={fr.cx("fr-grid-row")}>
                    {metadataEndpoint?.quota && metadataEndpoint?.use && metadataEndpoint?.quota === metadataEndpoint?.use ? (
                        <Alert severity="warning" title={t("datasheet_creation_impossible")} description={t("metadata_endpoint_quota_reached")} />
                    ) : (
                        <Button linkProps={routes.datastore_datasheet_upload({ datastoreId: datastoreId }).link} iconId={"fr-icon-add-line"}>
                            {t("create_datasheet")}
                        </Button>
                    )}
                </div>
            )}

            {datasheetListQuery.data === undefined ? (
                <Skeleton count={12} rectangleHeight={100} />
            ) : (
                <>
                    {datasheetListQuery?.data
                        ?.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
                        .map((datasheet: Datasheet) => <DatasheetListItem key={datasheet.name} datastoreId={datastoreId} datasheet={datasheet} />)}

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-6v")}>
                        <Pagination
                            count={Math.ceil(datasheetListQuery.data?.length / pagination.limit)}
                            showFirstLast={true}
                            getPageLinkProps={(pageNumber) => ({
                                ...routes.datasheet_list({ datastoreId, page: pageNumber, limit: pagination.limit }).link,
                            })}
                            defaultPage={pagination.page}
                        />
                    </div>
                </>
            )}
        </Main>
    );
};

export default DatasheetList;
