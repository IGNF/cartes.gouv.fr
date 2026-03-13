import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, memo, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import useStoredDataListQuery from "@/hooks/queries/useStoredDataListQuery";
import { usePagination } from "@/hooks/usePagination";
import { Datastore, StoredData, StoredDataTypeEnum, VectorDb } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes, useRoutePaginationParams } from "../../../../../router/router";
import { niceBytes } from "../../../../../utils";
import api from "../../../../api";
import DataCard from "../DataCard";
import { DatastoreManageStorageTab } from "../types";

const confirmDialogModal = createModal({
    id: "confirm-delete-pg-modal",
    isOpenedByDefault: false,
});

type PostgresqlUsageProps = {
    datastore: Datastore;
};
const PostgresqlUsage: FC<PostgresqlUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const { page, limit } = useRoutePaginationParams();

    const pgUsage = useMemo(() => {
        return datastore?.storages.data?.find((data) => data.storage.type === "POSTGRESQL");
    }, [datastore]);

    const queryParams = { detailed: true };
    const storedDataListQuery = useStoredDataListQuery(datastore._id, queryParams);

    const vectorDbList: VectorDb[] = useMemo(() => {
        return (storedDataListQuery?.data?.filter((storedData) => storedData.type === StoredDataTypeEnum.VECTORDB) as VectorDb[]) ?? [];
    }, [storedDataListQuery?.data]);

    const { paginatedItems: storedDataList, totalPages } = usePagination(vectorDbList, page, limit);

    const queryClient = useQueryClient();

    const [currentStoredDataId, setCurrentStoredDataId] = useState<string | undefined>();

    const deleteStoredDataMutation = useMutation({
        mutationFn: (storedDataId: string) => api.storedData.remove(datastore._id, storedDataId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_stored_data_list(datastore._id), (storedDataList: StoredData[]) => {
                return storedDataList.filter((storedData) => storedData._id !== currentStoredDataId);
            });

            setCurrentStoredDataId(undefined);
        },
        onError() {
            setCurrentStoredDataId(undefined);
        },
    });

    return (
        <>
            <p className={fr.cx("fr-text--xs")}>{t("storage.postgresql.explanation")}</p>

            {pgUsage ? (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                        <Progress
                            label={
                                <>
                                    {niceBytes(pgUsage.use.toString())} / <strong>{niceBytes(pgUsage.quota.toString())}</strong>
                                </>
                            }
                            value={pgUsage.use}
                            max={pgUsage.quota}
                        />
                    </div>
                </div>
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {storedDataListQuery.isFetching && (
                <LoadingText message={t("storage.postgresql.vectordb.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            )}

            {storedDataListQuery.error && (
                <Alert severity="error" title={storedDataListQuery.error.message} as="h2" closable onClose={storedDataListQuery.refetch} />
            )}

            {deleteStoredDataMutation.error && (
                <Alert severity="error" title={deleteStoredDataMutation.error.message} as="h2" closable onClose={storedDataListQuery.refetch} />
            )}

            {storedDataList.length > 0 &&
                storedDataList.map((vectorDb) => (
                    <DataCard
                        key={vectorDb._id}
                        name={vectorDb.name}
                        type={t("stored_data.type.title", { type: vectorDb.type })}
                        size={vectorDb.size ? niceBytes(vectorDb.size?.toString()) : t("data.size.unknown")}
                        buttons={[
                            {
                                iconId: "fr-icon-delete-line",
                                priority: "tertiary no outline",
                                onClick: () => {
                                    setCurrentStoredDataId(vectorDb._id);
                                    confirmDialogModal.open();
                                },
                                children: tCommon("delete"),
                            },
                            vectorDb.tags.datasheet_name !== undefined && {
                                iconId: "fr-icon-arrow-right-s-line",
                                priority: "tertiary no outline",
                                linkProps: routes.datastore_datasheet_view({
                                    datastoreId: datastore._id,
                                    datasheetName: vectorDb.tags.datasheet_name,
                                }).link,
                                children: tCommon("see_2"),
                            },
                        ]}
                    />
                ))}

            {totalPages > 1 && (
                <Pagination
                    defaultPage={page}
                    count={totalPages}
                    getPageLinkProps={(pageNumber: number) =>
                        routes.datastore_manage_storage({ datastoreId: datastore._id, limit, page: pageNumber, tab: DatastoreManageStorageTab.POSTGRESQL }).link
                    }
                />
            )}

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.postgresql.deletion.confirmation", {
                        storedDataName: vectorDbList?.find((storedData) => storedData._id === currentStoredDataId)?.name,
                        storedDataId: currentStoredDataId,
                    })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentStoredDataId !== undefined) {
                                    deleteStoredDataMutation.mutate(currentStoredDataId);
                                }
                            },
                            priority: "primary",
                        },
                    ]}
                >
                    <div />
                </confirmDialogModal.Component>,
                document.body
            )}

            {deleteStoredDataMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.postgresql.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default memo(PostgresqlUsage);
