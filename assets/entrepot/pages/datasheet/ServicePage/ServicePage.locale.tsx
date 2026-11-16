import { ConfigurationStatus } from "@/@types/entrepot";
import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "loading"
    | "load_error"
    | "back"
    | "edit"
    | "edit_notice"
    | "unpublishing.title"
    | "unpublished.title"
    | "unavailable.description"
    | "unstable.title"
    | "unstable.description"
    | "section.report"
    | "report.configuration"
    | "report.offering"
    | "report.id"
    | "report.name"
    | "report.status"
    | "report.creation"
    | "report.update"
    | { K: "report.configuration_status"; P: { status: ConfigurationStatus }; R: string }
>()("ServicePage");
export type I18n = typeof i18n;

const configurationStatusFr: Record<ConfigurationStatus, string> = {
    [ConfigurationStatus.PUBLISHED]: "Publiée",
    [ConfigurationStatus.UNPUBLISHED]: "Non publiée",
    [ConfigurationStatus.SYNCHRONIZING]: "En cours de synchronisation",
};

const configurationStatusEn: Record<ConfigurationStatus, string> = {
    [ConfigurationStatus.PUBLISHED]: "Published",
    [ConfigurationStatus.UNPUBLISHED]: "Unpublished",
    [ConfigurationStatus.SYNCHRONIZING]: "Synchronizing",
};

export const ServicePageFrTranslations: Translations<"fr">["ServicePage"] = {
    loading: "Chargement du flux",
    load_error: "Le flux n’a pas pu être chargé",
    back: "Retour aux flux de la fiche",
    edit: "Modifier",
    edit_notice: "La modification du flux se fera bientôt sur cette page. En attendant, « Modifier » ouvre le formulaire de modification actuel.",
    "unpublishing.title": "Flux en cours de dépublication",
    "unpublished.title": "Flux dépublié",
    "unavailable.description": "Ce flux n’est plus diffusé. Vous pouvez uniquement terminer sa dépublication depuis l’onglet Flux de la fiche.",
    "unstable.title": "Flux instable",
    "unstable.description": "L’Entrepôt considère ce flux comme instable. Il peut ne pas s’afficher correctement.",
    "section.report": "Rapport de génération",
    "report.configuration": "Configuration",
    "report.offering": "Offre",
    "report.id": "Identifiant",
    "report.name": "Nom",
    "report.status": "Statut",
    "report.creation": "Date de création",
    "report.update": "Date de modification",
    "report.configuration_status": ({ status }) => configurationStatusFr[status] ?? status,
};

export const ServicePageEnTranslations: Translations<"en">["ServicePage"] = {
    loading: "Loading the service",
    load_error: "The service could not be loaded",
    back: "Back to the datasheet services",
    edit: "Edit",
    edit_notice: "Editing the service will soon happen on this page. Meanwhile, “Edit” opens the current edit form.",
    "unpublishing.title": "Service being unpublished",
    "unpublished.title": "Unpublished service",
    "unavailable.description": "This service is no longer broadcast. You can only finish unpublishing it from the Services tab of the datasheet.",
    "unstable.title": "Unstable service",
    "unstable.description": "The Entrepôt considers this service unstable. It may not display correctly.",
    "section.report": "Generation report",
    "report.configuration": "Configuration",
    "report.offering": "Offering",
    "report.id": "Identifier",
    "report.name": "Name",
    "report.status": "Status",
    "report.creation": "Creation date",
    "report.update": "Last update",
    "report.configuration_status": ({ status }) => configurationStatusEn[status] ?? status,
};
