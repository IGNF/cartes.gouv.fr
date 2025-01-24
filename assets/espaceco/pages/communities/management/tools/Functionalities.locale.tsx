import { MeasureToolsType, NavigationToolsType, OtherToolsType, ReportToolsType } from "../../../../../@types/app_espaceco";
import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "simple_tools_title"
    | "direct_contribution_tools"
    | "navigation_tools"
    | { K: "navigation_tools_label"; P: { tool: NavigationToolsType }; R: string }
    | "other_tools"
    | { K: "other_tools_label"; P: { tool: OtherToolsType }; R: string }
    | "report_tools"
    | { K: "report_tools_label"; P: { tool: ReportToolsType }; R: string }
    | "measure_tools"
    | { K: "measure_tools_label"; P: { tool: MeasureToolsType }; R: string }
    | "loading_layers"
>()("Functionalities");
export type I18n = typeof i18n;

export const FunctionalitiesFrTranslations: Translations<"fr">["Functionalities"] = {
    simple_tools_title: "Définir les outils simples",
    direct_contribution_tools: "Définir les outils de contribution directe liés aux base de données",
    navigation_tools: "Outils de navigation",
    navigation_tools_label: ({ tool }) => {
        switch (tool) {
            case "savePositions":
                return "Sauvegarder les positions préférées";
            case "locateControl":
                return "Se localiser";
            case "zoomControl":
                return "Afficher les boutons de zoom";
            case "rotateControl":
                return "Rotation de la carte";
            case "overviewMapControl":
                return "Afficher une carte de localisation";
            case "searchAddress":
                return "Recherche de lieu ou d'adresse";
            case "searchLonlat":
                return "Se centrer sur des coordonnées";
        }
    },
    other_tools: "Autres outils",
    other_tools_label: ({ tool }) => {
        switch (tool) {
            case "search":
                return "Rechercher par attributs";
            case "print":
                return "Impression PDF/PNG";
        }
    },
    report_tools: "Outils de signalement",
    report_tools_label: ({ tool }) => {
        switch (tool) {
            case "georem":
                return "Soumettre un signalement";
        }
    },
    measure_tools: "Outils de mesure",
    measure_tools_label: ({ tool }) => {
        switch (tool) {
            case "measureDistance":
                return "Mesurer une distance";
            case "measureArea":
                return "Mesurer une surface";
            case "measureAzimut":
                return "Mesurer un azimut";
        }
    },
    loading_layers: "Recherche des couches associées à des tables ...",
};

export const FunctionalitiesEnTranslations: Translations<"en">["Functionalities"] = {
    simple_tools_title: undefined,
    direct_contribution_tools: undefined,
    navigation_tools: undefined,
    navigation_tools_label: ({ tool }) => `${tool}`,
    other_tools: undefined,
    other_tools_label: ({ tool }) => `${tool}`,
    report_tools: undefined,
    report_tools_label: ({ tool }) => `${tool}`,
    measure_tools: undefined,
    measure_tools_label: ({ tool }) => `${tool}`,
    loading_layers: undefined,
};
