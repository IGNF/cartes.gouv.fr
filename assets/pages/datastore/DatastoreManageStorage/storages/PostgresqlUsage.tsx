import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Table } from "@codegouvfr/react-dsfr/Table";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, memo, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import api from "../../../../api";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import { Datastore, StoredData, StoredDataTypeEnum, VectorDb } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

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

    const pgUsage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "POSTGRESQL");
    }, [datastore]);

    const storedDataListQuery = useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastore._id),
        queryFn: ({ signal }) => api.storedData.getList<StoredData[]>(datastore._id, undefined, { signal }),
        staleTime: 60000,
    });

    const vectorDbList: VectorDb[] = useMemo(() => {
        return (storedDataListQuery?.data?.filter((storedData) => storedData.type === StoredDataTypeEnum.VECTORDB) as VectorDb[]) ?? [];
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
            <p>{t("storage.postgresql.explanation")}</p>

            {pgUsage ? (
                <Progress label={`${niceBytes(pgUsage.use.toString())} / ${niceBytes(pgUsage.quota.toString())}`} value={pgUsage.use} max={pgUsage.quota} />
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

            {vectorDbList.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={vectorDbList.map((vectorDb) => [
                        vectorDb.name,
                        t("stored_data.type.title", { type: vectorDb.type }),
                        vectorDb.size ? niceBytes(vectorDb.size?.toString()) : t("data.size.unknown"),
                        vectorDb?.tags?.datasheet_name && (
                            <Tag
                                key={`tag-pg-${vectorDb._id}`}
                                linkProps={routes.datastore_datasheet_view({ datastoreId: datastore._id, datasheetName: vectorDb.tags.datasheet_name }).link}
                            >
                                {vectorDb.tags.datasheet_name}
                            </Tag>
                        ),
                        <Button
                            key={vectorDb._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => {
                                setCurrentStoredDataId(vectorDb._id);
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
