import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

export type logoAction = "add" | "modify" | "delete";

// traductions
export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { name: string | undefined }; R: string }
    | "loading"
    | "fetch_failed"
    | "back_to_list"
    | "tab1"
    | "tab2"
    | "tab3"
    | "tab4"
    | "tab5"
    | "tab6"
    | "desc.name"
    | "desc.hint_name"
    | "desc.description"
    | "desc.hint_description"
    | "desc.logo"
    | "desc.logo.title"
    | { K: "logo_action"; P: { action: logoAction }; R: string }
    | "logo_confirm_delete_modal.title"
    | "modal.logo.title"
    | "modal.logo.file_hint"
    | "desc.keywords"
>()("ManageCommunity");

export const ManageCommunityFrTranslations: Translations<"fr">["ManageCommunity"] = {
    title: ({ name }) => (name === undefined ? "Gérer le guichet" : `Gérer le guichet - ${name}`),
    loading: "Recherche du guichet en cours ...",
    fetch_failed: "La récupération des informations sur le guichet a échoué",
    back_to_list: "Retour à la liste des guichets",
    tab1: "Description",
    tab2: "Bases de données",
    tab3: "Zoom, centrage",
    tab4: "Couches de la carte",
    tab5: "Outils",
    tab6: "Signalements",
    "desc.name": "Nom du guichet",
    "desc.hint_name": "Donnez un nom clair et compréhensible",
    "desc.description": "Description",
    "desc.hint_description": "Bref résumé narratif de l'objectif du guichet",
    "desc.logo": "Logo (optionnel)",
    "desc.logo.title": "Ajouter, modifier ou supprimer le logo du guichet",
    logo_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Ajouter un logo";
            case "modify":
                return "Remplacer le logo";
            case "delete":
                return "Supprimer le logo";
        }
    },
    "logo_confirm_delete_modal.title": "Êtes-vous sûr de vouloir supprimer le logo de ce guichet ?",
    "modal.logo.title": "Logo du guichet",
    "modal.logo.file_hint": "Taille maximale : 5 Mo. Formats acceptés : jpg, png",
    "desc.keywords": "Mots-clés (optionnel)",
};

export const ManageCommunityEnTranslations: Translations<"en">["ManageCommunity"] = {
    title: ({ name }) => (name === undefined ? "Manage front office" : `Manage front office - ${name}`),
    loading: undefined,
    fetch_failed: undefined,
    back_to_list: undefined,
    tab1: undefined,
    tab2: undefined,
    tab3: undefined,
    tab4: undefined,
    tab5: undefined,
    tab6: undefined,
    "desc.name": undefined,
    "desc.hint_name": undefined,
    "desc.description": undefined,
    "desc.hint_description": undefined,
    "desc.logo": undefined,
    "desc.logo.title": undefined,
    logo_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Add logo";
            case "modify":
                return "Replace logo";
            case "delete":
                return "Delete logo";
        }
    },
    "logo_confirm_delete_modal.title": undefined,
    "modal.logo.title": undefined,
    "modal.logo.file_hint": undefined,
    "desc.keywords": undefined,
};
