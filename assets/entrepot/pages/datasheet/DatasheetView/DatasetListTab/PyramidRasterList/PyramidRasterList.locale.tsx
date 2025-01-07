import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../../i18n/types";

const { i18n } = declareComponentKeys<
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
>()("PyramidRasterList");
export type I18n = typeof i18n;

export const PyramidRasterListFrTranslations: Translations<"fr">["PyramidRasterList"] = {
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

export const PyramidRasterListEnTranslations: Translations<"en">["PyramidRasterList"] = {
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
