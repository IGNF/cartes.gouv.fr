import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import api from "../../../../api";
import MenuList from "../../../../components/Utils/MenuList";
import Wait from "../../../../components/Utils/Wait";
import functions from "../../../../functions";
import RQKeys from "../../../../modules/RQKeys";
import { routes } from "../../../../router/router";
import { OfferingTypesEnum, type Service } from "../../../../types/app";
import { offeringTypeDisplayName } from "../../../../utils";

type ServicesListItemProps = {
    service: Service;
    datastoreId: string;
    datasheetName: string;
};
const ServicesListItem: FC<ServicesListItemProps> = ({ service, datasheetName, datastoreId }) => {
    const queryClient = useQueryClient();

    const unpublishServiceConfirmModal = createModal({
        id: `unpublish-service-confirm-modal-${service._id}`,
        isOpenedByDefault: false,
    });

    const unpublishServiceMutation = useMutation({
        mutationFn: (service: Service) => {
            switch (service.type) {
                case OfferingTypesEnum.WFS:
                    return api.service.unpublishWfs(datastoreId, service._id);
                case OfferingTypesEnum.WMSVECTOR:
                    return api.service.unpublishWmsVector(datastoreId, service._id);
                case OfferingTypesEnum.WMTSTMS:
                    return api.service.unpublishTms(datastoreId, service._id);

                default:
                    console.warn(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
                    return Promise.reject(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
            }
        },
        onSettled() {
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
        },
    });

    return (
        <>
            <div key={service._id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                <div className={fr.cx("fr-col", "fr-col-md-4")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <Button iconId="ri-add-box-fill" title="Voir les données liées" className={fr.cx("fr-mr-2v")} />
                        {service.configuration.name}
                    </div>
                </div>

                <div className={fr.cx("fr-col", "fr-col-md-8")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                        <Badge>{offeringTypeDisplayName(service.type)}</Badge>
                        <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>
                            {service?.configuration?.last_event?.date && functions.date.format(service?.configuration?.last_event?.date)}
                        </p>
                        <i className={fr.cx("fr-mr-2v", service.open ? "fr-icon-lock-unlock-fill" : "fr-icon-lock-fill")} />

                        <Button
                            className={fr.cx("fr-mr-2v")}
                            linkProps={routes.datastore_service_view({ datastoreId, offeringId: service._id, datasheetName: datasheetName }).link}
                        >
                            Visualiser
                        </Button>
                        <MenuList
                            menuOpenButtonProps={{
                                iconId: "fr-icon-menu-2-fill",
                                title: "Autres actions",
                            }}
                            items={[
                                {
                                    text: "Copier l'URL de diffusion",
                                    iconId: "ri-file-copy-2-line",
                                    onClick: () => console.warn("Action non implémentée"),
                                },
                                {
                                    text: "Gérer les styles",
                                    iconId: "ri-flashlight-line",
                                    onClick: () => console.warn("Action non implémentée"),
                                },
                                {
                                    text: "Mettre à jour la légende",
                                    iconId: "ri-list-check",
                                    onClick: () => console.warn("Action non implémentée"),
                                },
                                {
                                    text: "Modifier les informations de publication",
                                    iconId: "ri-edit-box-line",
                                    onClick: () => console.warn("Action non implémentée"),
                                },
                                {
                                    text: "Remplacer les données",
                                    iconId: "fr-icon-refresh-line",
                                    onClick: () => console.warn("Action non implémentée"),
                                },
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
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
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
