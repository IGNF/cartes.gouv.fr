import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, memo, useMemo } from "react";
import { createPortal } from "react-dom";

import { PyramidVector, StoredDataStatusEnum } from "../../../../../../@types/app";
import StoredDataStatusBadge from "../../../../../../components/Utils/Badges/StoredDataStatusBadge";
import LoadingIcon from "../../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../../components/Utils/LoadingText";
import Wait from "../../../../../../components/Utils/Wait";
import useToggle from "../../../../../../hooks/useToggle";
import { getTranslation, useTranslation } from "../../../../../../i18n/i18n";
import RQKeys from "../../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../../router/router";
import { offeringTypeDisplayName } from "../../../../../../utils";
import api from "../../../../../api";
import PyramidStoredDataDesc from "../PyramidStoredDataDesc";
import ListItem from "../../ListItem";

type PyramidVectorListItemProps = {
    datasheetName: string;
    pyramid: PyramidVector;
    datastoreId: string;
};

const { t: tCommon } = getTranslation("Common");

const PyramidVectorListItem: FC<PyramidVectorListItemProps> = ({ datasheetName, datastoreId, pyramid }) => {
    const { t } = useTranslation("PyramidVectorList");

    const [showDescription, toggleShowDescription] = useToggle(false);

    const dataUsesQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data_uses(datastoreId, pyramid._id),
        queryFn: ({ signal }) => api.storedData.getUses(datastoreId, pyramid._id, { signal }),
        staleTime: 600000,
        enabled: showDescription,
    });

    /* Suppression de la pyramide */
    const queryClient = useQueryClient();

    const deletePyramidMutation = useMutation({
        mutationFn: () => api.storedData.remove(datastoreId, pyramid._id),
        onSuccess() {
            if (datasheetName) {
                queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            }
        },
    });

    const confirmRemovePyramidModal = useMemo(
        () =>
            createModal({
                id: `confirm-delete-pyramid-${pyramid._id}`,
                isOpenedByDefault: false,
            }),
        [pyramid._id]
    );

    return (
        <>
            <ListItem
                actionButton={
                    <Button
                        onClick={() => {
                            routes.datastore_pyramid_vector_tms_service_new({ datastoreId, pyramidId: pyramid._id, datasheetName }).push();
                        }}
                        className={fr.cx("fr-mr-2v")}
                        priority="secondary"
                        disabled={pyramid.status !== StoredDataStatusEnum.GENERATED}
                    >
                        {t("publish_tms_service")}
                    </Button>
                }
                badge={<StoredDataStatusBadge status={pyramid.status} />}
                buttonTitle={t("show_linked_datas")}
                date={pyramid?.last_event?.date}
                isSample={pyramid?.tags?.is_sample === "true"}
                menuListItems={[
                    {
                        text: t("show_details"),
                        iconId: "fr-icon-file-text-fill",
                        linkProps: routes.datastore_stored_data_details({ datastoreId, datasheetName, storedDataId: pyramid._id }).link,
                    },
                    {
                        text: tCommon("delete"),
                        iconId: "fr-icon-delete-line",
                        onClick: () => confirmRemovePyramidModal.open(),
                    },
                ]}
                name={pyramid.name}
                showDescription={showDescription}
                toggleShowDescription={toggleShowDescription}
            >
                <PyramidStoredDataDesc datastoreId={datastoreId} pyramid={pyramid} dataUsesQuery={dataUsesQuery} />
            </ListItem>

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
                <confirmRemovePyramidModal.Component
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
                    {dataUsesQuery.isFetching && <LoadingText withSpinnerIcon={true} />}

                    {dataUsesQuery.data?.offerings_list && dataUsesQuery.data?.offerings_list?.length > 0 && (
                        <div className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}>
                            <p className={fr.cx("fr-h6")}>{t("following_services_deleted")}</p>
                            <div className={fr.cx("fr-col")}>
                                <ul className={fr.cx("fr-raw-list")}>
                                    {dataUsesQuery.data?.offerings_list.map((offering, i) => (
                                        <li
                                            key={offering._id}
                                            className={fr.cx(i + 1 !== dataUsesQuery.data?.offerings_list.length && "fr-mb-2v", "fr-text--xs")}
                                        >
                                            {offering.layer_name}
                                            <Badge className={fr.cx("fr-ml-1v", "fr-text--xs")}>{offeringTypeDisplayName(offering.type)}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </confirmRemovePyramidModal.Component>,
                document.body
            )}
        </>
    );
};

export default memo(PyramidVectorListItem);
