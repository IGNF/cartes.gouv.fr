import { OfferingTypeEnum, StoredDataTypeEnum, type Service } from "@/@types/app";
import { routes } from "@/router/router";

export const editableOfferingTypes: OfferingTypeEnum[] = [
    OfferingTypeEnum.WFS,
    OfferingTypeEnum.WMSVECTOR,
    OfferingTypeEnum.WMSRASTER,
    OfferingTypeEnum.WMTSTMS,
];

export function getServiceEditLink(datastoreId: string, datasheetName: string, service: Service) {
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
}

export const offeringTypeDisplayName = (type: OfferingTypeEnum): string => {
    switch (type) {
        case OfferingTypeEnum.WMSVECTOR:
            return "Web Map Service Vecteur";
        case OfferingTypeEnum.WFS:
            return "Web Feature Service";
        case OfferingTypeEnum.WMTSTMS:
            return "Web Map Tile Service - Tile Map Service";
        case OfferingTypeEnum.WMSRASTER:
            return "Web Map Service Raster";
        case OfferingTypeEnum.DOWNLOAD:
            return "Service de Téléchargement";
        case OfferingTypeEnum.ITINERARYISOCURVE:
            return "Service de calcul d’itinéraire / isochrone";
        case OfferingTypeEnum.ALTIMETRY:
            return "Service d’altimétrie";
        default:
            return type;
    }
};
