import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | "warning_no_themes"
    | "event_header"
    | "subject_header"
    | "body_header"
    | "delay_header"
    | "recipients_header"
    | "cancel_event_header"
    | "repeat_header"
    | "add"
    | "adding"
    | "modify"
    | "modifying"
    | "remove"
    | "removing"
    | "confirm_remove_title"
>()("EmailPlanners");
export type I18n = typeof i18n;

export const EmailPlannersFrTranslations: Translations<"fr">["EmailPlanners"] = {
    warning_no_themes: "Aucun thème personnalisé pour ce guichet, ajout d'email de suivi impossible",
    event_header: "Evénement déclencheur",
    subject_header: "Sujet de l’email",
    body_header: "Corps de l’email",
    delay_header: "Délai en jours (aprés l’évènement déclencheur)",
    recipients_header: "Destinataires",
    cancel_event_header: "Evénement annulateur",
    repeat_header: "Répétition",
    add: "Ajouter un email de suivi",
    adding: "Ajout de l'email de suivi en cours ...",
    modify: "Modifier l'email de suivi",
    modifying: "Modification de l'email de suivi en cours ...",
    remove: "Supprimer l'email de suivi",
    removing: "Suppression de l'email de suivi en cours ...",
    confirm_remove_title: "Êtes-vous sûr de vouloir supprimer cet email de suivi ?",
};

export const EmailPlannersEnTranslations: Translations<"en">["EmailPlanners"] = {
    warning_no_themes: undefined,
    event_header: undefined,
    subject_header: undefined,
    body_header: undefined,
    delay_header: undefined,
    recipients_header: undefined,
    cancel_event_header: undefined,
    repeat_header: undefined,
    add: undefined,
    adding: undefined,
    modify: undefined,
    modifying: undefined,
    remove: undefined,
    removing: undefined,
    confirm_remove_title: undefined,
};
