import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "addFile"
    | { K: "fileHint"; P: { formats: string; maxSizeMo: number }; R: string }
    | "dragHint"
    | "zoom.label"
    | "zoom.in"
    | "zoom.out"
    | "save"
    | { K: "error.fileTooLarge"; P: { maxSizeMo: number }; R: string }
    | "error.invalidFormat"
    | { K: "error.resolutionTooLow"; P: { width: number; height: number }; R: string }
    | "error.notDecodable"
>()("ImageCropModal");
export type I18n = typeof i18n;

export const ImageCropModalFrTranslations: Translations<"fr">["ImageCropModal"] = {
    addFile: "Ajouter un fichier",
    fileHint: ({ formats, maxSizeMo }) => `Taille maximale : ${maxSizeMo} Mo. Formats supportés : ${formats}.`,
    dragHint: "Modifiez votre image en la déplaçant ou en la redimensionnant",
    "zoom.label": "Niveau de zoom",
    "zoom.in": "Agrandir l’image",
    "zoom.out": "Réduire l’image",
    save: "Enregistrer",
    "error.fileTooLarge": ({ maxSizeMo }) => `Le fichier ne peut dépasser ${maxSizeMo} Mo.`,
    "error.invalidFormat": "Le format n’est pas valide.",
    "error.resolutionTooLow": ({ width, height }) => `L’image doit mesurer au moins ${width} × ${height} pixels.`,
    "error.notDecodable": "Le fichier n’est pas une image lisible.",
};

export const ImageCropModalEnTranslations: Translations<"en">["ImageCropModal"] = {
    addFile: "Add a file",
    fileHint: ({ formats, maxSizeMo }) => `Max size: ${maxSizeMo} MB. Supported formats: ${formats}.`,
    dragHint: "Adjust your image by moving or resizing it",
    "zoom.label": "Zoom level",
    "zoom.in": "Zoom in",
    "zoom.out": "Zoom out",
    save: "Save",
    "error.fileTooLarge": ({ maxSizeMo }) => `The file cannot exceed ${maxSizeMo} MB.`,
    "error.invalidFormat": "The format is not valid.",
    "error.resolutionTooLow": ({ width, height }) => `The image must be at least ${width} × ${height} pixels.`,
    "error.notDecodable": "The file is not a readable image.",
};
