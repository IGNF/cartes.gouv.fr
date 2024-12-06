import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../i18n/types";

const { i18n } = declareComponentKeys<"title" | "description" | "back_to_home">()("LoginDisabled");
export type I18n = typeof i18n;

export const LoginDisabledFrTranslations: Translations<"fr">["LoginDisabled"] = {
    title: "Connexion momentanément désactivée",
    description:
        "L’accès à la partie connectée du site cartes.gouv.fr est temporairement indisponible en raison de travaux de maintenance de la Géoplateforme. Le reste du site reste accessible. Nous vous remercions de votre compréhension.",
    back_to_home: "Revenir à l’accueil",
};

export const LoginDisabledEnTranslations: Translations<"en">["LoginDisabled"] = {
    title: undefined,
    description: undefined,
    back_to_home: undefined,
};
