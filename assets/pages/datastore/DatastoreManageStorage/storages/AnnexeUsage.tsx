import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useMemo, useState } from "react";
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
import { Annexe, Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

const TAGS_PREFIX = {
    DATASHEET_NAME: "datasheet_name=",
    TYPE: "type=",
};

const confirmDialogModal = createModal({
    id: "confirm-delete-annexe-modal",
    isOpenedByDefault: false,
});

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
                        <ul key={`annexe-${annexe._id}-labels-list`} className={fr.cx("fr-tags-group")}>
                            {annexe.labels?.sort().map((label) => {
                                const key = `annexe-${annexe._id}-label-${label}`;
                                let tag: ReactNode = null;

                                const datasheetName = label.startsWith(TAGS_PREFIX.DATASHEET_NAME) ? label.replace(TAGS_PREFIX.DATASHEET_NAME, "") : undefined;
                                if (datasheetName !== undefined) {
                                    tag = <Tag linkProps={routes.datastore_datasheet_view({ datastoreId: datastore._id, datasheetName })}>{datasheetName}</Tag>;
                                }

                                const type = label.startsWith(TAGS_PREFIX.TYPE) ? label.replace(TAGS_PREFIX.TYPE, "") : undefined;
                                if (type !== undefined) {
                                    tag = <Tag>{t("storage.annexe.labels.type", { type })}</Tag>;
                                }

                                return <li key={key}>{tag ? tag : <Tag>{label}</Tag>}</li>;
                            })}
                        </ul>,
                        <Button
                            key={annexe._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => {
                                setCurrentAnnexeId(annexe._id);
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
                    title={t("storage.annexe.deletion.confirmation", { annexeId: currentAnnexeId })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentAnnexeId !== undefined) {
                                    deleteAnnexeMutation.mutate(currentAnnexeId);
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
