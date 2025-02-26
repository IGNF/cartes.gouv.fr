import { getTranslation } from "@/i18n/i18n";
import {
    CommunityTools,
    arrDisplayTools,
    DisplayTools,
    arrMeasureTools,
    MeasureTools,
    arrNavigationTools,
    NavigationTools,
    arrReportTools,
    ReportTools,
} from "../../../../../@types/app_espaceco";

const { t } = getTranslation("Functionalities");

type Functionalities = Record<
    CommunityTools,
    { title: string; iconId: string; functionalities: (DisplayTools | NavigationTools | MeasureTools | ReportTools)[] }
>;

const functionalityConfigs: Functionalities = {
    display: {
        title: t("display_tools"),
        iconId: "fr-icon-image-line",
        functionalities: [...arrDisplayTools],
    },
    navigation: {
        title: t("navigation_tools"),
        iconId: "ri-compass-line",
        functionalities: [...arrNavigationTools],
    },
    measure: {
        title: t("measure_tools"),
        iconId: "ri-ruler-line",
        functionalities: [...arrMeasureTools],
    },
    report: {
        title: t("report_tools"),
        iconId: "ri-chat-check-line",
        functionalities: [...arrReportTools],
    },
};

const allFunctionalities: string[] = Array.from(new Set([...arrDisplayTools, ...arrNavigationTools, ...arrMeasureTools, ...arrReportTools]));

export { type Functionalities, functionalityConfigs, allFunctionalities };
