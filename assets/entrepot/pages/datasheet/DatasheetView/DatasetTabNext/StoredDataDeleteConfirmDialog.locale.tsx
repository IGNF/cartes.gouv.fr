import { declareComponentKeys } from "i18nifty";
import { ReactNode } from "react";

import { StoredDataTypeEnum } from "@/@types/app";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "confirm_delete_modal.title"; P: { name: string; type: StoredDataTypeEnum }; R: ReactNode }
    | { K: "error_deleting"; P: { name: string; type: StoredDataTypeEnum }; R: string }
    | "following_services_deleted"
    | "processing_in_progress_deletion_warning"
>()("StoredDataDeleteConfirmDialog");

export type I18n = typeof i18n;

export const StoredDataDeleteConfirmDialogFrTranslations: Translations<"fr">["StoredDataDeleteConfirmDialog"] = {
    "confirm_delete_modal.title": ({ name, type }) => (
        <>
            Êtes-vous sûr de vouloir supprimer {getTypeLabelFr(type)} {name}&nbsp;?
        </>
    ),
    error_deleting: ({ name, type }) => `La suppression de ${getTypeLabelFr(type)} ${name} a échoué`,
    following_services_deleted: "Les services suivants seront aussi supprimés :",
    processing_in_progress_deletion_warning: "Un ou plusieurs traitements avec cette donnée en entrée sont en cours et seront annulés.",
};

export const StoredDataDeleteConfirmDialogEnTranslations: Translations<"en">["StoredDataDeleteConfirmDialog"] = {
    "confirm_delete_modal.title": undefined,
    error_deleting: undefined,
    following_services_deleted: undefined,
    processing_in_progress_deletion_warning: undefined,
};

function getTypeLabelFr(type: StoredDataTypeEnum): string {
    switch (type) {
        case StoredDataTypeEnum.VECTORDB:
            return "la base de données";
        case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
            return "la pyramide de tuiles raster";
        case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
            return "la pyramide de tuiles vectorielles";
        default:
            return "la donnée";
    }
}
