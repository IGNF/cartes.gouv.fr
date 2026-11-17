import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "datasheet.being_removed"; P: { datasheetName: string }; R: string }
    | { K: "datasheet_confirm_delete_modal.title"; P: { datasheetName: string }; R: string }
    | "datasheet_confirm_delete_modal.text"
    | "processing_in_progress_deletion_warning"
>()("DatasheetView");
export type I18n = typeof i18n;

export const DatasheetViewFrTranslations: Translations<"fr">["DatasheetView"] = {
    "datasheet.being_removed": ({ datasheetName }) => `Suppression de la fiche de données ${datasheetName} en cours ...`,
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Êtes-vous sûr de supprimer la fiche de données ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "Les éléments suivants seront supprimés :",
    processing_in_progress_deletion_warning: "Un ou plusieurs traitements avec au moins un de ces jeux de données en entrée sont en cours et seront annulés.",
};

export const DatasheetViewEnTranslations: Translations<"en">["DatasheetView"] = {
    "datasheet.being_removed": ({ datasheetName }) => `Datasheet ${datasheetName} being removed ...`,
    "datasheet_confirm_delete_modal.title": ({ datasheetName }) => `Are you sure you want to delete datasheet ${datasheetName} ?`,
    "datasheet_confirm_delete_modal.text": "The following items will be deleted :",
    processing_in_progress_deletion_warning: undefined,
};
