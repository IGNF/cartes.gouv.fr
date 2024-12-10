import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, memo, ReactNode, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { DatastoreEndpoint, EndpointTypeEnum, OfferingTypeEnum, PyramidRaster, StoredDataStatusEnum } from "../../../../../../@types/app";
import StoredDataStatusBadge from "../../../../../../components/Utils/Badges/StoredDataStatusBadge";
import LoadingIcon from "../../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../../components/Utils/LoadingText";
import MenuList from "../../../../../../components/Utils/MenuList";
import Wait from "../../../../../../components/Utils/Wait";
import useToggle from "../../../../../../hooks/useToggle";
import { declareComponentKeys, Translations, useTranslation } from "../../../../../../i18n/i18n";
import RQKeys from "../../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../../router/router";
import { formatDateFromISO, offeringTypeDisplayName } from "../../../../../../utils";
import api from "../../../../../api";
import PyramidStoredDataDesc from "../PyramidStoredDataDesc";
import { PyramidRasterServiceChoiceDialog, type PyramidRasterServiceChoiceDialogProps } from "./PyramidRasterServiceChoiceDialog";

const getHintText = (endpoints: DatastoreEndpoint[]): ReactNode => (
    <ul className={fr.cx("fr-raw-list")}>
        {endpoints.map((endpoint) => (
            <li
                key={endpoint.endpoint._id}
                style={isAvailable(endpoint) ? {} : { color: fr.colors.decisions.text.default.warning.default }}
            >{`${endpoint.quota - endpoint.use} publications possibles sur ${endpoint.endpoint.name}`}</li>
        ))}
    </ul>
);

const isAvailable = (endpoints: DatastoreEndpoint | DatastoreEndpoint[]): boolean => {
    if (!Array.isArray(endpoints)) {
        endpoints = [endpoints];
    }
    const availables = endpoints.reduce((accumulator, endpoint) => accumulator + (endpoint.quota - endpoint.use), 0);
    return availables !== 0;
};

type PyramidRasterListItemProps = {
    datasheetName: string;
    pyramid: PyramidRaster;
    datastoreId: string;
};

const PyramidRasterListItem: FC<PyramidRasterListItemProps> = ({ datasheetName, datastoreId, pyramid }) => {
    const { t } = useTranslation({ PyramidRasterListItem });
    const { t: tCommon } = useTranslation("Common");

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

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        retry: false,
        staleTime: 3600000,
    });
    const { wmsRasterEndpoints, wmtsEndpoints } = useMemo(() => {
        const wmsRasterEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.WMSRASTER)
            : [];

        const wmtsEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.WMTSTMS)
            : [];

        return { wmsRasterEndpoints, wmtsEndpoints };
    }, [endpointsQuery.data]);

    const serviceChoiceDialogActions = useRef<PyramidRasterServiceChoiceDialogProps["actions"]>({});

    return (
        <>
            <div className={fr.cx("fr-p-2v", "fr-mt-2v")} style={{ backgroundColor: fr.colors.decisions.background.contrast.grey.default }}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-my-2v")}>
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
                            <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>{pyramid?.last_event?.date && formatDateFromISO(pyramid?.last_event?.date)}</p>
                            <StoredDataStatusBadge status={pyramid.status} />
                            <Button
                                onClick={async () => {
                                    if (serviceChoiceDialogActions.current.open === undefined) return;

                                    const { response: serviceType } = await serviceChoiceDialogActions.current.open({
                                        title: t("choose_service_type"),
                                        options: [
                                            {
                                                id: OfferingTypeEnum.WMSRASTER,
                                                text: t("wms_raster_label"),
                                                hintText: (
                                                    <>
                                                        {t("wms_raster_hint_text")}
                                                        {getHintText(wmsRasterEndpoints)}
                                                    </>
                                                ),
                                                disabled: wmsRasterEndpoints.length === 0 || !isAvailable(wmsRasterEndpoints),
                                            },
                                            {
                                                id: OfferingTypeEnum.WMTSTMS,
                                                text: t("wmts_label"),
                                                hintText: (
                                                    <>
                                                        {t("wmts_hint_text")}
                                                        {getHintText(wmtsEndpoints)}
                                                    </>
                                                ),
                                                disabled: wmtsEndpoints.length === 0 || !isAvailable(wmtsEndpoints),
                                            },
                                        ],
                                    });

                                    if (serviceType === undefined) return;

                                    switch (serviceType) {
                                        case OfferingTypeEnum.WMSRASTER:
                                            routes
                                                .datastore_pyramid_raster_wms_raster_service_new({ datastoreId, pyramidId: pyramid._id, datasheetName })
                                                .push();
                                            break;
                                        case OfferingTypeEnum.WMTSTMS:
                                            routes.datastore_pyramid_raster_wmts_service_new({ datastoreId, pyramidId: pyramid._id, datasheetName }).push();
                                            break;
                                        default:
                                            throw new Error(`Publication ${serviceType} n'est pas encore implémentée`);
                                    }
                                }}
                                className={fr.cx("fr-mr-2v")}
                                priority="secondary"
                                disabled={pyramid.status !== StoredDataStatusEnum.GENERATED}
                            >
                                {t("publish_pyramid_raster")}
                            </Button>
                            <MenuList
                                menuOpenButtonProps={{
                                    iconId: "fr-icon-menu-2-fill",
                                    title: t("other_actions"),
                                    priority: "secondary",
                                }}
                                items={[
                                    {
                                        text: t("show_details"),
                                        iconId: "fr-icon-file-text-fill",
                                        linkProps: routes.datastore_stored_data_details({ datastoreId, storedDataId: pyramid._id }).link,
                                    },
                                    {
                                        text: tCommon("delete"),
                                        iconId: "fr-icon-delete-line",
                                        onClick: () => confirmRemovePyramidModal.open(),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
                {showDescription && <PyramidStoredDataDesc datastoreId={datastoreId} pyramid={pyramid} dataUsesQuery={dataUsesQuery} />}
            </div>
            <PyramidRasterServiceChoiceDialog actions={serviceChoiceDialogActions.current} />
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
                    {dataUsesQuery.isFetching && <LoadingText withSpinnerIcon={true} as="p" />}

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

export default memo(PyramidRasterListItem);

// traductions
export const { i18n } = declareComponentKeys<
    | "show_linked_datas"
    | "other_actions"
    | "show_details"
    | "publish_pyramid_raster"
    | "choose_service_type"
    | "wms_raster_label"
    | "wms_raster_hint_text"
    | "wmts_label"
    | "wmts_hint_text"
    | { K: "confirm_delete_modal.title"; P: { pyramidName: string }; R: string }
    | "following_services_deleted"
    | { K: "error_deleting"; P: { pyramidName: string }; R: string }
>()({
    PyramidRasterListItem,
});

export const PyramidRasterListItemFrTranslations: Translations<"fr">["PyramidRasterListItem"] = {
    show_linked_datas: "Voir les données liées",
    other_actions: "Autres actions",
    show_details: "Voir les détails",
    publish_pyramid_raster: "Publier",
    choose_service_type: "Choisir le service à configurer",
    wms_raster_hint_text:
        "Création puis publication d'images à partir d'une pyramide de tuiles raster. Ce service s'appuie sur le protocole WMS en version 1.3.0.",
    wms_raster_label: "Service d'images (Web Map Service - WMS)",
    wmts_hint_text: "Création puis publication d'images à partir d'une pyramide de tuiles raster. Ce service s'appuie sur le protocole WMTS en version 1.0.0.",
    wmts_label: "Services d'images tuilées (Web Map Tile Service - WMTS)",
    "confirm_delete_modal.title": ({ pyramidName }) => `Êtes-vous sûr de vouloir supprimer la pyramide ${pyramidName} ?`,
    following_services_deleted: "Les services suivants seront aussi supprimés :",
    error_deleting: ({ pyramidName }) => `La suppression de la pyramide ${pyramidName} a échoué`,
};

export const PyramidRasterListItemEnTranslations: Translations<"en">["PyramidRasterListItem"] = {
    show_linked_datas: "Show linked datas",
    other_actions: "Other actions",
    show_details: "Show details",
    publish_pyramid_raster: "Publish",
    choose_service_type: "Define service to create",
    wms_raster_hint_text: undefined,
    wms_raster_label: undefined,
    wmts_hint_text: undefined,
    wmts_label: undefined,
    "confirm_delete_modal.title": ({ pyramidName }) => `Are you sure you want to delete pyramid ${pyramidName} ?`,
    following_services_deleted: "The following services will be deleted :",
    error_deleting: ({ pyramidName }) => `Deleting ${pyramidName} pyramid failed`,
};
