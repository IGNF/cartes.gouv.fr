import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import api from "../../../../api";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { routes } from "../../../../../router/router";
import { Datastore, Upload } from "../../../../../types/app";
import { niceBytes } from "../../../../../utils";

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

    const uploadUsage = useMemo(() => {
        return datastore?.storages.upload;
    }, [datastore]);

    const uploadListQuery = useQuery<Upload[], CartesApiException>({
        queryKey: RQKeys.datastore_upload_list(datastore._id),
        queryFn: ({ signal }) => api.upload.getList(datastore._id, undefined, { signal }),
        staleTime: 60000,
    });

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

            {uploadListQuery.data && uploadListQuery.data.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={uploadListQuery.data.map((upload) => [
                        upload.name,
                        t("upload.type.title", { type: upload.type }),
                        upload.size ? niceBytes(upload.size?.toString()) : t("data.size.unknown"),
                        upload?.tags?.datasheet_name && (
                            <Tag
                                key={`tag-upload-${upload._id}`}
                                linkProps={routes.datastore_datasheet_view({ datastoreId: datastore._id, datasheetName: upload.tags.datasheet_name }).link}
                            >
                                {upload.tags.datasheet_name}
                            </Tag>
                        ),
                        <Button
                            key={upload._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => {
                                setCurrentUploadId(upload._id);
                                confirmDialogModal.open();
                            }}
                        >
                            {tCommon("delete")}
                        </Button>,
                    ])}
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
