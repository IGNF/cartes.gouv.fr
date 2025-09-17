import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../../i18n/types";

const { i18n } = declareComponentKeys<"show_linked_datas" | "other_actions" | "show_details" | "publish_tms_service">()("PyramidVectorList");
export type I18n = typeof i18n;

export const PyramidVectorListFrTranslations: Translations<"fr">["PyramidVectorList"] = {
    show_linked_datas: "Voir les données liées",
    other_actions: "Autres actions",
    show_details: "Voir les détails",
    publish_tms_service: "Publier le service TMS",
};

export const PyramidVectorListEnTranslations: Translations<"en">["PyramidVectorList"] = {
    show_linked_datas: "Show linked datas",
    other_actions: "Other actions",
    show_details: "Show details",
    publish_tms_service: "Publish TMS service",
};
