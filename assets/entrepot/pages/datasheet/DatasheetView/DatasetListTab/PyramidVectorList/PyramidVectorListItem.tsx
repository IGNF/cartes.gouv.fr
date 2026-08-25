import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useToggle } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import { FC, memo, useMemo } from "react";

import useDataUsesQuery from "@/entrepot/hooks/queries/useDataUsesQuery";
import { DatasheetStoredDataItem, PyramidVector, StoredDataStatusEnum } from "../../../../../../@types/app";
import StoredDataStatusBadge from "@/entrepot/components/Badges/StoredDataStatusBadge";
import { getTranslation, useTranslation } from "../../../../../../i18n/i18n";
import ListItem from "../../ListItem";
import PyramidStoredDataDesc from "../PyramidStoredDataDesc";
import StoredDataDeleteConfirmDialog from "../StoredDataDeleteConfirmDialog";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import useDatastoreMembership from "@/entrepot/hooks/useDatastoreMembership";

type PyramidVectorListItemProps = {
    datasheetName: string;
    pyramid: DatasheetStoredDataItem<PyramidVector>;
    datastoreId: string;
};

const { t: tCommon } = getTranslation("Common");

const PyramidVectorListItem: FC<PyramidVectorListItemProps> = ({ datasheetName, datastoreId, pyramid }) => {
    const { t } = useTranslation("PyramidVectorList");

    const navigate = useNavigate();

    const [showDescription, toggleShowDescription] = useToggle();

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

    const membership = useDatastoreMembership();

    return (
        <>
            <ListItem
                actionButton={
                    membership?.can(CommunityMemberDtoRightsEnum.BROADCAST) && (
                        <Button
                            onClick={() => {
                                navigate({
                                    to: "/tableau-de-bord/entrepots/$datastoreId/service/tms/ajout",
                                    params: { datastoreId },
                                    search: { pyramidId: pyramid._id, datasheetName },
                                });
                            }}
                            className={fr.cx("fr-mr-2v")}
                            priority="secondary"
                            disabled={pyramid.status !== StoredDataStatusEnum.GENERATED}
                        >
                            {t("publish_tms_service")}
                        </Button>
                    )
                }
                badge={<StoredDataStatusBadge status={pyramid.status} />}
                buttonTitle={t("show_linked_datas")}
                date={pyramid?.last_event?.date}
                isSample={pyramid?.tags?.is_sample === "true"}
                menuListItems={[
                    {
                        text: t("show_details"),
                        iconId: "fr-icon-file-text-fill",
                        linkProps: {
                            to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$storedDataId/details",
                            params: { datastoreId, storedDataId: pyramid._id },
                            search: { datasheetName },
                        },
                    },
                    {
                        text: tCommon("delete"),
                        iconId: "fr-icon-delete-line",
                        onClick: () => confirmRemovePyramidModal.open(),
                    },
                ]}
                name={pyramid.name}
                showDescription={showDescription}
                toggleShowDescription={() => toggleShowDescription()}
            >
                <PyramidStoredDataDesc datastoreId={datastoreId} pyramid={pyramid} dataUsesQuery={dataUsesQuery} />
            </ListItem>

            <StoredDataDeleteConfirmDialog datastoreId={datastoreId} storedData={pyramid} datasheetName={datasheetName} modal={confirmRemovePyramidModal} />
        </>
    );
};

export default memo(PyramidVectorListItem);
