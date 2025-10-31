import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import { createPortal } from "react-dom";

import type { Datastore, StaticFile } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";

const confirmDialogModal = createModal({
    id: "confirm-delete-statics-modal",
    isOpenedByDefault: false,
});

type StaticsUsageProps = {
    datastore: Datastore;
};

const StaticsUsage: FC<StaticsUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const queryClient = useQueryClient();

    const [currentStaticId, setCurrentStaticId] = useState<string | undefined>();

    const staticsListQuery = useQuery({
        queryKey: RQKeys.datastore_statics_list(datastore._id),
        queryFn: ({ signal }) => api.statics.getList(datastore._id, {}, { signal }),
    });

    const deleteStaticMutation = useMutation({
        mutationFn: (staticId: string) => api.statics.remove(datastore._id, staticId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_statics_list(datastore._id), (staticsList: StaticFile[]) => {
                return staticsList.filter((staticFile) => staticFile._id !== currentStaticId);
            });

            setCurrentStaticId(undefined);
        },
        onError() {
            setCurrentStaticId(undefined);
        },
    });

    return (
        <>
            <p>{t("storage.statics.explanation")}</p>

            {staticsListQuery.isFetching && <LoadingText message={t("storage.statics.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {staticsListQuery.error && <Alert severity="error" title={staticsListQuery.error.message} as="h2" closable onClose={staticsListQuery.refetch} />}

            {deleteStaticMutation.error && (
                <Alert severity="error" title={deleteStaticMutation.error.message} as="h2" closable onClose={staticsListQuery.refetch} />
            )}

            {staticsListQuery.data && staticsListQuery.data.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={staticsListQuery.data.map((staticFile) => [
                        staticFile.name,
                        staticFile.type,
                        <Button
                            key={staticFile._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => {
                                setCurrentStaticId(staticFile._id);
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
                    title={t("storage.statics.deletion.confirmation", { staticId: currentStaticId })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentStaticId !== undefined) {
                                    deleteStaticMutation.mutate(currentStaticId);
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

            {deleteStaticMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.statics.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default StaticsUsage;
