import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useQuery } from "@tanstack/react-query";
import { FC, memo, ReactNode, useMemo, useRef } from "react";
import { useToggle } from "usehooks-ts";

import useDataUsesQuery from "@/hooks/queries/useDataUsesQuery";
import { DatastoreEndpoint, EndpointTypeEnum, OfferingTypeEnum, PyramidRaster, StoredDataStatusEnum } from "../../../../../../@types/app";
import StoredDataStatusBadge from "../../../../../../components/Utils/Badges/StoredDataStatusBadge";
import { useTranslation } from "../../../../../../i18n/i18n";
import RQKeys from "../../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../../router/router";
import api from "../../../../../api";
import ListItem from "../../ListItem";
import PyramidStoredDataDesc from "../PyramidStoredDataDesc";
import StoredDataDeleteConfirmDialog from "../StoredDataDeleteConfirmDialog";
import { PyramidRasterServiceChoiceDialog, type PyramidRasterServiceChoiceDialogOpenFn } from "./PyramidRasterServiceChoiceDialog";

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
    const { t } = useTranslation("PyramidRasterList");
    const { t: tCommon } = useTranslation("Common");

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

    const serviceChoiceDialogApiRef = useRef<{ open?: PyramidRasterServiceChoiceDialogOpenFn }>({});

    return (
        <>
            <ListItem
                actionButton={
                    <Button
                        onClick={async () => {
                            const openFn = serviceChoiceDialogApiRef.current.open;
                            if (openFn === undefined) return;

                            const { response: serviceType } = await openFn({
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
                                    routes.datastore_pyramid_raster_wms_raster_service_new({ datastoreId, pyramidId: pyramid._id, datasheetName }).push();
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
                }
                badge={<StoredDataStatusBadge status={pyramid.status} />}
                buttonTitle={t("show_linked_datas")}
                date={pyramid?.last_event?.date}
                menuListItems={[
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
                name={pyramid.name}
                showDescription={showDescription}
                toggleShowDescription={toggleShowDescription}
            >
                <PyramidStoredDataDesc datastoreId={datastoreId} pyramid={pyramid} dataUsesQuery={dataUsesQuery} />
            </ListItem>

            <PyramidRasterServiceChoiceDialog
                onRegister={({ open }) => {
                    serviceChoiceDialogApiRef.current.open = open;
                }}
            />

            <StoredDataDeleteConfirmDialog datastoreId={datastoreId} storedData={pyramid} datasheetName={datasheetName} modal={confirmRemovePyramidModal} />
        </>
    );
};

export default memo(PyramidRasterListItem);
