import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | { K: "explain"; P: { url: string }; R: JSX.Element }
    | "explain_no_access"
    | "back_to_dashboard"
    | "beneficiaries"
    | { K: "beneficiaries_hintext"; R: JSX.Element }
    | "myself"
    | { K: "community"; P: { name: string }; R: string }
    | "min_layers_error"
    | "sending_message"
>()("AccessesRequest");
export type I18n = typeof i18n;

export const AccessesRequestFrTranslations: Translations<"fr">["AccessesRequest"] = {
    title: "Demande d’accès",
    explain: ({ url }) => (
        <p>
            Vous souhaitez demander au producteur des données décrites sur cette <a href={url}>fiche du catalogue</a> un accès aux services de diffusion de
            données dont l&apos;accès est restreint. Sélectionnez les couches de données et types de services auxquels vous souhaitez accéder : (sélectionner au
            moins une couche)
        </p>
    ),
    explain_no_access: "Cette fiche ne décrit aucun service de diffusion dont l’accès est restreint. Vous avez déjà accès à toutes les données décrites.",
    back_to_dashboard: "Retour au tableau de bord",
    beneficiaries: "Bénéficiaires",
    beneficiaries_hintext: (
        <span>
            Vous pouvez demander au producteur des données de vous accorder une permission d&apos;accès personnelle ou
            <br />
            demander qu&apos;il accorde cette permission à tous les membres d&apos;une communauté à laquelle vous appartenez.
        </span>
    ),
    myself: "Moi-même",
    community: ({ name }) => `La communauté ${name}`,
    min_layers_error: "Vous devez sélectionner au moins une couche",
    sending_message: "Votre message est en cours d’envoi ...",
};

export const AccessesRequestEnTranslations: Translations<"en">["AccessesRequest"] = {
    title: undefined,
    explain: undefined,
    explain_no_access: undefined,
    back_to_dashboard: undefined,
    beneficiaries: "Bénéficiaries",
    beneficiaries_hintext: undefined,
    myself: "Myself",
    community: ({ name }) => `Community ${name}`,
    min_layers_error: undefined,
    sending_message: undefined,
};
