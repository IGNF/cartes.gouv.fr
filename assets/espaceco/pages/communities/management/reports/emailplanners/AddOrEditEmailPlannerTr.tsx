import { ReactNode } from "react";
import { CancelEventType, RecipientType, TriggerEventType } from "../../../../../../@types/espaceco";
import { declareComponentKeys, Translations } from "../../../../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { edit: boolean }; R: string }
    | "choose_email_type"
    | { K: "email_planner_type"; P: { type: string }; R: string }
    | { K: "trigger_event"; P: { event: TriggerEventType }; R: string }
    | { K: "cancel_event"; P: { event: CancelEventType }; R: string }
    | { K: "recipient"; P: { name: RecipientType }; R: string }
    | "dialog.title_1"
    | "dialog.trigger_event"
    | "dialog.themes"
    | "dialog.themes_hint"
    | "dialog.status"
    | "dialog.delay"
    | "dialog.delay_hint"
    | "dialog.title_2"
    | "dialog.cancel_event"
    | "dialog.cancel_event_hint"
    | "dialog.repeat"
    | "dialog.repeat_hint"
    | "dialog.recipients"
    | "dialog.title_4"
    | "dialog.title_4_explain"
    | "dialog.subject"
    | "dialog.body"
    | { K: "dialog.body_explain"; R: ReactNode }
    | "dialog.body.keywords"
    | "validation.subject.mandatory"
    | "validation.body.mandatory"
    | "validation.delay.mandatory"
    | "validation.delay.positive"
    | "validation.themes.mandatory"
    | "validation.condition.mandatory"
    | { K: "validation.error.email_not_valid"; P: { value: string }; R: string }
    | "validation.error.email.min"
>()("AddOrEditEmailPlanner");

export const AddOrEditEmailPlannerFrTranslations: Translations<"fr">["AddOrEditEmailPlanner"] = {
    title: ({ edit }) => `${edit ? "Modification de l'email de suivi" : "Ajout d'un email de suivi"}`,
    choose_email_type: "Choisir le type d’email de suivi à ajouter",
    email_planner_type: ({ type }) => `${type === "basic" ? "Email basique pré-configuré" : "Email personnel à configurer"}`,
    trigger_event: ({ event }) => {
        switch (event) {
            case "georem_created":
                return "Création d'un signalement";
            case "georem_status_changed":
                return "Modification du statut";
        }
    },
    cancel_event: ({ event }) => {
        switch (event) {
            case "none":
                return "Aucun";
            case "georem_status_changed":
                return "Modification du statut";
        }
    },
    recipient: ({ name }) => {
        switch (name) {
            case "Auteur":
                return "Auteur du signalement";
            case "Gestionnaire":
                return "Gestionnaire du guichet";
            case "Majec":
                return "Majec (collecteur IGN de la zone géographique dans laquelle se trouve le signalement)";
        }
    },
    "dialog.title_1": "Conditions d'envoi",
    "dialog.trigger_event": "Evénement déclencheur",
    "dialog.themes": "Thèmes",
    "dialog.themes_hint": "Si le signalement concerne un des thèmes (il est possible d'en sélectionner plusieurs)",
    "dialog.status": "Si le statut devient : ",
    "dialog.delay": "Délai (en jours après l'événement déclencheur)",
    "dialog.delay_hint": "Un email sera envoyé x jours plus tard (décalé si c'est un jour férié ou tombe un week-end).",
    "dialog.title_2": "Conditions d'annulation",
    "dialog.cancel_event": "Evénement annulateur",
    "dialog.cancel_event_hint": "Si cet événement se produit avant l'expiration du délai, l'envoi de l'email est annulé.",
    "dialog.repeat": "Répétition",
    "dialog.repeat_hint": "Si oui, le même email sera replanifié après envoi en appliquant le même délai",
    "dialog.recipients": "Destinataires de l'email",
    "dialog.title_4": "Contenu de l'email",
    "dialog.title_4_explain": "Ne pas mettre de formules de politesse, celles-ci seront ajoutées automatiquement lors de l'envoi.",
    "dialog.subject": "Sujet de l'email à envoyer",
    "dialog.body": "Corps de l'email à envoyer",
    "dialog.body_explain": (
        <>
            {
                "Cet espace permet de tester les fonctions d’alimentation et de diffusion de la Géoplateforme. Les services publiés dans cet espace ne sont pas visibles sur le catalogue."
            }
            <br />
            <br />
            {"Cliquez sur les mots clés pour insérer dans le corps de l'email"}
        </>
    ),
    "dialog.body.keywords": "Cliquez sur les mots clés pour insérer dans le corps de l'email",
    "validation.subject.mandatory": "Le sujet de l'email est obligatoire",
    "validation.body.mandatory": "Le corps de l'email est obligatoire",
    "validation.delay.mandatory": "Le délai est obligatoire",
    "validation.delay.positive": "Le délai doit être supérieur à 0",
    "validation.themes.mandatory": "Les thèmes sont obligatoires",
    "validation.condition.mandatory": "Vous devez sélectionner au moins un statut si l'évènement déclencheur est [Modification du statut]",
    "validation.error.email_not_valid": ({ value }) => `La chaîne ${value} n'est pas un email valide`,
    "validation.error.email.min": "Il doit y avoir au moins un email destinataire",
};

export const AddOrEditEmailPlannerEnTranslations: Translations<"en">["AddOrEditEmailPlanner"] = {
    title: ({ edit }) => `${edit}`,
    choose_email_type: undefined,
    email_planner_type: ({ type }) => `${type}`,
    trigger_event: ({ event }) => `${event}`,
    cancel_event: ({ event }) => `${event}`,
    recipient: ({ name }) => `${name}`,
    "dialog.title_1": undefined,
    "dialog.trigger_event": undefined,
    "dialog.themes": undefined,
    "dialog.themes_hint": undefined,
    "dialog.status": undefined,
    "dialog.delay": undefined,
    "dialog.delay_hint": undefined,
    "dialog.title_2": undefined,
    "dialog.cancel_event": undefined,
    "dialog.cancel_event_hint": undefined,
    "dialog.repeat": undefined,
    "dialog.repeat_hint": undefined,
    "dialog.recipients": undefined,
    "dialog.title_4": undefined,
    "dialog.title_4_explain": undefined,
    "dialog.subject": undefined,
    "dialog.body": undefined,
    "dialog.body_explain": undefined,
    "dialog.body.keywords": undefined,
    "validation.subject.mandatory": "Email subject is mandatory",
    "validation.body.mandatory": "Email body is mandatory",
    "validation.delay.mandatory": undefined,
    "validation.delay.positive": undefined,
    "validation.themes.mandatory": undefined,
    "validation.condition.mandatory": undefined,
    "validation.error.email_not_valid": ({ value }) => `String ${value} is not a valid email`,
    "validation.error.email.min": undefined,
};
