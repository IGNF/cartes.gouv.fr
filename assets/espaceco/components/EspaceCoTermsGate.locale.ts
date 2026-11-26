import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"page_title" | "title" | "description" | "accept">()("EspaceCoTermsGate");
export type I18n = typeof i18n;

export const EspaceCoTermsGateFrTranslations: Translations<"fr">["EspaceCoTermsGate"] = {
    page_title: "Contribuer aux données",
    title: "Conditions générales d’utilisation de l’espace collaboratif",
    description:
        "Pour contribuer aux données, vous devez d’abord accepter les conditions générales d’utilisation de l’espace collaboratif de l’IGN. Revenez sur cette page une fois que vous les avez acceptées.",
    accept: "Accepter les CGU",
};

export const EspaceCoTermsGateEnTranslations: Translations<"en">["EspaceCoTermsGate"] = {
    page_title: "Contribute to data",
    title: "Collaborative space terms of use",
    description:
        "To contribute to the data, you must first accept the terms of use of the IGN collaborative space. Come back to this page once you have accepted them.",
    accept: "Accept the terms of use",
};
