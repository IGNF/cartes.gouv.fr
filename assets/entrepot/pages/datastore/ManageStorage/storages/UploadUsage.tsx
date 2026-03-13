import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { useMutation, usePrefetchQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { CartesApiException } from "@/modules/jsonFetch";
import { Datastore, Upload } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes, useRoutePaginationParams } from "../../../../../router/router";
import { decodeContentRange, delta, niceBytes, PaginatedListResponse } from "../../../../../utils";
import api from "../../../../api";
import DataCard from "../DataCard";
import { DatastoreManageStorageTab } from "../types";

const confirmDialogModal = createModal({
    id: "confirm-delete-upload-modal",
    isOpenedByDefault: false,
});

async function fetchUploadList(datastoreId: string, queryParams: object = {}, signal?: AbortSignal) {
    const res = await api.upload.getList(datastoreId, queryParams, { signal });

    return {
        items: res.data,
        contentRange: decodeContentRange(res.headers.get("content-range") ?? "", queryParams?.["limit"] ?? 10),
    };
}

type UploadUsageProps = {
    datastore: Datastore;
};
const UploadUsage: FC<UploadUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const { page, limit } = useRoutePaginationParams();

    const uploadUsage = useMemo(() => {
        return datastore?.storages.uploads;
    }, [datastore]);

    type TmpUpload = Pick<Upload, "_id" | "name" | "type" | "size" | "tags">;
    const queryParams = { page, limit, fields: ["name", "type", "size", "tags"] };
    const uploadListQuery = useQuery<PaginatedListResponse<TmpUpload>, CartesApiException>({
        queryKey: RQKeys.datastore_upload_list(datastore._id, queryParams),
        queryFn: ({ signal }) => fetchUploadList(datastore._id, queryParams, signal),
        staleTime: delta.minutes(1),
    });
    const { data: { items: uploadsList, contentRange } = { items: [], contentRange: undefined } } = uploadListQuery;

    usePrefetchQuery({
        queryKey: RQKeys.datastore_upload_list(datastore._id, { ...queryParams, page: page + 1 }),
        queryFn: ({ signal }) => fetchUploadList(datastore._id, { ...queryParams, page: page + 1 }, signal),
        staleTime: delta.minutes(1),
    });

    const queryClient = useQueryClient();

    const [currentUploadId, setCurrentUploadId] = useState<string | undefined>();

    const deleteUploadMutation = useMutation({
        mutationFn: (uploadId: string) => api.upload.remove(datastore._id, uploadId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_upload_list(datastore._id, queryParams), (prevData: PaginatedListResponse<Upload> | undefined) => {
                return prevData
                    ? {
                          ...prevData,
                          items: prevData.items.filter((upload) => upload._id !== currentUploadId),
                      }
                    : undefined;
            });
            queryClient.invalidateQueries({
                queryKey: RQKeys.datastore_upload_list(datastore._id),
                exact: false,
            });

            setCurrentUploadId(undefined);
        },
        onError() {
            setCurrentUploadId(undefined);
        },
    });

    return (
        <>
            <p className={fr.cx("fr-text--xs")}>{t("storage.upload.explanation")}</p>

            {uploadUsage ? (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                        <Progress
                            label={
                                <>
                                    {niceBytes(uploadUsage.use.toString())} / <strong>{niceBytes(uploadUsage.quota.toString())}</strong>
                                </>
                            }
                            value={uploadUsage.use}
                            max={uploadUsage.quota}
                        />
                    </div>
                </div>
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {uploadListQuery.isFetching && <LoadingText message={t("storage.upload.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {uploadListQuery.error && <Alert severity="error" title={uploadListQuery.error.message} as="h2" closable onClose={uploadListQuery.refetch} />}

            {deleteUploadMutation.error && (
                <Alert severity="error" title={deleteUploadMutation.error.message} as="h2" closable onClose={uploadListQuery.refetch} />
            )}

            {uploadsList.length > 0 &&
                uploadsList.map((upload) => (
                    <DataCard
                        key={upload._id}
                        name={upload.name}
                        type={t("storage.upload.type.title", { type: upload.type })}
                        size={upload.size ? niceBytes(upload.size?.toString()) : t("data.size.unknown")}
                        buttons={[
                            {
                                iconId: "fr-icon-delete-line",
                                priority: "tertiary no outline",
                                onClick: () => {
                                    setCurrentUploadId(upload._id);
                                    confirmDialogModal.open();
                                },
                                children: tCommon("delete"),
                            },
                            upload.tags?.datasheet_name !== undefined && {
                                iconId: "fr-icon-arrow-right-s-line",
                                priority: "tertiary no outline",
                                linkProps: routes.datastore_datasheet_view({
                                    datastoreId: datastore._id,
                                    datasheetName: upload.tags.datasheet_name,
                                }).link,
                                children: tCommon("see_2"),
                            },
                        ]}
                    />
                ))}

            {contentRange && contentRange?.totalPages > 1 && (
                <Pagination
                    defaultPage={page}
                    count={contentRange?.totalPages}
                    getPageLinkProps={(pageNumber: number) =>
                        routes.datastore_manage_storage({ datastoreId: datastore._id, limit, page: pageNumber, tab: DatastoreManageStorageTab.UPLOAD }).link
                    }
                />
            )}

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.upload.deletion.confirmation", {
                        uploadName: uploadsList?.find((upload) => upload._id === currentUploadId)?.name,
                        uploadId: currentUploadId,
                    })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentUploadId !== undefined) {
                                    deleteUploadMutation.mutate(currentUploadId);
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

            {deleteUploadMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.upload.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default UploadUsage;
