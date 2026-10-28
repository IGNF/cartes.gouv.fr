import { type DatastorePermission, OfferingStatusEnum, OfferingTypeEnum, StoredDataTypeEnum, type Service } from "@/@types/app";
import { OfferingStandardListResponseDtoStatusEnum } from "@/@types/entrepot";
import { routes } from "@/router/router";

/**
 * Indique si l'offering n'est plus diffusée (dépubliée ou en cours de dépublication) :
 * l'API Entrepôt refuse alors la plupart des opérations (édition, styles, permissions...).
 */
export const isOfferingUnavailable = (status: OfferingStatusEnum | OfferingStandardListResponseDtoStatusEnum): boolean =>
    [OfferingStatusEnum.UNPUBLISHING, OfferingStatusEnum.UNPUBLISHED].includes(status as OfferingStatusEnum);

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

/** Vignette du flux, écrite dans `extra._search.url_vignette` de la configuration */
export const getServiceThumbnailUrl = (service: Service): string | undefined => service.configuration.extra?._search?.url_vignette;

// une permission sans date de fin n’expire pas ; la liste de l’Entrepôt conserve les permissions expirées
const isPermissionActive = (permission: DatastorePermission, now: number): boolean => !permission.end_date || Date.parse(permission.end_date) > now;

/** Flux privé mais consultable par tous sur cartes.gouv.fr : une permission en cours est accordée à la communauté cartes.gouv.fr */
export const isPrivateServiceVisibleOnCartesGouv = (
    service: Service,
    permissions: DatastorePermission[] | undefined,
    cartesGouvCommunityId: string | null,
    now: number
): boolean => {
    if (service.open || !cartesGouvCommunityId) {
        return false;
    }
    return (permissions ?? []).some(
        (permission) =>
            permission.beneficiary?._id === cartesGouvCommunityId &&
            isPermissionActive(permission, now) &&
            permission.offerings.some((offering) => offering._id === service._id)
    );
};

/** Nom de couche sans le suffixe `_wms` ou `_wmts`, pour apparier un WMS et son WMTS */
export const getLayerBaseName = (layerName: string): string => layerName.replace(/_(wms|wmts)$/i, "");

// une offre WMTS-TMS dont le type de pyramide est inconnu est traitée comme un WMTS
const isWmtsService = (service: Service): boolean =>
    service.type === OfferingTypeEnum.WMTSTMS && service.configuration.pyramid?.type !== StoredDataTypeEnum.ROK4PYRAMIDVECTOR;

const getUsedStoredDataId = (service: Service): string | undefined => service.configuration.type_infos?.used_data?.[0]?.stored_data;

// base vecteur moissonnée pour calculer la pyramide raster (tag posé par cartes.gouv.fr à la génération)
const getHarvestedVectorDbId = (service: Service): string | undefined => {
    const pyramid = service.configuration.pyramid;
    return pyramid?.type === StoredDataTypeEnum.ROK4PYRAMIDRASTER ? pyramid.tags.vectordb_id : undefined;
};

/**
 * Un WMS a un WMTS « jumeau » quand un WMTS de la fiche diffuse la même donnée : même pyramide (WMS raster),
 * pyramide moissonnée depuis la même base vecteur (WMS vecteur), ou à défaut même nom au suffixe près
 * (pyramides calculées hors cartes.gouv.fr, sans tag `vectordb_id`).
 */
export const hasWmtsSibling = (service: Service, services: Service[]): boolean => {
    const baseName = getLayerBaseName(service.layer_name);
    const storedDataId = getUsedStoredDataId(service);
    return services.some((other) => {
        // un WMTS dépublié n’est plus une alternative de visualisation
        if (other._id === service._id || !isWmtsService(other) || isOfferingUnavailable(other.status)) {
            return false;
        }
        const sameData = storedDataId !== undefined && (getUsedStoredDataId(other) === storedDataId || getHarvestedVectorDbId(other) === storedDataId);
        return sameData || getLayerBaseName(other.layer_name) === baseName;
    });
};

export type ExploreMapsProtocol = "WMS" | "WMTS" | "TMS";

export const getExploreMapsProtocol = (service: Service): ExploreMapsProtocol | undefined => {
    switch (service.type) {
        case OfferingTypeEnum.WMSVECTOR:
        case OfferingTypeEnum.WMSRASTER:
            return "WMS";
        case OfferingTypeEnum.WMTSTMS:
            return isWmtsService(service) ? "WMTS" : "TMS";
        default:
            return undefined;
    }
};

/**
 * Paramètre `l` d’Explorer les cartes : `{couche}$GEOPORTAIL:{famille}:{protocole}(opacité;visible;gris)`.
 * La configuration geoportal-configuration enregistre les couches TMS sous la famille `GPP`, les WMS et WMTS sous `OGC`.
 */
export const getExploreMapsLayerParam = (service: Service): string | undefined => {
    const protocol = getExploreMapsProtocol(service);
    if (protocol === undefined) {
        return undefined;
    }
    const family = protocol === "TMS" ? "GPP" : "OGC";
    return `${service.layer_name}$GEOPORTAIL:${family}:${protocol}(1;1;0)`;
};

/** Délai de prise en compte d’un nouveau flux par la configuration d’Explorer les cartes, relancée toutes les heures */
export const EXPLORE_MAPS_CONFIGURATION_DELAY_MS = 90 * 60 * 1000;

export type ExploreMapsAvailability = "pending" | "available" | "unavailable";

type ExploreMapsAvailabilityParams = {
    service: Service;
    /** tous les flux de la fiche, pour détecter un WMTS de même nom */
    services: Service[];
    visibleOnCartesGouv: boolean;
    now?: number;
};

export const getExploreMapsAvailability = ({
    service,
    services,
    visibleOnCartesGouv,
    now = Date.now(),
}: ExploreMapsAvailabilityParams): ExploreMapsAvailability => {
    const protocol = getExploreMapsProtocol(service);
    if (protocol === undefined || isOfferingUnavailable(service.status)) {
        return "unavailable";
    }
    if (!service.open && !visibleOnCartesGouv) {
        return "unavailable";
    }
    if (protocol === "WMS" && hasWmtsSibling(service, services)) {
        return "unavailable";
    }
    return now - Date.parse(service.creation) < EXPLORE_MAPS_CONFIGURATION_DELAY_MS ? "pending" : "available";
};

/** Libellé court du type de flux tel qu’affiché dans les filtres (WMS-V et WMS-R confondus) */
export const getServiceTypeLabel = (service: Service): string => {
    switch (service.type) {
        case OfferingTypeEnum.WFS:
            return "WFS";
        case OfferingTypeEnum.WMSVECTOR:
        case OfferingTypeEnum.WMSRASTER:
            return "WMS";
        case OfferingTypeEnum.WMTSTMS:
            return isWmtsService(service) ? "WMTS" : "TMS";
        default:
            return service.type;
    }
};

/** Prochain instant où un flux de la liste sort du délai « En cours », undefined si aucun n’y est encore */
export const getNextExploreMapsPendingEnd = (services: Service[], now: number): number | undefined => {
    const ends = services
        .filter((service) => getExploreMapsProtocol(service) !== undefined)
        .map((service) => Date.parse(service.creation) + EXPLORE_MAPS_CONFIGURATION_DELAY_MS)
        .filter((end) => !Number.isNaN(end) && end > now);
    return ends.length > 0 ? Math.min(...ends) : undefined;
};
