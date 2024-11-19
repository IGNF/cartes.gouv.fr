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
    | "tab7"
    | "tab8"
    | "desc.tab.title"
    | "desc.name"
    | "desc.hint_name"
    | "desc.description"
    | "desc.hint_description"
    | "desc.logo"
    | "desc.logo.title"
    | { K: "logo_action"; P: { action: logoAction }; R: string }
    | { K: "running_action"; P: { action: logoAction }; R: string }
    | "logo_confirm_delete_modal.title"
    | "modal.logo.title"
    | "modal.logo.file_hint"
    | "desc.keywords"
    | "desc.documents"
    | "desc.documents_hint"
    | "desc.no_documents"
    | "desc.adding_document"
    | "desc.updating_document"
    | "desc.confirm_remove_document"
    | "desc.removing_document"
    | "modal.document.title"
    | "modal.document.title_field"
    | "modal.document.description"
    | "modal.document.file_hint"
    | "zoom.consistant_error"
    | "zoom.tab.title"
    | "zoom.position"
    | "zoom.position_hint"
    | "zoom.zoom_range"
    | "zoom.zoom_range_hint"
    | "zoom.manage_extent"
    | "zoom.extent"
    | "zoom.extent_hint"
    | "zoom.choice.autocomplete"
    | "zoom.choice.manual"
    | "zoom.extent_enter_manually"
    | "zoom.xmin"
    | "zoom.xmax"
    | "zoom.ymin"
    | "zoom.ymax"
    | "layer.tab.title"
    | "layer.tabl"
    | "layer.tab2"
    | "layer.tab3"
    | "report.configure_themes"
    | "report.configure_themes.explain"
    | "report.configure_shared_themes"
    | "report.configure_shared_themes.explain"
    | "report.configure_statuses"
    | "report.configure_statuses.explain"
    | "report.manage.emailplanners"
    | "report.manage.emailplanners_explain"
    | "report.manage_permissions"
    | "report.manage_permissions.shared_report"
    | "report.manage_permissions.shared_report_hint"
    | { K: "report.manage_permissions.shared_report.option"; P: { option: string }; R: string }
    | "report.manage_permissions.report_answers"
    | "report.manage_permissions.authorize"
    | "report.manage_permissions.authorize_hint"
    | "grid.grids"
    | { K: "grid.explain"; R: JSX.Element }
>()("ManageCommunity");

/**
 * "thumbnail_modal.action_being": ({ action }) => {
        switch (action) {
            case "add":
                return "Ajout de la vignette en cours ...";
            case "modify":
                return "Remplacement de la vignette en cours ...";
            case "delete":
                return "Suppression de la vignette en cours ...";
        }
    },
 */

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
    tab7: "Emprises",
    tab8: "Membres",
    "desc.tab.title": "Décrire le guichet",
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
    running_action: ({ action }) => {
        switch (action) {
            case "add":
                return "Ajout du logo en cours ...";
            case "modify":
                return "Mise à jour du logo en cours ...";
            case "delete":
                return "Suppression du logo en cours ...";
        }
    },
    "logo_confirm_delete_modal.title": "Êtes-vous sûr de vouloir supprimer le logo de ce guichet ?",
    "modal.logo.title": "Logo du guichet",
    "modal.logo.file_hint": "Taille maximale : 5 Mo. Formats acceptés : jpg, png",
    "desc.keywords": "Mots-clés (optionnel)",
    "desc.documents": "Documents additionnels (optionnel)",
    "desc.documents_hint":
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta suscipit tempora culpa, ea quis illo veniam vero consequuntur soluta nesciunt.",
    "desc.no_documents": "Aucun document",
    "desc.adding_document": "Ajout d'un document en cours ...",
    "desc.updating_document": "Modification d'un document en cours ...",
    "desc.confirm_remove_document": "Êtes-vous sûr de vouloir supprimer ce document ?",
    "desc.removing_document": "Suppression du document en cours ...",
    "modal.document.title": "Ajouter un document",
    "modal.document.title_field": "Titre",
    "modal.document.description": "Description (optionnel)",
    "modal.document.file_hint": "Taille maximale : 5 Mo.",
    "zoom.consistant_error": "Emprise et position ne sont pas cohérents",
    "zoom.tab.title": "Définir l’état initial de la carte à l’ouverture du guichet",
    "zoom.position": "Position",
    "zoom.position_hint": "Fixer la position et définissez le niveau de zoom (utilisez votre souris ou la barre de recherche ci-dessous",
    "zoom.zoom_range": "Gérer les niveaux de zoom minimum et maximum permis (optionnel)",
    "zoom.zoom_range_hint":
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Libero quisquam hic veritatis, ex ipsum illo labore sint perspiciatis quidem architecto!",
    "zoom.manage_extent": "Gérer les bornes de navigation (optionnel)",
    "zoom.extent": "Bornes de navigation",
    "zoom.extent_hint":
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime vitae maiores suscipit tempore sequi reiciendis nulla optio doloremque! Unde, illo nemo ab accusantium fugiat minus? Natus inventore dolore velit, nostrum dolores molestiae sint laborum, obcaecati, ullam provident repellat consectetur accusamus sunt rerum nobis sequi? Sed maxime fugit dolore! Ipsam, veritatis.",
    "zoom.choice.autocomplete": "Recherche d'une emprise administrative",
    "zoom.choice.manual": "Saisie manuelle",
    "zoom.extent_enter_manually": "Entrer les coordonnées (lon,lat)",
    "zoom.xmin": "X min",
    "zoom.xmax": "X max",
    "zoom.ymin": "Y min",
    "zoom.ymax": "Y max",
    "layer.tab.title": "Gérer les couches de la carte",
    "layer.tabl": "Mes données",
    "layer.tab2": "Données de la géoplateforme",
    "layer.tab3": "Fonds de carte",
    "report.configure_themes": "Configurer les thèmes et attributs des signalements (optionnel)",
    "report.configure_themes.explain":
        "Afin de permettre aux membres de votre groupe de soumettre des signalements sur d'autres thématiques que celles IGN (Adresse, Bâti, Points d'intérêts...), vous pouvez ajouter vos propres thèmes et personnaliser le formulaire de saisie d'un nouveau signalement pour l'adapter à vos besoins métier. Les membres de votre groupe verront ces thèmes, en plus ou à la place des thèmes IGN, sur l'interface de saisie d'un nouveau signalement sur l'espace collaboratif, les plugins SIG et l'application mobile.",
    "report.configure_shared_themes": "Afficher des thèmes partagés (optionnel)",
    "report.configure_shared_themes.explain": "Vous pouvez également choisir des thèmes partagés qui apparaitront sur ce guichet.",
    "report.configure_statuses": "Paramétrer les status des signalements (optionnel)",
    "report.configure_statuses.explain":
        "Vous pouvez supprimer un maximum de 2 status en les décochant, changer leur nom et ajouter une explication pour améliorer la compréhension de vos utilisateurs.",
    "report.manage.emailplanners": "Gérer les emails de suivi des nouveaux signalements (optionnel)",
    "report.manage.emailplanners_explain":
        "Générer des emails de suivi des signalements automatiques. Vous pouvez ajouter des adresses email dont les destinataires recevront des emails simples et pré-configurés pour tout nouveau signalement, ou configurer vous même les emails pour un meilleur suivi des signalements.",

    "report.manage_permissions": "Gérer les permissions (optionnel)",
    "report.manage_permissions.shared_report": "Partage des signalements",
    "report.manage_permissions.shared_report_hint":
        "Vous pouvez déterminer quels utilisateurs ont accès aux signalements du groupe. Choisissez si les signalements du groupe sont :",
    "report.manage_permissions.shared_report.option": ({ option }) => {
        switch (option) {
            case "all":
                return "Visibles de tout le monde";
            case "restrained":
                return "Visibles uniquement des membres du guichet";
            case "personal":
                return "Visibles uniquement de leur auteur et des gestionnaires du guichet";
            default:
                return "";
        }
    },
    "report.manage_permissions.report_answers": "Réponses aux signalements",
    "report.manage_permissions.authorize": "Autoriser",
    "report.manage_permissions.authorize_hint":
        "Tous les membres d'un groupe peuvent répondre aux signalements le concernant mais seuls les gestionnaires peuvent valider ces réponses et donc clore les signalements. En cochant la case suivante vous autorisez tous les membres de ce groupe à apporter des réponses sans validation.",
    "grid.grids": "Emprises du guichet (optionnel)",
    "grid.explain": (
        <p>
            Ajouter une ou plusieurs emprises.
            <br />
            Tous les membres du guichet y auront accès et pourront donc réaliser des contributions directes sur la base de données.
        </p>
    ),
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
    tab7: undefined,
    tab8: undefined,
    "desc.tab.title": undefined,
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
    running_action: ({ action }) => `${action} running`,
    "logo_confirm_delete_modal.title": undefined,
    "modal.logo.title": undefined,
    "modal.logo.file_hint": undefined,
    "desc.keywords": undefined,
    "desc.documents": undefined,
    "desc.documents_hint": undefined,
    "desc.no_documents": "No document",
    "desc.adding_document": undefined,
    "desc.updating_document": undefined,
    "desc.confirm_remove_document": undefined,
    "desc.removing_document": undefined,
    "modal.document.title": "Add document",
    "modal.document.title_field": "Title",
    "modal.document.description": "Description (optional)",
    "modal.document.file_hint": "Maximum file size : 5 Mo.",
    "zoom.consistant_error": undefined,
    "zoom.tab.title": undefined,
    "zoom.position": "Position",
    "zoom.position_hint": undefined,
    "zoom.zoom_range": undefined,
    "zoom.zoom_range_hint": undefined,
    "zoom.manage_extent": undefined,
    "zoom.extent": undefined,
    "zoom.extent_hint": undefined,
    "zoom.choice.autocomplete": undefined,
    "zoom.choice.manual": undefined,
    "zoom.extent_enter_manually": undefined,
    "zoom.xmin": "X min",
    "zoom.xmax": "X max",
    "zoom.ymin": "Y min",
    "zoom.ymax": "Y max",
    "layer.tab.title": undefined,
    "layer.tabl": "My datas",
    "layer.tab2": "Geoplateforme datas",
    "layer.tab3": "Base maps",
    "report.configure_themes": undefined,
    "report.configure_themes.explain": undefined,
    "report.configure_shared_themes": undefined,
    "report.configure_shared_themes.explain": undefined,
    "report.configure_statuses": undefined,
    "report.configure_statuses.explain": undefined,
    "report.manage.emailplanners": undefined,
    "report.manage.emailplanners_explain": undefined,
    "report.manage_permissions": undefined,
    "report.manage_permissions.shared_report": undefined,
    "report.manage_permissions.shared_report_hint": undefined,
    "report.manage_permissions.shared_report.option": ({ option }) => {
        return `${option}`;
    },
    "report.manage_permissions.report_answers": undefined,
    "report.manage_permissions.authorize": undefined,
    "report.manage_permissions.authorize_hint": undefined,
    "grid.grids": undefined,
    "grid.explain": undefined,
};
