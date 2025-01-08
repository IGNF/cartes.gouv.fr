import { declareComponentKeys, Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<"title" | "name" | "name_hint">()("CreateCommunityDialog");

export const CreateCommunityDialogFrTranslations: Translations<"fr">["CreateCommunityDialog"] = {
    title: "Création d'un guichet",
    name: "Nom",
    name_hint: "Donnez un nom clair et compréhensible",
};

export const CreateCommunityDialogEnTranslations: Translations<"en">["CreateCommunityDialog"] = {
    title: undefined,
    name: undefined,
    name_hint: undefined,
};
