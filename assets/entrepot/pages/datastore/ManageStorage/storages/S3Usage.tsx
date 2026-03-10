import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import MenuList from "@/components/Utils/MenuList";
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
    id: "confirm-delete-s3-modal",
    isOpenedByDefault: false,
});

type S3UsageProps = {
    datastore: Datastore;
};
const S3Usage: FC<S3UsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const route = useRoute();
    const page = route.params?.["page"] ?? 1;
    const limit = route.params?.["limit"] ?? 10;

    const s3Usage = useMemo(() => {
        return datastore?.storages.data?.find((data) => data.storage.type === "S3");
    }, [datastore]);

    const queryParams = { detailed: true };
    const storedDataListQuery = useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastore._id, queryParams),
        queryFn: ({ signal }) => api.storedData.getAll<StoredData[]>(datastore._id, queryParams, { signal }),
        staleTime: 60000,
    });

    // const queryParams = { detailed: true, page, limit };
    // const storedDataListQuery = useQuery<
    //     {
    //         items: StoredData[];
    //         contentRange: ContentRangeType;
    //     },
    //     CartesApiException
    // >({
    //     queryKey: RQKeys.datastore_stored_data_list(datastore._id, queryParams),
    //     queryFn: async ({ signal }) => {
    //         const res = await api.storedData.getList<StoredData[]>(datastore._id, queryParams, { signal });

    //         return {
    //             items: res.data,
    //             contentRange: decodeContentRange(res.headers.get("content-range") ?? ""),
    //         };
    //     },
    //     staleTime: 60000,
    // });
    // const { data: { items: storedDataList, contentRange } = { items: [], contentRange: undefined } } = storedDataListQuery;

    const storedDataListInS3 = useMemo(() => {
        return storedDataListQuery?.data?.filter((storedData) => storedData.storage.type === "S3") ?? [];
    }, [storedDataListQuery?.data]);

    const { paginatedItems: storedDataList, totalPages } = usePagination(storedDataListInS3, page, limit);

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
            <p>{t("storage.s3.explanation")}</p>

            {s3Usage ? (
                <Progress label={`${niceBytes(s3Usage.use.toString())} / ${niceBytes(s3Usage.quota.toString())}`} value={s3Usage.use} max={s3Usage.quota} />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {storedDataListQuery.isFetching && (
                <LoadingText message={t("storage.s3.stored_data_list.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
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
                        buttons={
                            <>
                                {storedData.tags.datasheet_name && (
                                    <Button
                                        size="small"
                                        iconId="fr-icon-arrow-right-s-line"
                                        iconPosition="right"
                                        priority="tertiary no outline"
                                        linkProps={
                                            routes.datastore_datasheet_view({ datastoreId: datastore._id, datasheetName: storedData.tags.datasheet_name }).link
                                        }
                                    >
                                        {tCommon("see_2")}
                                    </Button>
                                )}
                                <MenuList
                                    menuOpenButtonProps={{
                                        size: "small",
                                        iconId: "ri-more-2-line",
                                        iconPosition: "right",
                                        priority: "tertiary no outline",
                                    }}
                                    items={[
                                        {
                                            text: tCommon("delete"),
                                            iconId: "fr-icon-delete-line",
                                            onClick: () => {
                                                setCurrentStoredDataId(storedData._id);
                                                confirmDialogModal.open();
                                            },
                                        },
                                    ]}
                                />
                            </>
                        }
                    />
                ))}

            {totalPages > 1 && (
                <Pagination
                    defaultPage={page}
                    count={totalPages}
                    getPageLinkProps={(pageNumber: number) =>
                        routes.datastore_manage_storage({ datastoreId: datastore._id, limit, page: pageNumber, tab: DatastoreManageStorageTab.S3 }).link
                    }
                />
            )}

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.s3.deletion.confirmation", {
                        storedDataName: storedDataListInS3?.find((storedData) => storedData._id === currentStoredDataId)?.name,
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
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.s3.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default S3Usage;
