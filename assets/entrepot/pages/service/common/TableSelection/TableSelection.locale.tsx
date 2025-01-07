import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<"title" | { K: "tables_detected_hint"; P: { nbTables: number }; R: string }>()("TableSelection");
export type I18n = typeof i18n;

export const TableSelectionFrTranslations: Translations<"fr">["TableSelection"] = {
    title: "Sélectionnez les tables nécessaires au service",
    tables_detected_hint: ({ nbTables }) => (nbTables > 1 ? `${nbTables} tables détectées` : "1 table détectée"),
};

export const TableSelectionEnTranslations: Translations<"en">["TableSelection"] = {
    title: undefined,
    tables_detected_hint: undefined,
};
