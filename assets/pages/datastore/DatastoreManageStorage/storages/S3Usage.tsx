import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import api from "../../../../api";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Datastore, StoredData } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

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

    const s3Usage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "S3");
    }, [datastore]);

    const storedDataListQuery = useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastore._id),
        queryFn: ({ signal }) => api.storedData.getList<StoredData[]>(datastore._id, undefined, { signal }),
        staleTime: 60000,
    });

    const storedDataListInS3 = useMemo(() => {
        return storedDataListQuery?.data?.filter((storedData) => storedData.storage.type === "S3") ?? [];
    }, [storedDataListQuery?.data]);

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

            {storedDataListInS3.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={storedDataListInS3.map((storedData) => [
                        storedData.name,
                        t("stored_data.type.title", { type: storedData.type }),
                        storedData.size ? niceBytes(storedData.size?.toString()) : t("data.size.unknown"),
                        <Button
                            key={storedData._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => {
                                setCurrentStoredDataId(storedData._id);
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
