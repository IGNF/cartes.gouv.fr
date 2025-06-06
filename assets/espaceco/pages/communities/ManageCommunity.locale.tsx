import { ManageCommunityActiveTabEnum } from "@/@types/app_espaceco";
import { declareComponentKeys } from "../../../i18n/i18n";
import { Translations } from "../../../i18n/types";

export type logoAction = "add" | "modify" | "delete";

// traductions
const { i18n } = declareComponentKeys<
    | { K: "title"; P: { name: string | undefined }; R: string }
    | "loading"
    | "loading_me"
    | "me_fetch_failed"
    | "community_fetch_failed"
    | "back_to_list"
    | "no_rights"
    | "forbidden_access"
    | "updating"
    | "updating_success"
    | "updating_failed"
    | "create_now"
    | { K: "tab"; P: { tab: ManageCommunityActiveTabEnum }; R: string }
    | "desc.reuse_label"
    | "desc.reuse_description"
    | "desc.reuse_confirmation"
    | "desc.tab.title"
    | "desc.name"
    | "desc.hint_name"
    | "desc.description"
    | "desc.hint_description"
    | "desc.logo"
    | "desc.hint_logo"
    | "desc.logo.remove"
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
    | "desc.listed.title"
    | "desc.listed_hint"
    | "desc.membership_requests.title"
    | "desc.membership_requests.open"
    | "desc.membership_requests.not_open"
    | "desc.membership_requests.not_open_hint"
    | "desc.membership_requests.partial_open"
    | "desc.membership_requests.partial_open_hint"
    | "desc.membership_request.partial_open.parameter"
    | "desc.openwithemail_not_empty"
    | "desc.openwithemail_no_domains"
    | "desc.openwithemail.domains_header"
    | "desc.openwithemail.grids_header"
    | "desc.editorial"
    | "desc.editorial_hint"
    | "database.tab.title"
    | "database.explain_import"
    | "database.import"
    | "modal.openwithemail.title"
    | "modal.openwithemail.add_domain"
    | "modal.openwithemail.add_domain_hint"
    | "modal.openwithemail.min_error"
    | { K: "modal.openwithemail.grids_not_empty_error"; P: { domain: string }; R: string }
    | "modal.document.title"
    | "modal.document.title_field"
    | "modal.document.description"
    | "modal.document.file_hint"
    | "zoom.consistant_error"
    | "zoom.tab.title"
    | "zoom.reuse_label"
    | "zoom.reuse_description"
    | "zoom.reuse_confirmation"
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
    | "tools.reuse_label"
    | "tools.reuse_description"
    | "tools.reuse_confirmation"
    | "report.configure_themes"
    | "report.configure_themes.explain"
    | "report.configure_shared_themes"
    | "report.configure_shared_themes.explain"
    | "report.configure_statuses"
    | "report.configure_statuses.explain"
    | "report.manage.emailplanners"
    | "report.manage.emailplanners_explain"
    | "report.manage.no_emailplanners"
    | "report.manage_permissions"
    | "report.manage_permissions.shared_report"
    | "report.manage_permissions.shared_report_hint"
    | { K: "report.manage_permissions.shared_report.option"; P: { option: string }; R: string }
    | "report.manage_permissions.report_answers"
    | "report.manage_permissions.authorize"
    | "report.manage_permissions.authorize_hint"
    | "grid.grids"
    | { K: "grid.explain"; R: JSX.Element }
    | "tiptap.define_image"
    | "tiptap.cancel"
    | "tiptap.add"
    | "tiptap.documents"
    | "tiptap.external_image"
    | "tiptap.define_link"
    | "tiptap.external_link"
    | "tiptap.select_image"
    | "tiptap.select_document"
    | "tiptap.url"
    | "tiptap.alt"
    | "tiptap.title"
    | "tiptap.label"
>()("ManageCommunity");
export type I18n = typeof i18n;

export const ManageCommunityFrTranslations: Translations<"fr">["ManageCommunity"] = {
    title: ({ name }) => (name === undefined ? "Gérer le guichet" : `Gérer le guichet - ${name}`),
    loading: "Chargement du guichet en cours ...",
    loading_me: "Récupération des informations de votre compte en cours ...",
    me_fetch_failed: "La récupération des informations sur votre compte a échoué.",
    community_fetch_failed: "La récupération des informations sur le guichet a échoué.",
    back_to_list: "Retour à la liste des guichets",
    no_rights: "Vous n'avez pas les droits de modifier un guichet. Il faut être admin ou gestionnaire d'un guichet.",
    forbidden_access: "Ce guichet est en cours de création, il n'est pas accessible en modification.",
    updating: "Mise à jour du guichet en cours ...",
    updating_success: "La mise à jour du guichet s'est bien passée.",
    updating_failed: "La mise à jour du guichet a échoué.",
    create_now: "Créer le guichet maintenant",
    tab: ({ tab }) => {
        switch (tab) {
            case ManageCommunityActiveTabEnum.Description:
                return "Description";
            case ManageCommunityActiveTabEnum.Databases:
                return "Bases de données";
            case ManageCommunityActiveTabEnum.Layers:
                return "Couches de la carte";
            case ManageCommunityActiveTabEnum.Zoom:
                return "Zoom, centrage";
            case ManageCommunityActiveTabEnum.Tools:
                return "Outils";
            case ManageCommunityActiveTabEnum.Reports:
                return "Signalements";
            case ManageCommunityActiveTabEnum.Grids:
                return "Emprises";
            case ManageCommunityActiveTabEnum.Members:
                return "Membres";
        }
    },
    "desc.reuse_label": "Utiliser la description d’un autre guichet (optionnel)",
    "desc.reuse_description": "Si vous choisissez un guichet existant, la description de ce guichet sera récupérée et pourra être modifiée ci-dessous",
    "desc.reuse_confirmation": "Je veux réutiliser la description d'un guichet existant",
    "desc.tab.title": "Décrire le guichet",
    "desc.name": "Nom du guichet",
    "desc.hint_name": "Donnez un nom clair et compréhensible",
    "desc.description": "Description",
    "desc.hint_description": "Bref résumé narratif de l'objectif du guichet",
    "desc.logo": "Logo (optionnel)",
    "desc.hint_logo": "Taille maximale : 5 Mo. Formats acceptés : jpg, png",
    "desc.logo.remove": "Supprimer le logo",
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
    "desc.listed.title": "Le guichet doit-il apparaître dans la liste des guichets publics ?",
    "desc.listed_hint": "Un guichet non listé n’apparaitra pas dans la liste des guichets",
    "desc.membership_requests.title": "Le guichet est-il ouvert aux demandes d’affiliation ?",
    "desc.membership_requests.open": "Le guichet accepte toutes les demandes d’affiliation automatiquement",
    "desc.membership_requests.not_open": "Le guichet est ouvert aux demandes d’affiliation",
    "desc.membership_requests.not_open_hint": "Les demandes devront néanmoins être validées par le gestionnaire ou administrateur du guichet",
    "desc.membership_requests.partial_open": "Le guichet accepte certaines demandes d’affiliation",
    "desc.membership_requests.partial_open_hint": "Vous devez paramétrer les types de comptes acceptés",
    "desc.membership_request.partial_open.parameter": "Paramétrer",
    "desc.openwithemail_not_empty": "Si Le guichet accepte certaines demandes d’affiliation, il doit y avoir au moins un domaine configuré",
    "desc.openwithemail_no_domains": "Aucun domaine de configuré",
    "desc.openwithemail.domains_header": "Domaines acceptés",
    "desc.openwithemail.grids_header": "Emprises",
    "desc.editorial": "Contenu éditorial (optionnel)",
    "desc.editorial_hint":
        "Ce contenu sera affiché dès qu’un utilisateur arrivera sur le guichet. Vous pouvez y saisir toute information utile: objectifs du guichet, source et licence des données, conditions d'utilisations spécifiques, conseils de saisie…etc.",
    "database.tab.title": "Ajouter des bases de données au guichet (optionnel)",
    "database.explain_import":
        "Vous allez rejoindre la section Bases de Données de votre Espace Collaboratif où vous pourrez importer les bases de données nécessaires à votre guichet. Une fois les bases de données importées à votre espace collaboratif vous pourrez retrouver ce guichet comme non publié dans la liste de vos guichets et reprendre sa création à partir de cette étape. Importer une base de données à votre espace collaboratif",
    "database.import": "Importer une base de données à votre espace collaboratif",
    "modal.openwithemail.title": "Paramétrer les domaines acceptés pour les demandes d’affiliation",
    "modal.openwithemail.add_domain": "Ajouter un domaine accepté (doit commencer par un @)",
    "modal.openwithemail.add_domain_hint": "Une fois la saisie terminée, appuyez sur Entrée ou cliquez sur le bouton [Ajouter]",
    "modal.openwithemail.min_error": "Il doit y avoir au moins un domaine",
    "modal.openwithemail.grids_not_empty_error": ({ domain }) => `Le domaine ${domain} doit avoir au moins une emprise`,
    "modal.document.title": "Ajouter un document",
    "modal.document.title_field": "Titre",
    "modal.document.description": "Description (optionnel)",
    "modal.document.file_hint": "Taille maximale : 5 Mo.",
    "zoom.consistant_error": "Emprise et position ne sont pas cohérents",
    "zoom.tab.title": "Définir l’état initial de la carte à l’ouverture du guichet",
    "zoom.reuse_label": "Utiliser la configuration des zooms et de l'emprise d’un autre guichet (optionnel)",
    "zoom.reuse_description":
        "Si vous choisissez un guichet existant, la configuration des zooms et de l'emprise de ce guichet sera récupérée et pourra être modifiée ci-dessous",
    "zoom.reuse_confirmation": "Je veux réutiliser la configuration d'un guichet existant",
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
    "tools.reuse_label": "Utiliser la configuration des outils d’un autre guichet (optionnel)",
    "tools.reuse_description":
        "Pour faciliter la gestion de vos outils, vous pouvez ré-utiliser la configuration d’un guichet existant dont vous être gestionnaire. Si vous choisissez un guichet existant, la configuration des outils de ce guichet sera récupérée et pourra être modifiée ci-dessous.",
    "tools.reuse_confirmation": "Je veux ré-utiliser la configuration des outils d’un guichet existant",
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
    "report.manage.no_emailplanners": "Aucun email de suivi",
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
    "tiptap.define_image": "Définir l'image",
    "tiptap.cancel": "Annuler",
    "tiptap.add": "Ajouter",
    "tiptap.documents": "Documents",
    "tiptap.external_image": "Image externe",
    "tiptap.define_link": "Définir le lien",
    "tiptap.external_link": "Lien externe",
    "tiptap.select_image": "Sélectionnez une image",
    "tiptap.select_document": "Sélectionnez un document",
    "tiptap.url": "URL",
    "tiptap.alt": "Alt",
    "tiptap.title": "Titre",
    "tiptap.label": "Étiquette",
};

export const ManageCommunityEnTranslations: Translations<"en">["ManageCommunity"] = {
    title: ({ name }) => (name === undefined ? "Manage front office" : `Manage front office - ${name}`),
    loading: undefined,
    loading_me: undefined,
    me_fetch_failed: undefined,
    community_fetch_failed: undefined,
    back_to_list: undefined,
    no_rights: undefined,
    forbidden_access: undefined,
    updating: undefined,
    updating_success: undefined,
    updating_failed: undefined,
    create_now: undefined,
    tab: ({ tab }) => `${tab}`,
    "desc.tab.title": undefined,
    "desc.reuse_label": undefined,
    "desc.reuse_description": undefined,
    "desc.reuse_confirmation": undefined,
    "desc.name": undefined,
    "desc.hint_name": undefined,
    "desc.description": undefined,
    "desc.hint_description": undefined,
    "desc.logo": undefined,
    "desc.hint_logo": undefined,
    "desc.logo.remove": undefined,
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
    "desc.listed.title": undefined,
    "desc.listed_hint": undefined,
    "desc.membership_requests.title": undefined,
    "desc.membership_requests.open": undefined,
    "desc.membership_requests.not_open": undefined,
    "desc.membership_requests.not_open_hint": undefined,
    "desc.membership_requests.partial_open": undefined,
    "desc.membership_requests.partial_open_hint": undefined,
    "desc.membership_request.partial_open.parameter": "Parameter",
    "desc.openwithemail_not_empty": undefined,
    "desc.openwithemail_no_domains": undefined,
    "desc.openwithemail.domains_header": undefined,
    "desc.openwithemail.grids_header": undefined,
    "desc.editorial": undefined,
    "desc.editorial_hint": undefined,
    "database.tab.title": undefined,
    "database.explain_import": undefined,
    "database.import": undefined,
    "modal.openwithemail.title": undefined,
    "modal.openwithemail.add_domain": "Add accepted domain",
    "modal.openwithemail.add_domain_hint": undefined,
    "modal.openwithemail.min_error": undefined,
    "modal.openwithemail.grids_not_empty_error": undefined,
    "modal.document.title": "Add document",
    "modal.document.title_field": "Title",
    "modal.document.description": "Description (optional)",
    "modal.document.file_hint": "Maximum file size : 5 Mo.",
    "zoom.consistant_error": undefined,
    "zoom.tab.title": undefined,
    "zoom.reuse_label": undefined,
    "zoom.reuse_description": undefined,
    "zoom.reuse_confirmation": undefined,
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
    "tools.reuse_label": undefined,
    "tools.reuse_description": undefined,
    "tools.reuse_confirmation": undefined,
    "report.configure_themes": undefined,
    "report.configure_themes.explain": undefined,
    "report.configure_shared_themes": undefined,
    "report.configure_shared_themes.explain": undefined,
    "report.configure_statuses": undefined,
    "report.configure_statuses.explain": undefined,
    "report.manage.emailplanners": undefined,
    "report.manage.emailplanners_explain": undefined,
    "report.manage.no_emailplanners": undefined,
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
    "tiptap.define_image": undefined,
    "tiptap.cancel": undefined,
    "tiptap.add": undefined,
    "tiptap.documents": undefined,
    "tiptap.external_image": undefined,
    "tiptap.define_link": undefined,
    "tiptap.external_link": undefined,
    "tiptap.select_image": undefined,
    "tiptap.select_document": undefined,
    "tiptap.url": undefined,
    "tiptap.alt": undefined,
    "tiptap.title": undefined,
    "tiptap.label": undefined,
};
