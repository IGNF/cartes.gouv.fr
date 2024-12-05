import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "create_service"
    | "define_service"
    | "show_linked_datas"
    | "other_actions"
    | "replace_datas"
    | "show_details"
    | "tms_label"
    | "wfs_label"
    | "wmsv_label"
    | "tms_hint_text"
    | "wfs_hint_text"
    | "wmsv_hint_text"
    | "tile_technical_name"
    | "tile_technical_name_hint_text"
    | "technical_name_is_mandatory"
    | { K: "confirm_delete_modal.title"; P: { dbname: string }; R: string }
    | "following_services_deleted"
    | { K: "error_deleting"; P: { dbname: string }; R: string }
>()("VectorDbList");
export type I18n = typeof i18n;

export const VectorDbListFrTranslations: Translations<"fr">["VectorDbList"] = {
    create_service: "Créer un service",
    define_service: "Choisir le service à configurer",
    show_linked_datas: "Voir les données liées",
    other_actions: "Autres actions",
    replace_datas: "Remplacer les données",
    show_details: "Voir les détails",
    tms_label: "Service de tuiles vectorielles (Tile Map Service - TMS)",
    wfs_label: "Service de sélection WFS (Web Feature Service - WFS)",
    wmsv_label: "Service d’images (Web Map Service - WMS)",
    tms_hint_text:
        "Création puis publication d’une pyramide de tuiles vectorielles dont le rendu peut être personnalisable avec des fichiers de style proposés par vos soins ou définis par un utilisateur final. Ce service s'appuie sur le protocole TMS en version 1.0.0.",
    wfs_hint_text:
        "Création puis publication d’un service permettant de manipuler des objets géographiques. Ce service s'appuie sur le protocole WFS en version 2.0.0",
    wmsv_hint_text: "Création puis publication d’images à partir de données vectorielles. Ce service s'appuie sur le protocole WMS en version 1.3.0",
    tile_technical_name: "Nom technique de la pyramide de tuiles vectorielles",
    tile_technical_name_hint_text:
        "II s'agit du nom technique du service qui apparaitra dans votre espace de travail, il ne sera pas publié en ligne. Si vous le renommez, choisissez un nom explicite.",
    technical_name_is_mandatory: "Le nom technique est obligatoire",
    "confirm_delete_modal.title": ({ dbname }) => `Êtes-vous sûr de vouloir supprimer la base de données ${dbname} ?`,
    following_services_deleted: "Les services suivants seront aussi supprimés :",
    error_deleting: ({ dbname }) => `La suppression de la base de données ${dbname} a échoué`,
};

export const VectorDbListEnTranslations: Translations<"en">["VectorDbList"] = {
    create_service: "Create service",
    define_service: "Define service to create",
    show_linked_datas: "Show linked datas",
    other_actions: "Other actions",
    replace_datas: "Replace datas",
    show_details: "Show details",
    tms_label: undefined,
    wfs_label: undefined,
    wmsv_label: undefined,
    tms_hint_text: undefined,
    wfs_hint_text: undefined,
    wmsv_hint_text: undefined,
    tile_technical_name: "Technical name of vector tile pyramid [TODO]",
    tile_technical_name_hint_text:
        "This is the technical name of the service which will appear in your workspace, it will not be published online. If you rename it, choose a meaningful name. [TODO]",
    technical_name_is_mandatory: "Technical name is mandatory",
    "confirm_delete_modal.title": ({ dbname }) => `Are you sure you want to delete database ${dbname} ?`,
    following_services_deleted: "The following services will be deleted :",
    error_deleting: ({ dbname }) => `Deleting ${dbname} database failed`,
};
