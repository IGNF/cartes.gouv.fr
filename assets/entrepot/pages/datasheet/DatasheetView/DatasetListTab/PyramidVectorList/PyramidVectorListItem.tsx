import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { FC, memo, useMemo } from "react";
import { useToggle } from "usehooks-ts";

import useDataUsesQuery from "@/hooks/queries/useDataUsesQuery";
import { PyramidVector, StoredDataStatusEnum } from "../../../../../../@types/app";
import StoredDataStatusBadge from "../../../../../../components/Utils/Badges/StoredDataStatusBadge";
import { getTranslation, useTranslation } from "../../../../../../i18n/i18n";
import { routes } from "../../../../../../router/router";
import ListItem from "../../ListItem";
import PyramidStoredDataDesc from "../PyramidStoredDataDesc";
import StoredDataDeleteConfirmDialog from "../StoredDataDeleteConfirmDialog";

type PyramidVectorListItemProps = {
    datasheetName: string;
    pyramid: PyramidVector;
    datastoreId: string;
};

const { t: tCommon } = getTranslation("Common");

const PyramidVectorListItem: FC<PyramidVectorListItemProps> = ({ datasheetName, datastoreId, pyramid }) => {
    const { t } = useTranslation("PyramidVectorList");

    const [showDescription, toggleShowDescription] = useToggle(false);

    const confirmRemovePyramidModal = useMemo(
        () =>
            createModal({
                id: `confirm-delete-pyramid-${pyramid._id}`,
                isOpenedByDefault: false,
            }),
        [pyramid._id]
    );
    const isOpenConfirmRemovePyramidModal = useIsModalOpen(confirmRemovePyramidModal);
    const dataUsesQuery = useDataUsesQuery(datastoreId, pyramid._id, {
        enabled: showDescription || isOpenConfirmRemovePyramidModal,
    });

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

            <StoredDataDeleteConfirmDialog datastoreId={datastoreId} storedData={pyramid} datasheetName={datasheetName} modal={confirmRemovePyramidModal} />
        </>
    );
};

export default memo(PyramidVectorListItem);
