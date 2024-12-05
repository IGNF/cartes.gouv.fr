import { declareComponentKeys } from "./i18n";
import { type Translations } from "./types";

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
    annex_explain: "Autorise le téléversement, la publication et la suppression des annexes",
    broadcast_explain: "Autorise la configuration et la publication d’offres",
    community_explain:
        "Autorise la modification d’une communauté et la gestion de ses membres. Voir la liste des membres est l’une des rares lectures à n'être autorisée qu'en cas de possession de ce droit",
    processing_explain: "Autorise la création d’exécutions de traitements et leur déclenchement",
    upload_explain: "Autorise la création de livraisons, le téléversement de fichiers dans les livraisons, la fermeture/ouverture et la suppression",
};

/* MERCI NOEMIE */
export const RightsEnTranslations: Translations<"en">["Rights"] = {
    annex: "Annexes",
    broadcast: "Broadcast",
    community: "Community",
    processing: "Processing",
    upload: "Upload",
    annex_explain: "Grants authorization to upload, publish and delete annexes",
    broadcast_explain: "Grants authorization to configure and publish offers",
    community_explain:
        "Grants authorization to modify a community and manage its members. This authorization is necessary to access a community’s list of members.",
    processing_explain: "Grants authorization to create and trigger processes",
    upload_explain: "Grants authorization to create deliveries, upload files within deliveries, close/open and delete",
};
