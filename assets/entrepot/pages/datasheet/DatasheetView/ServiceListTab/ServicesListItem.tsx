import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import OfferingStatusBadge from "../../../../../components/Utils/Badges/OfferingStatusBadge";
import MenuList from "../../../../../components/Utils/MenuList";
import Wait from "../../../../../components/Utils/Wait";
import useToggle from "../../../../../hooks/useToggle";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../router/router";
import { useSnackbarStore } from "../../../../../stores/SnackbarStore";
import { OfferingStatusEnum, OfferingTypeEnum, type Service } from "../../../../../@types/app";
import { formatDateFromISO, offeringTypeDisplayName } from "../../../../../utils";
import api from "../../../../api";
import ServiceDesc from "./ServiceDesc";

type ServicesListItemProps = {
    service: Service;
    datastoreId: string;
    datasheetName: string;
};
const ServicesListItem: FC<ServicesListItemProps> = ({ service, datasheetName, datastoreId }) => {
    const queryClient = useQueryClient();

    const setMessage = useSnackbarStore((state) => state.setMessage);

    const unpublishServiceConfirmModal = createModal({
        id: `unpublish-service-confirm-modal-${service._id}`,
        isOpenedByDefault: false,
    });

    const unpublishServiceMutation = useMutation({
        mutationFn: (service: Service) => {
            if (![OfferingTypeEnum.WFS, OfferingTypeEnum.WMSVECTOR, OfferingTypeEnum.WMTSTMS].includes(service.type)) {
                console.warn(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
                return Promise.reject(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
            }

            return api.service.unpublishService(datastoreId, service._id);
        },
        onSettled() {
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_metadata_by_datasheet_name(datastoreId, datasheetName) });
        },
    });

    const [showDescription, toggleShowDescription] = useToggle(false);

    return (
        <>
            <div className={fr.cx("fr-p-2v", "fr-mt-2v")} style={{ backgroundColor: fr.colors.decisions.background.contrast.grey.default }}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col", "fr-col-md-4")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <Button
                                iconId={showDescription ? "ri-subtract-fill" : "ri-add-fill"}
                                size="small"
                                title="Voir les données liées"
                                className={fr.cx("fr-mr-2v")}
                                priority="secondary"
                                onClick={toggleShowDescription}
                            />
                            {service.layer_name}
                        </div>
                    </div>

                    <div className={fr.cx("fr-col", "fr-col-md-8")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <Badge>{offeringTypeDisplayName(service.type)}</Badge>
                            <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>
                                {service?.configuration?.last_event?.date && formatDateFromISO(service?.configuration?.last_event?.date)}
                            </p>
                            <OfferingStatusBadge status={service.status as OfferingStatusEnum} />
                            <i className={fr.cx("fr-mr-2v", service.open ? "fr-icon-lock-unlock-fill" : "fr-icon-lock-fill")} />

                            <Button
                                className={fr.cx("fr-mr-2v")}
                                linkProps={routes.datastore_service_view({ datastoreId, offeringId: service._id, datasheetName: datasheetName }).link}
                                priority="secondary"
                            >
                                Visualiser
                            </Button>
                            <MenuList
                                menuOpenButtonProps={{
                                    iconId: "fr-icon-menu-2-fill",
                                    title: "Autres actions",
                                    priority: "secondary",
                                }}
                                items={[
                                    {
                                        text: "Copier l’URL de diffusion",
                                        iconId: "ri-file-copy-2-line",
                                        onClick: async () => {
                                            if (!service.share_url) {
                                                setMessage("URL de diffusion indisponible");
                                            } else {
                                                await navigator.clipboard.writeText(service.share_url);

                                                setMessage("URL copiée");
                                            }
                                        },
                                    },
                                    [OfferingTypeEnum.WFS, OfferingTypeEnum.WMTSTMS].includes(service.type) && {
                                        text: "Gérer les styles",
                                        iconId: "ri-flashlight-line",
                                        linkProps: routes.datastore_service_view({ datastoreId, datasheetName, offeringId: service._id, activeTab: "styles" })
                                            .link,
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
                                    [OfferingTypeEnum.WMSVECTOR, OfferingTypeEnum.WMSRASTER, OfferingTypeEnum.WFS, OfferingTypeEnum.WMTSTMS].includes(
                                        service.type
                                    ) && {
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
                                                    return routes.datastore_pyramid_vector_tms_service_edit({
                                                        datastoreId,
                                                        pyramidId: service.configuration.type_infos.used_data[0].stored_data,
                                                        offeringId: service._id,
                                                        datasheetName,
                                                    }).link;

                                                default:
                                                    return {
                                                        onClick: () => console.warn("Action non implémentée"),
                                                    };
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
                            />
                        </div>
                    </div>
                </div>

                {showDescription && <ServiceDesc datastoreId={datastoreId} service={service} />}
            </div>

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
