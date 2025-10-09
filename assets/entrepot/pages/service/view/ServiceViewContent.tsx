import { fr } from "@codegouvfr/react-dsfr";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { CartesStyle, OfferingTypeEnum, Service, StoredDataTypeEnum } from "@/@types/app";
import RMap from "@/components/Utils/RMap";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import getWebService from "@/modules/WebServices/WebServices";
import BaseLayer from "ol/layer/Base";
import ServiceShareInfo from "./ServiceShareInfo";
import StylesList from "./Style/StylesList";

type ServiceViewContent = {
    datastoreId: string;
    offeringId: string;
    datasheetName: string;
};

function ServiceViewContent(props: ServiceViewContent) {
    const { datastoreId, offeringId, datasheetName } = props;

    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: ({ signal }) => api.service.getService(datastoreId, offeringId, { signal }),
        staleTime: 60000,
    });

    const { data: service } = serviceQuery;

    const canManageStyles =
        serviceQuery.data?.type === OfferingTypeEnum.WFS ||
        (serviceQuery.data?.type === OfferingTypeEnum.WMTSTMS && serviceQuery.data.configuration.pyramid?.type === StoredDataTypeEnum.ROK4PYRAMIDVECTOR);

    const [olLayers, setOlLayers] = useState<BaseLayer[]>([]);
    useEffect(() => {
        if (!service) return;
        getWebService(service).getLayers().then(setOlLayers);
    }, [service]);

    const currentStyle: CartesStyle | undefined = (service?.configuration.styles ?? []).find((style) => style.current);

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                {serviceQuery.data && (
                    <Tabs
                        tabs={[
                            {
                                label: "Service",
                                content: <ServiceShareInfo service={serviceQuery.data} />,
                            },
                            {
                                label: "Styles",
                                disabled: !canManageStyles,
                                content: canManageStyles && (
                                    <StylesList service={serviceQuery.data} offeringId={offeringId} datastoreId={datastoreId} datasheetName={datasheetName} />
                                ),
                            },
                        ]}
                    />
                )}
            </div>
            <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                {service !== undefined && "bbox" in service.configuration.type_infos && service.configuration.type_infos.bbox !== undefined && (
                    <RMap layers={olLayers} currentStyle={currentStyle} type={service?.type} bbox={service.configuration.type_infos.bbox} />
                )}
            </div>
        </div>
    );
}

export default ServiceViewContent;
