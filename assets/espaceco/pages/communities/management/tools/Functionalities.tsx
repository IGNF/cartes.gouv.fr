import { getTranslation } from "@/i18n/i18n";
import {
    CommunityToolsType,
    displayTools,
    DisplayToolsType,
    measureTools,
    MeasureToolsType,
    navigationTools,
    NavigationToolsType,
    reportTools,
    ReportToolsType,
} from "../../../../../@types/app_espaceco";

const { t } = getTranslation("Functionalities");

type Functionalities = Record<
    CommunityToolsType,
    { title: string; iconId: string; functionalities: (DisplayToolsType | NavigationToolsType | MeasureToolsType | ReportToolsType)[] }
>;

const functionalityConfigs: Functionalities = {
    display: {
        title: t("display_tools"),
        iconId: "fr-icon-image-line",
        functionalities: [...displayTools],
    },
    navigation: {
        title: t("navigation_tools"),
        iconId: "ri-compass-line",
        functionalities: [...navigationTools],
    },
    measure: {
        title: t("measure_tools"),
        iconId: "ri-ruler-line",
        functionalities: [...measureTools],
    },
    report: {
        title: t("report_tools"),
        iconId: "ri-chat-check-line",
        functionalities: [...reportTools],
    },
};

const allFunctionalities: string[] = Array.from(new Set([...displayTools, ...navigationTools, ...measureTools, ...reportTools]));

export { type Functionalities, functionalityConfigs, allFunctionalities };
