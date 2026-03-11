import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { usePagination } from "@/hooks/usePagination";
import { Datastore, StoredData } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { routes, useRoute } from "../../../../../router/router";
import { niceBytes } from "../../../../../utils";
import api from "../../../../api";
import DataCard from "../DataCard";
import { DatastoreManageStorageTab } from "../types";

const confirmDialogModal = createModal({
    id: "confirm-delete-fs-modal",
    isOpenedByDefault: false,
});

type FilesystemUsageProps = {
    datastore: Datastore;
};
const FilesystemUsage: FC<FilesystemUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const route = useRoute();
    const page = route.params?.["page"] ?? 1;
    const limit = route.params?.["limit"] ?? 10;

    const filesystemUsage = useMemo(() => {
        return datastore?.storages.data?.find((data) => data.storage.type === "FILESYSTEM");
    }, [datastore?.storages.data]);

    const queryParams = { detailed: true };
    const storedDataListQuery = useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastore._id, queryParams),
        queryFn: ({ signal }) => api.storedData.getAll<StoredData[]>(datastore._id, queryParams, { signal }),
        staleTime: 60000,
    });

    const storedDataListInFilesystem = useMemo(() => {
        return storedDataListQuery?.data?.filter((storedData) => storedData.storage.type === "FILESYSTEM") ?? [];
    }, [storedDataListQuery?.data]);

    const { paginatedItems: storedDataList, totalPages } = usePagination(storedDataListInFilesystem, page, limit);

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
            <p>{t("storage.filesystem.explanation")}</p>

            {filesystemUsage ? (
                <Progress
                    label={`${niceBytes(filesystemUsage.use.toString())} / ${niceBytes(filesystemUsage.quota.toString())}`}
                    value={filesystemUsage.use}
                    max={filesystemUsage.quota}
                />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {storedDataListQuery.isFetching && (
                <LoadingText message={t("storage.filesystem.stored_data_list.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            )}

            {storedDataListQuery.error && (
                <Alert severity="error" title={storedDataListQuery.error.message} as="h2" closable onClose={storedDataListQuery.refetch} />
            )}

            {deleteStoredDataMutation.error && (
                <Alert severity="error" title={deleteStoredDataMutation.error.message} as="h2" closable onClose={storedDataListQuery.refetch} />
            )}

            {storedDataList.length > 0 &&
                storedDataList.map((storedData) => (
                    <DataCard
                        key={storedData._id}
                        name={storedData.name}
                        type={t("stored_data.type.title", { type: storedData.type })}
                        size={storedData.size ? niceBytes(storedData.size?.toString()) : t("data.size.unknown")}
                        buttons={[
                            {
                                iconId: "fr-icon-delete-line",
                                priority: "tertiary no outline",
                                onClick: () => {
                                    setCurrentStoredDataId(storedData._id);
                                    confirmDialogModal.open();
                                },
                                children: tCommon("delete"),
                            },
                            {
                                iconId: "fr-icon-arrow-right-s-line",
                                priority: "tertiary no outline",
                                linkProps: storedData.tags.datasheet_name
                                    ? routes.datastore_datasheet_view({
                                          datastoreId: datastore._id,
                                          datasheetName: storedData.tags.datasheet_name,
                                      }).link
                                    : undefined,
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
                        routes.datastore_manage_storage({ datastoreId: datastore._id, limit, page: pageNumber, tab: DatastoreManageStorageTab.FILESYSTEM }).link
                    }
                />
            )}

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.filesystem.deletion.confirmation", {
                        storedDataName: storedDataListInFilesystem?.find((storedData) => storedData._id === currentStoredDataId)?.name,
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
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.filesystem.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default FilesystemUsage;
