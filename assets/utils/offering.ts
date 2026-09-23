import { OfferingStatusEnum, OfferingTypeEnum } from "@/@types/app";
import { OfferingStandardListResponseDtoStatusEnum } from "@/@types/entrepot";

/**
 * Indique si l'offering n'est plus diffusée (dépubliée ou en cours de dépublication) :
 * l'API Entrepôt refuse alors la plupart des opérations (édition, styles, permissions...).
 */
export const isOfferingUnavailable = (status: OfferingStatusEnum | OfferingStandardListResponseDtoStatusEnum): boolean =>
    [OfferingStatusEnum.UNPUBLISHING, OfferingStatusEnum.UNPUBLISHED].includes(status as OfferingStatusEnum);

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
