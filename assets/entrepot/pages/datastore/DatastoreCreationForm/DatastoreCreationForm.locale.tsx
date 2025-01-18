import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "form.error_title"
    | "form.name"
    | "form.name_hint"
    | "form.name_error"
    | "form.name_minlength_error"
    | "form.information"
    | "form.information_hint"
    | "form.send"
    | "is_sending"
    | "email_support.heading"
    | "email_support.details"
    | "email_support.date"
    | "email_support.datastore_name"
    | "email_support.datastore_technical_name"
    | "email_support.is_member"
    | "email_support.is_supervisor"
    | "email_acknowledgement.heading"
    | "email_acknowledgement.message"
    | "request_confirmation.title"
    | "request_confirmation.success.title"
    | { K: "request_confirmation.success.description"; P: { homeLink: RegisteredLinkProps }; R: JSX.Element }
    | "request_confirmation.continue"
>()("DatastoreCreationForm");
export type I18n = typeof i18n;

export const DatastoreCreationFormFrTranslations: Translations<"fr">["DatastoreCreationForm"] = {
    title: "Demande de création d’un espace de travail",
    "form.error_title": "Votre message n’a pas pu être envoyé",
    "form.name": "Nom de l’espace de travail",
    "form.name_hint":
        "Ce nom vous permettra d’identifier l’espace de travail susceptible d’être partagé avec d’autres utilisateurs, soyez aussi clair que possible",
    "form.name_error": "Le nom de l’espace de travail est obligatoire",
    "form.name_minlength_error": "Le nom de l’espace de travail doit faire au minimum 10 caractères",
    "form.information": "Informations complémentaires (optionnel)",
    "form.information_hint":
        "Saisissez toute information que vous aimeriez porter à la connaissance des administrateurs et qui vous paraissent utiles dans le contexte de cette demande",
    "form.send": "Envoyer la demande",
    is_sending: "Votre demande est en cours d’envoi",
    "email_support.heading": "Un utilisateur a fait une demande de création d’un espace de travail",
    "email_support.details": "Détails de la demande",
    "email_support.date": "Date d’envoi",
    "email_support.datastore_name": "Nom de l’espace de travail",
    "email_support.datastore_technical_name": "Nom technique de l’espace de travail",
    "email_support.is_member": "L’utilisateur est un simple membre des communautés suivantes :",
    "email_support.is_supervisor": "L’utilisateur est superviseur des communautés suivantes :",
    "email_acknowledgement.heading":
        "Votre demande de création d’un espace de travail a été envoyée à l’IGN et une réponse vous sera apportée dans les meilleurs délais.",
    "email_acknowledgement.message": "Rappel de votre demande",
    "request_confirmation.title": "Demande envoyée",
    "request_confirmation.success.title": "Votre message a bien été envoyé",
    "request_confirmation.success.description": ({ homeLink }) => (
        <>
            Vous recevrez dans les prochaines minutes un accusé de réception récapitulant votre demande.
            <br />
            Cordialement, l’équipe de <a {...homeLink}>cartes.gouv.fr</a>.
        </>
    ),
    "request_confirmation.continue": "Poursuivre",
};

export const DatastoreCreationFormEnTranslations: Translations<"en">["DatastoreCreationForm"] = {
    title: undefined,
    "form.error_title": undefined,
    "form.name": undefined,
    "form.name_hint": undefined,
    "form.name_error": undefined,
    "form.name_minlength_error": undefined,
    "form.information": undefined,
    "form.information_hint": undefined,
    "form.send": undefined,
    is_sending: undefined,
    "email_support.heading": undefined,
    "email_support.details": undefined,
    "email_support.date": undefined,
    "email_support.datastore_name": undefined,
    "email_support.datastore_technical_name": undefined,
    "email_support.is_member": undefined,
    "email_support.is_supervisor": undefined,
    "email_acknowledgement.heading": undefined,
    "email_acknowledgement.message": undefined,
    "request_confirmation.title": undefined,
    "request_confirmation.success.title": undefined,
    "request_confirmation.success.description": undefined,
    "request_confirmation.continue": undefined,
};
