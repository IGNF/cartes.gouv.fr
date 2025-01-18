import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | { K: "community_technical_name"; P: { name?: string }; R: string }
    | "join"
    | { K: "modal.title"; P: { name?: string }; R: string }
    | "modal.message"
    | { K: "success_message.title"; P: { name?: string }; R: string }
    | "success_message.description"
>()("CommunityList");
export type I18n = typeof i18n;

export const CommunityListFrTranslations: Translations<"fr">["CommunityList"] = {
    title: "Rejoindre un espace de travail existant",
    community_technical_name: ({ name }) => `Nom technique : ${name}`,
    join: "Rejoindre",
    "modal.title": ({ name }) => `Votre demande à rejoindre ${name} a été envoyée.`,
    "modal.message": "Message (optionnel)",
    "success_message.title": ({ name }) => `Votre demande à rejoindre ${name} a été envoyée.`,
    "success_message.description": "Un accusé-réception vous a également été adressé.",
};

export const CommunityListEnTranslations: Translations<"en">["CommunityList"] = {
    title: undefined,
    community_technical_name: undefined,
    join: undefined,
    "modal.title": undefined,
    "modal.message": undefined,
    "success_message.title": undefined,
    "success_message.description": undefined,
};
