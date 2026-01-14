import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "explanation"
    | "explanation_no_private_services"
    | "back_to_catalogue"
    | "form.layers.label"
    | "form.layers.error.at_least_one"
    | "form.beneficiaries.label"
    | "form.beneficiaries.hint"
    | "form.beneficiaries.error.at_least_one"
    | "form.message.label"
    | "form.message.hint"
    | "myself"
    | { K: "community"; P: { name: string }; R: string }
    | "send_request"
    | "sending_message"
    | "request_sent_successfully"
>()("AccessesRequest");
export type I18n = typeof i18n;

export const AccessesRequestFrTranslations: Translations<"fr">["AccessesRequest"] = {
    title: "Demande d’accès",
    explanation: "Demander un accès aux données et aux services de diffusion auprès du producteur",
    explanation_no_private_services:
        "Cette fiche ne décrit aucun service de diffusion dont l’accès est restreint. Vous avez déjà accès à toutes les données décrites.",
    back_to_catalogue: "Retour au catalogue de données",
    "form.layers.label": "Sélectionner les services",
    "form.layers.error.at_least_one": "Sélectionnez une donnée",
    "form.beneficiaries.label": "Bénéficiaires",
    "form.beneficiaries.hint": "Vous pouvez demander un accès pour vous ou pour tous les membres d’une de vos communautés.",
    "form.beneficiaries.error.at_least_one": "Sélectionner un bénéficiaire",
    "form.message.label": "Message (optionnel)",
    "form.message.hint": "Envoyez un message au producteur pour accompagner votre demande",
    myself: "Moi",
    community: ({ name }) => `${name}`,
    send_request: "Envoyer la demande",
    sending_message: "Votre message est en cours d’envoi ...",
    request_sent_successfully: "Votre demande a été envoyée au producteur. Vous avez reçu une confirmation de votre demande par courriel.",
};

export const AccessesRequestEnTranslations: Translations<"en">["AccessesRequest"] = {
    title: undefined,
    explanation: undefined,
    explanation_no_private_services: undefined,
    back_to_catalogue: undefined,
    "form.layers.label": undefined,
    "form.layers.error.at_least_one": undefined,
    "form.beneficiaries.label": undefined,
    "form.beneficiaries.hint": undefined,
    "form.beneficiaries.error.at_least_one": undefined,
    "form.message.label": undefined,
    "form.message.hint": undefined,
    myself: undefined,
    community: undefined,
    send_request: undefined,
    sending_message: undefined,
    request_sent_successfully: undefined,
};
