import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC, memo } from "react";

import Wait from "../../../../../components/Utils/Wait";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import MenuList from "../../../../../components/Utils/MenuList";
import StoredDataStatusBadge from "../../../../../components/Utils/StoredDataStatusBadge";
import functions from "../../../../../functions";
import useToggle from "../../../../../hooks/useToggle";
import { routes } from "../../../../../router/router";
import { DatasheetDetailed, Pyramid, StoredDataStatusEnum } from "../../../../../types/app";
import PyramidDesc from "./PyramidDesc";
import { Translations, declareComponentKeys, getTranslation, useTranslation } from "../../../../../i18n/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import RQKeys from "../../../../../modules/RQKeys";
import api from "../../../../../api";

import { createPortal } from "react-dom";

type PyramidListItemProps = {
    datasheetName?: string;
    pyramid: Pyramid;
    datastoreId: string;
};

const confirmDialogModal = createModal({
    id: "confirm-delete-pyramid",
    isOpenedByDefault: false,
});

const { t: tCommon } = getTranslation("Common");

const PyramidListItem: FC<PyramidListItemProps> = ({ datasheetName, datastoreId, pyramid }) => {
    const { t } = useTranslation({ PyramidListItem });

    const [showDescription, toggleShowDescription] = useToggle(false);

    /* Suppression de la pyramide */
    const queryClient = useQueryClient();

    const deletePyramidMutation = useMutation({
        mutationFn: () => api.storedData.remove(datastoreId, pyramid._id),
        onSuccess() {
            if (datasheetName) {
                queryClient.setQueryData(RQKeys.datastore_datasheet(datastoreId, datasheetName), (datasheet: DatasheetDetailed) => {
                    return datasheet.pyramid_list?.filter((storedData) => storedData._id !== pyramid._id);
                });
            }
        },
    });

    return (
        <>
            <div className={fr.cx("fr-p-2v", "fr-mt-2v")} style={{ backgroundColor: fr.colors.decisions.background.contrast.grey.default }}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <Button
                                iconId={showDescription ? "ri-subtract-fill" : "ri-add-fill"}
                                size="small"
                                title={t("show_linked_datas")}
                                className={fr.cx("fr-mr-2v")}
                                priority="secondary"
                                onClick={toggleShowDescription}
                            />
                            {pyramid.name}
                        </div>
                    </div>

                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>{pyramid?.last_event?.date && functions.date.format(pyramid?.last_event?.date)}</p>
                            <StoredDataStatusBadge status={pyramid.status} />
                            <Button
                                onClick={() => {
                                    routes.datastore_tms_vector_service_new({ datastoreId, pyramidId: pyramid._id }).push();
                                }}
                                className={fr.cx("fr-mr-2v")}
                                priority="secondary"
                                disabled={pyramid.status !== StoredDataStatusEnum.GENERATED}
                            >
                                {t("publish_tms_service")}
                            </Button>
                            <MenuList
                                menuOpenButtonProps={{
                                    iconId: "fr-icon-menu-2-fill",
                                    title: t("other_actions"),
                                    priority: "secondary",
                                }}
                                // disabled={pyramid.status !== StoredDataStatuses.GENERATED}
                                items={[
                                    {
                                        text: t("show_details"),
                                        iconId: "fr-icon-file-text-fill",
                                        linkProps: routes.datastore_stored_data_report({ datastoreId, storedDataId: pyramid._id }).link,
                                    },
                                    {
                                        text: tCommon("delete"),
                                        iconId: "fr-icon-delete-line",
                                        onClick: () => confirmDialogModal.open(),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
                {showDescription && <PyramidDesc pyramid={pyramid} datastoreId={datastoreId} />}
            </div>
            {deletePyramidMutation.error && (
                <Alert
                    title={t("error_deleting", { pyramidName: pyramid.name })}
                    closable
                    description={deletePyramidMutation.error.message}
                    as="h2"
                    severity="error"
                />
            )}
            {deletePyramidMutation.isPending && (
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
                <confirmDialogModal.Component
                    title={t("confirm_delete_modal.title", { pyramidName: pyramid.name })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => deletePyramidMutation.mutate(),
                            priority: "primary",
                        },
                    ]}
                >
                    <div />
                </confirmDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export default memo(PyramidListItem);

// traductions
export const { i18n } = declareComponentKeys<
    | "show_linked_datas"
    | "other_actions"
    | "show_details"
    | "publish_tms_service"
    | { K: "confirm_delete_modal.title"; P: { pyramidName: string }; R: string }
    | { K: "error_deleting"; P: { pyramidName: string }; R: string }
>()({
    PyramidListItem,
});

export const PyramidListItemFrTranslations: Translations<"fr">["PyramidListItem"] = {
    show_linked_datas: "Voir les données liées",
    other_actions: "Autres actions",
    show_details: "Voir les détails",
    publish_tms_service: "Publier le service TMS",
    "confirm_delete_modal.title": ({ pyramidName }) => `Êtes-vous sûr de vouloir supprimer la pyramide ${pyramidName} ?`,
    error_deleting: ({ pyramidName }) => `La suppression de la pyramide ${pyramidName} a échoué`,
};

export const PyramidListItemEnTranslations: Translations<"en">["PyramidListItem"] = {
    show_linked_datas: "Show linked datas",
    other_actions: "Other actions",
    show_details: "Show details",
    publish_tms_service: "Publish TMS service",
    "confirm_delete_modal.title": ({ pyramidName }) => `Are you sure you want to delete pyramid ${pyramidName} ?`,
    error_deleting: ({ pyramidName }) => `Deleting ${pyramidName} pyramid failed`,
};
