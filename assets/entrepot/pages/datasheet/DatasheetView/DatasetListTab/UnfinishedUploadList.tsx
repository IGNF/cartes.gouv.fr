import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, memo, useState } from "react";
import { symToStr } from "tsafe/symToStr";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";
import { routes } from "../../../../../router/router";
import { Upload } from "../../../../../@types/app";
import ReportStatusBadge from "../../../data_details/ReportTab/ReportStatusBadge";
import { deleteUploadConfirmModal } from "../DatasheetView/DatasheetView";
import Wait from "../../../../../components/Utils/Wait";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import { useTranslation } from "../../../../../i18n/i18n";

type UnfinishedUploadListProps = {
    datastoreId: string;
    uploadList?: Upload[];
    nbPublications: number;
};

const UnfinishedUploadList: FC<UnfinishedUploadListProps> = ({ datastoreId, uploadList, nbPublications }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const queryClient = useQueryClient();

    const isLastUpload = (uploadList: Upload[]): boolean => {
        return uploadList.length === 1 && nbPublications === 0;
    };

    const [currentUploadId, setCurrentUploadId] = useState<string | undefined>();

    const deleteUnfinishedUpload = useMutation({
        mutationFn: (uploadId: string) => api.upload.remove(datastoreId, uploadId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_upload_list(datastoreId), (uploadsList: Upload[]) => {
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
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={fr.cx("ri-upload-2-line")} />
                    &nbsp;Livraisons non terminées ({uploadList?.length ?? 0})
                </h5>
            </div>

            {uploadList?.map((upload) => {
                const integrationProgress = JSON.parse(upload.tags.integration_progress || "{}");
                const steps = Object.entries(integrationProgress);
                const failureCase = steps.some(([, status]) => status === "failed");

                return (
                    <div key={upload._id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                        <div className={fr.cx("fr-col")}>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                {upload.name}
                                {failureCase ? (
                                    <ReportStatusBadge status="FAILURE" className={fr.cx("fr-ml-2w")} />
                                ) : (
                                    <ReportStatusBadge status="WAITING" className={fr.cx("fr-ml-2w")} />
                                )}
                            </div>
                        </div>

                        <div className={fr.cx("fr-col")}>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                                {failureCase ? (
                                    <Button
                                        className={fr.cx("fr-mr-2w")}
                                        linkProps={
                                            routes.datastore_upload_details({
                                                datastoreId,
                                                uploadId: upload._id,
                                                datasheetName: upload.tags.datasheet_name,
                                            }).link
                                        }
                                    >
                                        {"Voir le rapport"}
                                    </Button>
                                ) : (
                                    <Button
                                        className={fr.cx("fr-mr-2w")}
                                        linkProps={
                                            routes.datastore_datasheet_upload_integration({
                                                datastoreId,
                                                uploadId: upload._id,
                                                datasheetName: upload.tags.datasheet_name,
                                            }).link
                                        }
                                    >
                                        {"Reprendre l'intégration"}
                                    </Button>
                                )}
                                <Button
                                    iconId="fr-icon-delete-fill"
                                    priority="secondary"
                                    onClick={() => {
                                        setCurrentUploadId(upload._id);
                                        if (isLastUpload(uploadList)) {
                                            deleteUploadConfirmModal.open();
                                        } else {
                                            deleteUnfinishedUpload.mutate(upload._id);
                                        }
                                    }}
                                >
                                    {"Supprimer"}
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
            {deleteUnfinishedUpload.isPending && (
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

UnfinishedUploadList.displayName = symToStr({ UnfinishedUploadList });

export default memo(UnfinishedUploadList);
