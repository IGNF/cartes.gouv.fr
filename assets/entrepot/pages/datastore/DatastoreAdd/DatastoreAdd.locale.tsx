import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";

export const { i18n } = declareComponentKeys<
    | "title"
    | { K: "datastore_add_type"; P: { type: string }; R: string }
    | "mandatory_fields"
    | "disover_offers"
    | "is_sending"
    | "create_new.lead"
    | "create_new.form.name.label"
    | "create_new.form.name.error.required"
    | "create_new.form.name.error.min_length"
    | "create_new.form.offer.label"
    | "create_new.form.offer.error.required"
    | "create_new.form.offer.label.essential"
    | "create_new.form.offer.label.premium"
    | "create_new.form.information.label"
    | "create_new.form.information.hint"
    | "create_new.form.send.label"
    | "create_new.modal_success.title"
    | { K: "create_new.modal_success.request_sent"; P: { name: string }; R: JSX.Element }
    | "create_new.modal_success.acknowledgement_sent"
    | "join_existing.modal_success.title"
    | { K: "join_existing.modal_success.request_sent"; P: { name: string }; R: JSX.Element }
    | "join_existing.modal_success.acknowledgement_sent"
>()("DatastoreAdd");
export type I18n = typeof i18n;

export const DatastoreAddFrTranslations: Translations<"fr">["DatastoreAdd"] = {
    title: "Ajouter un entrepôt",
    datastore_add_type: ({ type }) => `${type === "create" ? "Créer un nouvel entrepôt" : type === "existing" ? "Rejoindre un entrepôt existant" : ""}`,
    mandatory_fields: "(*) Champs obligatoires",
    disover_offers: "Découvrir les offres",
    is_sending: "Votre demande est en cours d’envoi",
    "create_new.lead": "Demander un entrepôt pour stocker vos données, créer vos flux et configurer leur publication à travers cartes.gouv.",
    "create_new.form.name.label": "Nom de l’entrepôt*",
    "create_new.form.name.error.required": "Le nom de l’entrepôt est obligatoire",
    "create_new.form.name.error.min_length": "Le nom de l’entrepôt doit faire au minimum 10 caractères",
    "create_new.form.offer.label": "Offre*",
    "create_new.form.offer.error.required": "L’offre est obligatoire",
    "create_new.form.offer.label.essential": "Essentielle",
    "create_new.form.offer.label.premium": "Premium",
    "create_new.form.information.label": "Informations complémentaires",
    "create_new.form.information.hint":
        "Saisissez toute information que vous aimeriez porter à la connaissance des administrateurs et qui vous paraissent utiles dans le contexte de cette demande",
    "create_new.form.send.label": "Envoyer ma demande",
    "create_new.modal_success.title": "Créer un nouvel entrepôt",
    "create_new.modal_success.request_sent": ({ name }) => (
        <>
            Votre demande a bien été envoyée à nos services. L’entrepôt <strong>[{name}]</strong> sera prochainement ajouté à votre espace utilisateur.
        </>
    ),
    "create_new.modal_success.acknowledgement_sent": "Un accusé de réception a été envoyé à votre adresse email.",
    "join_existing.modal_success.title": "Rejoindre une communauté",
    "join_existing.modal_success.request_sent": ({ name }) => (
        <>
            Votre demande a bien été envoyée aux administrateurs de l’entrepôt <strong>[{name}]</strong>.
        </>
    ),
    "join_existing.modal_success.acknowledgement_sent": "Un accusé de réception a été envoyé à votre adresse email.",
};

export const DatastoreAddEnTranslations: Translations<"en">["DatastoreAdd"] = {
    title: undefined,
    datastore_add_type: undefined,
    mandatory_fields: undefined,
    disover_offers: undefined,
    is_sending: undefined,
    "create_new.lead": undefined,
    "create_new.form.name.label": undefined,
    "create_new.form.name.error.min_length": undefined,
    "create_new.form.name.error.required": undefined,
    "create_new.form.offer.label": undefined,
    "create_new.form.offer.error.required": undefined,
    "create_new.form.offer.label.essential": undefined,
    "create_new.form.offer.label.premium": undefined,
    "create_new.form.information.label": undefined,
    "create_new.form.information.hint": undefined,
    "create_new.form.send.label": undefined,
    "create_new.modal_success.title": undefined,
    "create_new.modal_success.request_sent": undefined,
    "create_new.modal_success.acknowledgement_sent": undefined,
    "join_existing.modal_success.title": undefined,
    "join_existing.modal_success.request_sent": undefined,
    "join_existing.modal_success.acknowledgement_sent": undefined,
};
