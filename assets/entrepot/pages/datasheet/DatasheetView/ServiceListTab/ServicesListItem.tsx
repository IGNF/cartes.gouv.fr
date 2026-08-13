import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useToggle } from "@mantine/hooks";
import { FC } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { TextCopyToClipboardDialog, TextCopyToClipboardModal } from "@/components/Utils/TextCopyToClipboardDialog";
import useCommunityRights from "@/hooks/useCommunityRights";
import useUnpublishServiceMutation from "@/hooks/queries/useUnpublishServiceMutation";
import { useSnackbarStore } from "@/stores/SnackbarStore";
import { OfferingStatusEnum, OfferingTypeEnum, type Service } from "../../../../../@types/app";
import OfferingStatusBadge from "../../../../../components/Utils/Badges/OfferingStatusBadge";
import Wait from "../../../../../components/Utils/Wait";
import { routes } from "../../../../../router/router";
import { editableOfferingTypes, getServiceEditLink, offeringTypeDisplayName } from "../../../../../utils";
import ListItem from "../ListItem";
import ServiceDesc from "./ServiceDesc";

type ServicesListItemProps = {
    service: Service;
    datastoreId: string;
    datasheetName: string;
};
const ServicesListItem: FC<ServicesListItemProps> = ({ service, datasheetName, datastoreId }) => {
    const setMessage = useSnackbarStore((state) => state.setMessage);

    const unpublishServiceConfirmModal = createModal({
        id: `unpublish-service-confirm-modal-${service._id}`,
        isOpenedByDefault: false,
    });

    const unpublishServiceMutation = useUnpublishServiceMutation(datastoreId, datasheetName);

    const [showDescription, toggleShowDescription] = useToggle();

    const { userRights, isSupervisor } = useCommunityRights();

    return (
        <>
            <ListItem
                actionButton={
                    <Button
                        className={fr.cx("fr-mr-2v")}
                        linkProps={routes.datastore_service_view({ datastoreId, offeringId: service._id, datasheetName: datasheetName }).link}
                        priority="secondary"
                    >
                        Visualiser
                    </Button>
                }
                badge={<OfferingStatusBadge status={service.status as OfferingStatusEnum} />}
                buttonTitle="Voir les données liées"
                date={service?.configuration?.last_event?.date}
                menuListItems={[
                    {
                        autoClose: false,
                        text: "Copier l’URL de diffusion",
                        iconId: "ri-file-copy-line",
                        onClick: async () => {
                            if (!service.share_url) {
                                setMessage("URL de diffusion indisponible");
                            } else {
                                TextCopyToClipboardModal.open();
                            }
                        },
                    },
                    [OfferingTypeEnum.WFS, OfferingTypeEnum.WMTSTMS].includes(service.type) &&
                        (isSupervisor ||
                            (userRights?.includes(CommunityMemberDtoRightsEnum.ANNEX) && userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST))) && {
                            text: "Gérer les styles",
                            iconId: "ri-flashlight-line",
                            linkProps: routes.datastore_service_view({ datastoreId, datasheetName, offeringId: service._id }).link,
                        },
                    // {
                    //     text: "Mettre à jour la légende",
                    //     iconId: "ri-list-check",
                    //     onClick: () => console.warn("Action non implémentée"),
                    // },
                    {
                        text: "Gérer les permissions d’accès",
                        iconId: "ri-lock-line",
                        linkProps: routes.datastore_manage_permissions({ datastoreId }).link,
                        disabled: service.open === true,
                    },
                    editableOfferingTypes.includes(service.type) &&
                        (isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST)) && {
                            text: "Modifier les informations de publication",
                            iconId: "ri-edit-box-line",
                            linkProps: getServiceEditLink(datastoreId, datasheetName, service),
                        },
                    service.type === OfferingTypeEnum.WMSVECTOR &&
                        (isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.PROCESSING)) && {
                            text: "Créer un service raster WMS/WMTS",
                            iconId: "ri-add-box-line",
                            linkProps: routes.datastore_pyramid_raster_generate({ datastoreId, offeringId: service._id, datasheetName }).link,
                        },
                    // NOTE : reporté cf. issue #249
                    // {
                    //     text: "Remplacer les données",
                    //     iconId: "fr-icon-refresh-line",
                    //     onClick: () => console.warn("Action non implémentée"),
                    // },
                    (isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST)) && {
                        text: "Dépublier",
                        iconId: "ri-arrow-go-back-line",
                        onClick: () => unpublishServiceConfirmModal.open(),
                    },
                ]}
                name={service.layer_name}
                open={service.open}
                showDescription={showDescription}
                showLock
                toggleShowDescription={() => toggleShowDescription()}
                type={offeringTypeDisplayName(service.type)}
            >
                <ServiceDesc datastoreId={datastoreId} service={service} />
            </ListItem>

            {createPortal(
                <unpublishServiceConfirmModal.Component
                    title={`Êtes-vous sûr de dépublier le service ${service.type} ?`}
                    buttons={[
                        {
                            children: "Non, annuler",
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: "Oui, dépublier",
                            onClick: () => unpublishServiceMutation.mutate(service),
                            doClosesModal: true,
                            priority: "primary",
                        },
                    ]}
                >
                    <strong>Les éléments suivants seront supprimés :</strong>
                    <ul>
                        <li>1 offre ({service._id})</li>
                        <li>1 configuration ({service.configuration._id})</li>
                    </ul>
                </unpublishServiceConfirmModal.Component>,
                document.body
            )}

            {unpublishServiceMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>En cours de dépublication</h6>
                        </div>
                    </div>
                </Wait>
            )}

            {unpublishServiceMutation.error && <Alert severity="error" closable title={unpublishServiceMutation.error.message} />}

            {service.share_url && <TextCopyToClipboardDialog title="Copier l'URL" label="URL de diffusion" text={service.share_url} />}
        </>
    );
};
ServicesListItem.displayName = symToStr({ ServicesListItem });

export default ServicesListItem;
