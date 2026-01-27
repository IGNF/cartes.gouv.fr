import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datastoreName?: string }; R: string | undefined }
    | "section_title"
    | "form.name.label"
    | "form.name.error.required"
    | "form.desc.label"
    | "form.desc.hint"
    | "form.desc.info_max_length"
    | "form.contact.label"
    | "form.contact.hint"
    | "form.contact.error.required"
    | "form.contact.error.invalid_email"
    | "form.private.label"
    | "form.private.hint"
    | "form.submit.label"
    | "form.submit.label.saved"
    | "leave_community"
    | "leave_modal.title"
    | { K: "leave_modal.body"; P: { datastoreName?: string }; R: string | undefined }
    | "leave_community.in_progress"
    | "delete_community"
    | "delete_community.modal.title"
    | { K: "delete_community.modal.body"; R: JSX.Element }
    | "delete_community.modal.confirm"
    | "delete_community.in_progress"
>()("CommunityInfo");
export type I18n = typeof i18n;

export const CommunityInfoFrTranslations: Translations<"fr">["CommunityInfo"] = {
    title: ({ datastoreName }) => datastoreName,
    section_title: "Informations",
    "form.name.label": "Nom",
    "form.name.error.required": "Le nom est obligatoire.",
    "form.desc.label": "Description",
    "form.desc.hint": "Ajouter quelques mots pour présenter votre espace de travail.",
    "form.desc.info_max_length": "300 caractères maximum",
    "form.contact.label": "Contact",
    "form.contact.hint": "Format attendu : nom@domaine.fr",
    "form.contact.error.required": "L’adresse électronique de contact est obligatoire.",
    "form.contact.error.invalid_email": "L’adresse électronique de contact est invalide.",
    "form.private.label": "Privé",
    "form.private.hint":
        "Désactiver le mode privé pour que tous les utilisateurs puissent voir votre entrepôt et demander à le rejoindre sur la page Ajouter un entrepôt.",
    "form.submit.label": "Enregistrer",
    "form.submit.label.saved": "Enregistré",
    leave_community: "Quitter l'entrepôt",
    "leave_modal.title": "Quitter l'entrepôt",
    "leave_modal.body": ({ datastoreName }) => `Êtes-vous sûr.e de vouloir quitter l’entrepôt ${datastoreName} ?`,
    "leave_community.in_progress": "Demande en cours",
    delete_community: "Supprimer l'entrepôt",
    "delete_community.modal.title": "Demander la suppression de l'entrepôt",
    "delete_community.modal.body": (
        <>
            <p>Si vous supprimez votre entrepôt :</p>
            <ul>
                <li>L’ensemble des données et des fichiers seront supprimés ;</li>
                <li>Les données publiées ne seront plus visibles et accessibles dans les services de cartes.gouv.fr ;</li>
                <li>Il vous appartient de prévenir les membres de la suppression de l’entrepôt.</li>
            </ul>
            <p>
                À savoir : les opérateurs de cartes.gouv.fr ne peuvent être tenus pour responsables des conséquences de la suppression d’un entrepôt par son
                administrateur ou de tout utilisateur en ayant les droits.
            </p>
        </>
    ),
    "delete_community.modal.confirm": "Demander la suppression",
    "delete_community.in_progress": "Envoi de la demande en cours",
};

export const CommunityInfoEnTranslations: Translations<"en">["CommunityInfo"] = {
    title: ({ datastoreName }) => datastoreName,
    section_title: "Information",
    "form.name.label": undefined,
    "form.name.error.required": undefined,
    "form.desc.label": undefined,
    "form.desc.hint": undefined,
    "form.desc.info_max_length": undefined,
    "form.contact.label": undefined,
    "form.contact.hint": undefined,
    "form.contact.error.required": undefined,
    "form.contact.error.invalid_email": undefined,
    "form.private.label": undefined,
    "form.private.hint": undefined,
    "form.submit.label": undefined,
    "form.submit.label.saved": undefined,
    leave_community: undefined,
    "leave_modal.title": undefined,
    "leave_modal.body": undefined,
    "leave_community.in_progress": undefined,
    delete_community: undefined,
    "delete_community.modal.title": undefined,
    "delete_community.modal.body": undefined,
    "delete_community.modal.confirm": undefined,
    "delete_community.in_progress": undefined,
};
