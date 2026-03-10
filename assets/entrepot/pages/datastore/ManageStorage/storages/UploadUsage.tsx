import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { usePagination } from "@/hooks/usePagination";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { Datastore, Upload } from "../../../../../@types/app";
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
    id: "confirm-delete-upload-modal",
    isOpenedByDefault: false,
});

type UploadUsageProps = {
    datastore: Datastore;
};
const UploadUsage: FC<UploadUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const route = useRoute();
    const page = route.params?.["page"] ?? 1;
    const limit = route.params?.["limit"] ?? 10;

    const uploadUsage = useMemo(() => {
        return datastore?.storages.uploads;
    }, [datastore]);

    const uploadListQuery = useQuery<Upload[], CartesApiException>({
        queryKey: RQKeys.datastore_upload_list(datastore._id),
        queryFn: ({ signal }) => api.upload.getList(datastore._id, undefined, { signal }),
        staleTime: 60000,
    });

    const { paginatedItems: uploadsList, totalPages } = usePagination(uploadListQuery.data ?? [], page, limit);

    const queryClient = useQueryClient();

    const [currentUploadId, setCurrentUploadId] = useState<string | undefined>();

    const deleteUploadMutation = useMutation({
        mutationFn: (uploadId: string) => api.upload.remove(datastore._id, uploadId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_upload_list(datastore._id), (uploadsList: Upload[]) => {
                return uploadsList.filter((annexe) => annexe._id !== currentUploadId);
            });

            setCurrentUploadId(undefined);
        },
        onError() {
            setCurrentUploadId(undefined);
        },
    });

    return (
        <>
            <p>{t("storage.upload.explanation")}</p>

            {uploadUsage ? (
                <Progress
                    label={`${niceBytes(uploadUsage.use.toString())} / ${niceBytes(uploadUsage.quota.toString())}`}
                    value={uploadUsage.use}
                    max={uploadUsage.quota}
                />
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
                                iconPosition: "right",
                                priority: "tertiary no outline",
                                onClick: () => {
                                    setCurrentUploadId(upload._id);
                                    confirmDialogModal.open();
                                },
                                children: tCommon("delete"),
                            },
                            {
                                iconId: "fr-icon-arrow-right-s-line",
                                iconPosition: "right",
                                priority: "tertiary no outline",
                                linkProps: upload.tags?.datasheet_name
                                    ? routes.datastore_datasheet_view({
                                          datastoreId: datastore._id,
                                          datasheetName: upload.tags.datasheet_name,
                                      }).link
                                    : undefined,
                                children: tCommon("see_2"),
                            },
                        ]}
                        // buttons={
                        //     <>
                        //         <Button
                        //             size="small"
                        //             iconId="fr-icon-delete-line"
                        //             iconPosition="right"
                        //             priority="tertiary no outline"
                        //             onClick={() => {
                        //                 setCurrentUploadId(upload._id);
                        //                 confirmDialogModal.open();
                        //             }}
                        //         >
                        //             {tCommon("delete")}
                        //         </Button>
                        //         {upload.tags.datasheet_name && (
                        //             <Button
                        //                 size="small"
                        //                 iconId="fr-icon-arrow-right-s-line"
                        //                 iconPosition="right"
                        //                 priority="tertiary no outline"
                        //                 linkProps={
                        //                     routes.datastore_datasheet_view({ datastoreId: datastore._id, datasheetName: upload.tags.datasheet_name }).link
                        //                 }
                        //             >
                        //                 {tCommon("see_2")}
                        //             </Button>
                        //         )}
                        //         {/* <MenuList
                        //             menuOpenButtonProps={{
                        //                 size: "small",
                        //                 iconId: "ri-more-2-line",
                        //                 iconPosition: "right",
                        //                 priority: "tertiary no outline",
                        //             }}
                        //             items={[
                        //                 {
                        //                     text: tCommon("delete"),
                        //                     iconId: "fr-icon-delete-line",
                        //                     onClick: () => {
                        //                         setCurrentUploadId(upload._id);
                        //                         confirmDialogModal.open();
                        //                     },
                        //                 },
                        //             ]}
                        //         /> */}
                        //     </>
                        // }
                    />
                ))}

            {totalPages > 1 && (
                <Pagination
                    defaultPage={page}
                    count={totalPages}
                    getPageLinkProps={(pageNumber: number) =>
                        routes.datastore_manage_storage({ datastoreId: datastore._id, limit, page: pageNumber, tab: DatastoreManageStorageTab.UPLOAD }).link
                    }
                />
            )}

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.upload.deletion.confirmation", {
                        uploadName: uploadListQuery.data?.find((upload) => upload._id === currentUploadId)?.name,
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
