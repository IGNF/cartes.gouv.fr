import { declareComponentKeys } from "../../../i18n/i18n";
import { type Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "annex"
    | "broadcast"
    | "community"
    | "processing"
    | "upload"
    | "annex_explain"
    | "broadcast_explain"
    | "community_explain"
    | "processing_explain"
    | "upload_explain"
>()("Rights");
export type I18n = typeof i18n;

export const RightsFrTranslations: Translations<"fr">["Rights"] = {
    annex: "Annexes",
    broadcast: "Diffusion",
    community: "Communauté",
    processing: "Traitement",
    upload: "Téléversement",
    annex_explain: "Publier et supprimer des annexes",
    broadcast_explain: "Configurer et publier des offres",
    community_explain: "Gérer une communauté et ses membres (ajout, droits, suppression...)",
    processing_explain: "Déclencher et exécuter des traitements",
    upload_explain: "Créer et gérer une livraison (ouverture, ajout de fichiers, fermeture...)",
};

export const RightsEnTranslations: Translations<"en">["Rights"] = {
    annex: undefined,
    broadcast: undefined,
    community: undefined,
    processing: undefined,
    upload: undefined,
    annex_explain: undefined,
    broadcast_explain: undefined,
    community_explain: undefined,
    processing_explain: undefined,
    upload_explain: undefined,
};
