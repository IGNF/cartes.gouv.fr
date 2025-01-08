import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "mandatory_fields"
    | "form.error_title"
    | { K: "form.explanation"; P: { docsLinkProps: RegisteredLinkProps }; R: JSX.Element }
    | "form.email_contact"
    | "form.email_contact_hint"
    | "form.email_contact_mandatory_error"
    | "form.email_contact_error"
    | "form.lastName"
    | "form.firstName"
    | "form.organization"
    | "form.message"
    | "form.message_placeholder"
    | { K: "form.message_minlength_error"; P: { min: number }; R: string }
    | { K: "form.message_maxlength_error"; P: { max: number }; R: string }
    | { K: "remaining_characters"; P: { num: number }; R: string }
    | "message_sent"
    | "send"
    | { K: "form.infos"; P: { personalDataLinkProps: RegisteredLinkProps }; R: JSX.Element }
>()("Contact");
export type I18n = typeof i18n;

export const ContactFrTranslations: Translations<"fr">["Contact"] = {
    title: "Nous écrire",
    mandatory_fields: "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
    "form.error_title": "Votre message n'a pas pu être envoyé",
    "form.explanation": ({ docsLinkProps }) => (
        <>
            {"Vous n’avez pas trouvé la réponse à votre question dans "}
            <a {...docsLinkProps}>{"l’aide en ligne"}</a>
            {" ? Vous souhaitez la configuration d’un espace de travail pour vos besoins ? Utilisez ce formulaire pour nous contacter."}
        </>
    ),
    "form.email_contact": "Votre email",
    "form.email_contact_hint": "Format attendu : nom@domaine.fr",
    "form.email_contact_mandatory_error": "Veuillez saisir une adresse email",
    "form.email_contact_error": "Veuillez saisir une adresse email valide",
    "form.lastName": "Votre nom (optionnel)",
    "form.firstName": "Votre prénom (optionnel)",
    "form.organization": "Votre organisme (optionnel)",
    "form.message": "Votre demande",
    "form.message_placeholder": "Décrivez votre demande en quelques lignes",
    "form.message_minlength_error": ({ min }) => `Veuillez saisir une demande d’au moins ${min} caractères.`,
    "form.message_maxlength_error": ({ max }) => `Votre demande ne peut contenir que ${max} caractères.`,
    remaining_characters: ({ num }) => `${num} caractères restants`,
    message_sent: "Votre message est en cours d’envoi",
    send: "Envoyer",
    "form.infos": ({ personalDataLinkProps }) => (
        <>
            {"Les informations recueillies à partir de ce formulaire sont nécessaires à la gestion de votre demande par les services de l’IGN concernés. "}
            <a {...personalDataLinkProps}>{"En savoir plus sur la gestion des données à caractère personnel"}</a>.
        </>
    ),
};

export const ContactEnTranslations: Translations<"en">["Contact"] = {
    title: "Contact us",
    mandatory_fields: "All fields are mandatory unless label states “optional”",
    "form.error_title": "Your message could not be sent",
    "form.explanation": ({ docsLinkProps }) => (
        <>
            {"You did not find the answer to your question in "}
            <a {...docsLinkProps}>{"our documentation"}</a>
            {"? Do you want to configure a workspace for your needs? Use this form to contact us."}
        </>
    ),
    "form.email_contact": "Email",
    "form.email_contact_hint": "Expected format: name@domain.fr",
    "form.email_contact_mandatory_error": "Enter an email address",
    "form.email_contact_error": "Enter a valid email address",
    "form.lastName": "Last name (optional)",
    "form.firstName": "First name (optional)",
    "form.organization": "Organization (optional)",
    "form.message": "Message",
    "form.message_placeholder": "Describe your request in a few lines",
    "form.message_minlength_error": ({ min }) => `Message must be at least ${min} characters.`,
    "form.message_maxlength_error": ({ max }) => `Message cannot exceed ${max} characters.`,
    remaining_characters: ({ num }) => `${num} characters remaining`,
    message_sent: "Your message is being sent",
    send: "Send",
    "form.infos": ({ personalDataLinkProps }) => (
        <>
            {"The information collected from this form is necessary to process your request by the appropriate services at IGN. "}
            <a {...personalDataLinkProps}>{"Learn more about how personal data is stored and used"}</a>.
        </>
    ),
};