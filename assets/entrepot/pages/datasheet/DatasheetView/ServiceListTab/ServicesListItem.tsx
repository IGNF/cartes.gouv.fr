import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";
import { useToggle } from "usehooks-ts";

import { OfferingStatusEnum, OfferingTypeEnum, StoredDataTypeEnum, type Service } from "../../../../../@types/app";
import OfferingStatusBadge from "../../../../../components/Utils/Badges/OfferingStatusBadge";
import Wait from "../../../../../components/Utils/Wait";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../router/router";
import { offeringTypeDisplayName } from "../../../../../utils";
import api from "../../../../api";
import ServiceDesc from "./ServiceDesc";
import ListItem from "../ListItem";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useSnackbarStore } from "@/stores/SnackbarStore";

type ServicesListItemProps = {
    service: Service;
    datastoreId: string;
    datasheetName: string;
};
const ServicesListItem: FC<ServicesListItemProps> = ({ service, datasheetName, datastoreId }) => {
    const queryClient = useQueryClient();
    const setMessage = useSnackbarStore((state) => state.setMessage);
    const { copied, copy } = useCopyToClipboard();

    const unpublishServiceConfirmModal = createModal({
        id: `unpublish-service-confirm-modal-${service._id}`,
        isOpenedByDefault: false,
    });

    const unpublishServiceMutation = useMutation({
        mutationFn: (service: Service) => {
            if (![OfferingTypeEnum.WFS, OfferingTypeEnum.WMSVECTOR, OfferingTypeEnum.WMSRASTER, OfferingTypeEnum.WMTSTMS].includes(service.type)) {
                console.warn(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
                return Promise.reject(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
            }

            return api.service.unpublishService(datastoreId, service._id);
        },
        onSettled() {
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
        },
    });

    const [showDescription, toggleShowDescription] = useToggle(false);

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
                        iconId: copied ? "fr-icon-check-line" : "ri-file-copy-line",
                        onClick: async () => {
                            if (!service.share_url) {
                                setMessage("URL de diffusion indisponible");
                            } else {
                                copy(service.share_url);
                            }
                        },
                    },
                    [OfferingTypeEnum.WFS, OfferingTypeEnum.WMTSTMS].includes(service.type) && {
                        text: "Gérer les styles",
                        iconId: "ri-flashlight-line",
                        linkProps: routes.datastore_service_view({ datastoreId, datasheetName, offeringId: service._id, activeTab: "styles" }).link,
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
                    [OfferingTypeEnum.WMSVECTOR, OfferingTypeEnum.WMSRASTER, OfferingTypeEnum.WFS, OfferingTypeEnum.WMTSTMS].includes(service.type) && {
                        text: "Modifier les informations de publication",
                        iconId: "ri-edit-box-line",
                        linkProps: (() => {
                            switch (service.type) {
                                case OfferingTypeEnum.WMSVECTOR:
                                    return routes.datastore_wms_vector_service_edit({
                                        datastoreId,
                                        vectorDbId: service.configuration.type_infos.used_data[0].stored_data,
                                        offeringId: service._id,
                                        datasheetName,
                                    }).link;

                                case OfferingTypeEnum.WMSRASTER:
                                    return routes.datastore_pyramid_raster_wms_raster_service_edit({
                                        datastoreId,
                                        pyramidId: service.configuration.type_infos.used_data[0].stored_data,
                                        offeringId: service._id,
                                        datasheetName,
                                    }).link;

                                case OfferingTypeEnum.WFS:
                                    return routes.datastore_wfs_service_edit({
                                        datastoreId,
                                        vectorDbId: service.configuration.type_infos.used_data[0].stored_data,
                                        offeringId: service._id,
                                        datasheetName,
                                    }).link;

                                case OfferingTypeEnum.WMTSTMS:
                                    switch (service.configuration.pyramid?.type) {
                                        case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
                                            return routes.datastore_pyramid_vector_tms_service_edit({
                                                datastoreId,
                                                pyramidId: service.configuration.type_infos.used_data[0].stored_data,
                                                offeringId: service._id,
                                                datasheetName,
                                            }).link;
                                        case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
                                            return routes.datastore_pyramid_raster_wmts_service_edit({
                                                datastoreId,
                                                pyramidId: service.configuration.type_infos.used_data[0].stored_data,
                                                offeringId: service._id,
                                                datasheetName,
                                            }).link;

                                        default:
                                            return routes.page_not_found().link;
                                    }

                                default:
                                    return routes.page_not_found().link;
                            }
                        })(),
                    },
                    service.type === OfferingTypeEnum.WMSVECTOR && {
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
                    {
                        text: "Dépublier",
                        iconId: "ri-arrow-go-back-line",
                        onClick: () => unpublishServiceConfirmModal.open(),
                    },
                ]}
                name={service.layer_name}
                open={service.open}
                showDescription={showDescription}
                showLock
                toggleShowDescription={toggleShowDescription}
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
        </>
    );
};
ServicesListItem.displayName = symToStr({ ServicesListItem });

export default ServicesListItem;
