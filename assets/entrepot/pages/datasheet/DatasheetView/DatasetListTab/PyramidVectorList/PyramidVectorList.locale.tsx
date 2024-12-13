import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "show_linked_datas"
    | "other_actions"
    | "show_details"
    | "publish_tms_service"
    | { K: "confirm_delete_modal.title"; P: { pyramidName: string }; R: string }
    | "following_services_deleted"
    | { K: "error_deleting"; P: { pyramidName: string }; R: string }
>()("PyramidVectorList");
export type I18n = typeof i18n;

export const PyramidVectorListFrTranslations: Translations<"fr">["PyramidVectorList"] = {
    show_linked_datas: "Voir les données liées",
    other_actions: "Autres actions",
    show_details: "Voir les détails",
    publish_tms_service: "Publier le service TMS",
    "confirm_delete_modal.title": ({ pyramidName }) => `Êtes-vous sûr de vouloir supprimer la pyramide ${pyramidName} ?`,
    following_services_deleted: "Les services suivants seront aussi supprimés :",
    error_deleting: ({ pyramidName }) => `La suppression de la pyramide ${pyramidName} a échoué`,
};

export const PyramidVectorListEnTranslations: Translations<"en">["PyramidVectorList"] = {
    show_linked_datas: "Show linked datas",
    other_actions: "Other actions",
    show_details: "Show details",
    publish_tms_service: "Publish TMS service",
    "confirm_delete_modal.title": ({ pyramidName }) => `Are you sure you want to delete pyramid ${pyramidName} ?`,
    following_services_deleted: "The following services will be deleted :",
    error_deleting: ({ pyramidName }) => `Deleting ${pyramidName} pyramid failed`,
};
