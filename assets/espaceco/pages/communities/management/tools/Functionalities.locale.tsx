import { DisplayToolsType, MeasureToolsType, NavigationToolsType, ReportToolsType } from "@/@types/app_espaceco";
import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "simple_tools_title"
    | "display_tools"
    | { K: "tools_label"; P: { tool: DisplayToolsType | NavigationToolsType | MeasureToolsType | ReportToolsType }; R: string }
    | "navigation_tools"
    | "report_tools"
    | "measure_tools"
>()("Functionalities");
export type I18n = typeof i18n;

export const FunctionalitiesFrTranslations: Translations<"fr">["Functionalities"] = {
    simple_tools_title: "Définir les outils simples",
    display_tools: "Affichage",
    tools_label: ({ tool }) => {
        switch (tool) {
            case "zoom_control":
                return "Afficher les boutons de zoom";
            case "rotate_control":
                return "Pivoter une carte";
            case "overviewmap_control":
                return "Afficher une carte de localisation";
            case "print":
                return "Imprimer en PDF/PNG";
            case "search_address":
                return "Rechercher un lieu ou une adresse";
            case "search_lonlat":
                return "Rechercher par coordonnées";
            case "locate_control":
                return "Se localiser";
            case "search":
                return "Rechercher par attributs";
            case "save_positions":
                return "Sauvegarder les positions préférées";
            case "measure_distance":
                return "Mesurer une distance";
            case "measure_area":
                return "Mesurer une surface";
            case "measure_azimut":
                return "Mesurer un azimut";
            case "georem":
                return "Soumettre un signalement";
        }
    },
    /* display_tools_label: ({ tool }) => {
        switch (tool) {
            case "zoom_control":
                return "Afficher les boutons de zoom";
            case "rotate_control":
                return "Rotation de la carte";
            case "overviewmap_control":
                return "Afficher une carte de localisation";
            case "print":
                return "Impression PDF/PNG";
        }
    },*/
    navigation_tools: "Navigation",
    /* navigation_tools_label: ({ tool }) => {
        switch (tool) {
            case "search_address":
                return "Recherche de lieu ou d'adresse";
            case "search_lonlat":
                return "Recherche par coordonnées";
            case "locate_control":
                return "Se localiser";
            case "search":
                return "Rechercher par attributs";
            case "save_positions":
                return "Sauvegarder les positions préférées";
        }
    }, */
    report_tools: "Signalement",
    /* report_tools_label: ({ tool }) => {
        switch (tool) {
            case "georem":
                return "Soumettre un signalement";
        }
    }, */
    measure_tools: "Mesure",
    /* measure_tools_label: ({ tool }) => {
        switch (tool) {
            case "measure_distance":
                return "Mesurer une distance";
            case "measure_area":
                return "Mesurer une surface";
            case "measure_azimut":
                return "Mesurer un azimut";
        }
    }, */
};

export const FunctionalitiesEnTranslations: Translations<"en">["Functionalities"] = {
    simple_tools_title: undefined,
    display_tools: undefined,
    navigation_tools: undefined,
    tools_label: ({ tool }) => `${tool}`,
    report_tools: undefined,
    measure_tools: undefined,
};
