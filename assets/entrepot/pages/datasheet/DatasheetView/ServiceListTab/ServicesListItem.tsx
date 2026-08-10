import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useToggle } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { TextCopyToClipboardDialog, TextCopyToClipboardModal } from "@/components/Utils/TextCopyToClipboardDialog";
import useDatastoreMembership from "@/entrepot/hooks/useDatastoreMembership";
import { CartesApiException } from "@/modules/jsonFetch";
import { useSnackbarStore } from "@/stores/SnackbarStore";
import { OfferingStatusEnum, OfferingTypeEnum, StoredDataTypeEnum, type Service } from "../../../../../@types/app";
import OfferingStatusBadge from "@/entrepot/components/Badges/OfferingStatusBadge";
import Wait from "../../../../../components/Utils/Wait";
import RQKeys from "@/entrepot/modules/RQKeys";
import { offeringTypeDisplayName } from "../../../../../utils";
import api from "../../../../api";
import ListItem from "../ListItem";
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

    const unpublishServiceMutation = useMutation<null, CartesApiException, Service>({
        mutationFn: (service: Service) => {
            if (![OfferingTypeEnum.WFS, OfferingTypeEnum.WMSVECTOR, OfferingTypeEnum.WMSRASTER, OfferingTypeEnum.WMTSTMS].includes(service.type)) {
                console.warn(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
                return Promise.reject(`Dépublication de service ${service.type} n'a pas encore été implémentée`);
            }

            return api.service.unpublishService(datastoreId, service._id);
        },
        onSuccess() {
            queryClient.setQueryData(
                RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
                (servicesList: Service[] | undefined): Service[] | undefined => {
                    return servicesList?.filter((s) => s._id !== service._id);
                }
            );

            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName) });
        },
    });

    const [showDescription, toggleShowDescription] = useToggle();

    const membership = useDatastoreMembership();

    return (
        <>
            <ListItem
                actionButton={
                    <Button
                        className={fr.cx("fr-mr-2v")}
                        linkProps={{
                            to: "/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation",
                            params: { datastoreId, offeringId: service._id },
                            search: { datasheetName },
                        }}
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
                        membership?.can(CommunityMemberDtoRightsEnum.ANNEX, CommunityMemberDtoRightsEnum.BROADCAST) && {
                            text: "Gérer les styles",
                            iconId: "ri-flashlight-line",
                            linkProps: {
                                to: "/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation",
                                params: { datastoreId, offeringId: service._id },
                                search: { datasheetName },
                            },
                        },
                    // {
                    //     text: "Mettre à jour la légende",
                    //     iconId: "ri-list-check",
                    //     onClick: () => console.warn("Action non implémentée"),
                    // },
                    {
                        text: "Gérer les permissions d’accès",
                        iconId: "ri-lock-line",
                        linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/permissions", params: { datastoreId } },
                        disabled: service.open === true,
                    },
                    [OfferingTypeEnum.WMSVECTOR, OfferingTypeEnum.WMSRASTER, OfferingTypeEnum.WFS, OfferingTypeEnum.WMTSTMS].includes(service.type) &&
                        membership?.can(CommunityMemberDtoRightsEnum.BROADCAST) && {
                            text: "Modifier les informations de publication",
                            iconId: "ri-edit-box-line",
                            linkProps: (() => {
                                switch (service.type) {
                                    case OfferingTypeEnum.WMSVECTOR:
                                        return {
                                            to: "/tableau-de-bord/entrepots/$datastoreId/service/wms-vecteur/$offeringId/modification" as const,
                                            params: { datastoreId, offeringId: service._id },
                                            search: { vectorDbId: service.configuration.type_infos.used_data[0].stored_data, datasheetName },
                                        };

                                    case OfferingTypeEnum.WMSRASTER:
                                        return {
                                            to: "/tableau-de-bord/entrepots/$datastoreId/service/wms-raster/$offeringId/modification" as const,
                                            params: { datastoreId, offeringId: service._id },
                                            search: { pyramidId: service.configuration.type_infos.used_data[0].stored_data, datasheetName },
                                        };

                                    case OfferingTypeEnum.WFS:
                                        return {
                                            to: "/tableau-de-bord/entrepots/$datastoreId/service/wfs/$offeringId/modification" as const,
                                            params: { datastoreId, offeringId: service._id },
                                            search: { vectorDbId: service.configuration.type_infos.used_data[0].stored_data, datasheetName },
                                        };

                                    case OfferingTypeEnum.WMTSTMS:
                                        switch (service.configuration.pyramid?.type) {
                                            case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
                                                return {
                                                    to: "/tableau-de-bord/entrepots/$datastoreId/service/tms/$offeringId/modification" as const,
                                                    params: { datastoreId, offeringId: service._id },
                                                    search: { pyramidId: service.configuration.type_infos.used_data[0].stored_data, datasheetName },
                                                };
                                            case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
                                                return {
                                                    to: "/tableau-de-bord/entrepots/$datastoreId/service/wmts/$offeringId/modification" as const,
                                                    params: { datastoreId, offeringId: service._id },
                                                    search: { pyramidId: service.configuration.type_infos.used_data[0].stored_data, datasheetName },
                                                };

                                            default:
                                                return { to: "/404" as const };
                                        }

                                    default:
                                        return { to: "/404" as const };
                                }
                            })(),
                        },
                    service.type === OfferingTypeEnum.WMSVECTOR &&
                        membership?.can(CommunityMemberDtoRightsEnum.PROCESSING) && {
                            text: "Créer un service raster WMS/WMTS",
                            iconId: "ri-add-box-line",
                            linkProps: {
                                to: "/tableau-de-bord/entrepots/$datastoreId/pyramide-raster/ajout",
                                params: { datastoreId },
                                search: { offeringId: service._id, datasheetName },
                            },
                        },
                    // NOTE : reporté cf. issue #249
                    // {
                    //     text: "Remplacer les données",
                    //     iconId: "fr-icon-refresh-line",
                    //     onClick: () => console.warn("Action non implémentée"),
                    // },
                    membership?.can(CommunityMemberDtoRightsEnum.BROADCAST) && {
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
