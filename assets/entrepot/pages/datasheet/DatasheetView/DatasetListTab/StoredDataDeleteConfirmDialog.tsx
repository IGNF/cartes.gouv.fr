import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";

import { DatasheetDetailed, StoredData, StoredDataTypeEnum } from "@/@types/app";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import useDataUsesQuery from "@/hooks/queries/useDataUsesQuery";
import useStoredDataUseProcessings from "@/hooks/queries/useStoredDataUseProcessings";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { offeringTypeDisplayName } from "@/utils";

type StoredDataDeleteConfirmDialogProps = {
    modal: ReturnType<typeof createModal>;
    datastoreId: string;
    storedData: StoredData;
    datasheetName: string;
};

function StoredDataDeleteConfirmDialog(props: StoredDataDeleteConfirmDialogProps) {
    const { modal, datastoreId, storedData, datasheetName } = props;

    const { t } = useTranslation("StoredDataDeleteConfirmDialog");
    const { t: tCommon } = useTranslation("Common");

    const isOpenModal = useIsModalOpen(modal);

    const dataUsesQuery = useDataUsesQuery(datastoreId, storedData._id, {
        enabled: isOpenModal,
    });
    const processingExecutionsQuery = useStoredDataUseProcessings(datastoreId, storedData._id, {
        enabled: isOpenModal,
    });
    const queryClient = useQueryClient();

    const deleteStoredDataMutation = useMutation({
        mutationFn: () => api.storedData.remove(datastoreId, storedData._id),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_datasheet(datastoreId, datasheetName), (oldDatasheet: DatasheetDetailed) => {
                const offeringsUsingStoredData = dataUsesQuery.data?.offerings_list.map((off) => off._id) ?? [];
                return {
                    ...oldDatasheet,
                    vector_db_list:
                        storedData.type === StoredDataTypeEnum.VECTORDB
                            ? oldDatasheet.vector_db_list?.filter((vdb) => vdb._id !== storedData._id)
                            : oldDatasheet.vector_db_list,
                    pyramid_raster_list:
                        storedData.type === StoredDataTypeEnum.ROK4PYRAMIDRASTER
                            ? oldDatasheet.pyramid_raster_list?.filter((pyr) => pyr._id !== storedData._id)
                            : oldDatasheet.pyramid_raster_list,
                    pyramid_vector_list:
                        storedData.type === StoredDataTypeEnum.ROK4PYRAMIDVECTOR
                            ? oldDatasheet.pyramid_vector_list?.filter((pyr) => pyr._id !== storedData._id)
                            : oldDatasheet.pyramid_vector_list,
                    service_list: oldDatasheet.service_list?.filter((service) => !offeringsUsingStoredData.includes(service._id)),
                } satisfies DatasheetDetailed;
            });

            dataUsesQuery.data?.offerings_list?.forEach((offering) => {
                queryClient.removeQueries({ queryKey: RQKeys.datastore_offering(datastoreId, offering._id) });
            });
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
        },
    });

    return (
        <>
            {deleteStoredDataMutation.error && (
                <Alert
                    title={t("error_deleting", { name: storedData.name, type: storedData.type })}
                    closable
                    description={deleteStoredDataMutation.error.message}
                    as="h2"
                    severity="error"
                />
            )}
            {deleteStoredDataMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{tCommon("removing")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            {createPortal(
                <modal.Component
                    title={t("confirm_delete_modal.title", { name: storedData.name, type: storedData.type })}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("delete"),
                            onClick: () => deleteStoredDataMutation.mutate(),
                            priority: "primary",
                            disabled: dataUsesQuery.isFetching || processingExecutionsQuery.isFetching,
                        },
                    ]}
                >
                    {(dataUsesQuery.isFetching || processingExecutionsQuery.isFetching) && <LoadingText withSpinnerIcon={true} as="p" />}

                    {processingExecutionsQuery?.data && processingExecutionsQuery?.data?.length > 0 && (
                        <div className={fr.cx("fr-grid-row")}>
                            <p>{t("processing_in_progress_deletion_warning")}</p>
                        </div>
                    )}

                    {dataUsesQuery.data?.offerings_list && dataUsesQuery.data?.offerings_list?.length > 0 && (
                        <div className={fr.cx("fr-grid-row")}>
                            <p className={fr.cx("fr-mb-1v")}>{t("following_services_deleted")}</p>

                            <ul className={fr.cx("fr-text--sm")}>
                                {dataUsesQuery.data?.offerings_list.map((offering) => (
                                    <li key={offering._id}>
                                        {offering.layer_name}
                                        <Badge>{offeringTypeDisplayName(offering.type)}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </modal.Component>,
                document.body
            )}
        </>
    );
}

export default StoredDataDeleteConfirmDialog;
