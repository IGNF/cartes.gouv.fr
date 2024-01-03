import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import api from "../../../../api";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { Datastore, Upload } from "../../../../types/app";
import { niceBytes } from "../../../../utils";
import { CartesApiException } from "../../../../modules/jsonFetch";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";

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
                        <Button
                            key={upload._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => {
                                setCurrentUploadId(upload._id);
                                ConfirmDialogModal.open();
                            }}
                        >
                            {tCommon("delete")}
                        </Button>,
                    ])}
                />
            )}

            <ConfirmDialog
                onConfirm={() => {
                    if (currentUploadId !== undefined) {
                        deleteUploadMutation.mutate(currentUploadId);
                    }
                }}
                title={t("storage.upload.deletion.confirmation", {
                    uploadName: uploadListQuery.data?.find((upload) => upload._id === currentUploadId)?.name,
                    uploadId: currentUploadId,
                })}
            />
        </>
    );
};

export default UploadUsage;
