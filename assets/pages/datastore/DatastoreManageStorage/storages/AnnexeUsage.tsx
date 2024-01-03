import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import api from "../../../../api";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Annexe, Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type AnnexeUsageProps = {
    datastore: Datastore;
};
const AnnexeUsage: FC<AnnexeUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const annexeUsage = useMemo(() => {
        return datastore?.storages.annexe;
    }, [datastore]);

    const annexeListQuery = useQuery<Annexe[], CartesApiException>({
        queryKey: RQKeys.datastore_annexe_list(datastore._id),
        queryFn: ({ signal }) => api.annexe.getList(datastore._id, { signal }),
        staleTime: 60000,
    });

    const queryClient = useQueryClient();

    const [currentAnnexeId, setCurrentAnnexeId] = useState<string | undefined>();

    const deleteAnnexeMutation = useMutation({
        mutationFn: (annexeId: string) => api.annexe.remove(datastore._id, annexeId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_annexe_list(datastore._id), (annexesList: Annexe[]) => {
                return annexesList.filter((annexe) => annexe._id !== currentAnnexeId);
            });

            setCurrentAnnexeId(undefined);
        },
        onError() {
            setCurrentAnnexeId(undefined);
        },
    });

    return (
        <>
            <p>{t("storage.annexe.explanation")}</p>

            {annexeUsage ? (
                <Progress
                    label={`${niceBytes(annexeUsage.use.toString())} / ${niceBytes(annexeUsage.quota.toString())}`}
                    value={annexeUsage.use}
                    max={annexeUsage.quota}
                />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {annexeListQuery.isFetching && <LoadingText message={t("storage.annexe.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {annexeListQuery.error && <Alert severity="error" title={annexeListQuery.error.message} as="h2" closable onClose={annexeListQuery.refetch} />}

            {deleteAnnexeMutation.error && (
                <Alert severity="error" title={deleteAnnexeMutation.error.message} as="h2" closable onClose={annexeListQuery.refetch} />
            )}

            {annexeListQuery.data && annexeListQuery.data.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={annexeListQuery.data.map((annexe) => [
                        annexe.paths[0] ?? "",
                        annexe.mime_type,
                        annexe.size ? niceBytes(annexe.size?.toString()) : t("data.size.unknown"),
                        <Button
                            key={annexe._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => {
                                setCurrentAnnexeId(annexe._id);
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
                    if (currentAnnexeId !== undefined) {
                        deleteAnnexeMutation.mutate(currentAnnexeId);
                    }
                }}
                title={t("storage.annexe.deletion.confirmation", { annexeId: currentAnnexeId })}
            />

            {deleteAnnexeMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.annexe.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default AnnexeUsage;
