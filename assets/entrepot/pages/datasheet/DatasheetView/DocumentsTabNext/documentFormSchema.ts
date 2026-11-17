import { type TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { z } from "zod";

import { DatasheetDocumentTypeEnum } from "@/@types/app";
import { type ComponentKey } from "@/i18n/types";
import { getFileExtension } from "@/utils";

type T = TranslationFunction<"DocumentsTabNext", ComponentKey>;

// mêmes règles que DatasheetDocumentFile côté serveur
export const DOCUMENT_FILE_EXTENSIONS = ["qgz", "pdf", "jpg", "jpeg", "png", "svg", "csv"];
export const DOCUMENT_MAX_SIZE_MB = 5;

export type DocumentFormMode = { type: DatasheetDocumentTypeEnum; editing: boolean };

export const buildDocumentFormSchema = (t: T, { type, editing }: DocumentFormMode) =>
    z.object({
        name: z.string().trim().min(1, t("validation.name.required")),
        url:
            type === DatasheetDocumentTypeEnum.Link
                ? z
                      .string()
                      .trim()
                      .min(1, t("validation.url.required"))
                      .pipe(z.url({ protocol: /^https?$/, error: t("validation.url.invalid") }))
                : z.string().optional(),
        file: z.custom<FileList | undefined>().superRefine((files, ctx) => {
            const file = files?.[0];
            if (type !== DatasheetDocumentTypeEnum.File) {
                return;
            }
            // à la modification, un fichier absent garde le fichier actuel
            if (file === undefined) {
                if (!editing) ctx.addIssue({ code: "custom", message: t("validation.file.required") });
                return;
            }
            if (!DOCUMENT_FILE_EXTENSIONS.includes(getFileExtension(file.name) ?? "")) {
                ctx.addIssue({ code: "custom", message: t("validation.file.extension") });
            } else if (file.size > DOCUMENT_MAX_SIZE_MB * 1024 * 1024) {
                ctx.addIssue({ code: "custom", message: t("validation.file.size", { max: DOCUMENT_MAX_SIZE_MB }) });
            }
        }),
    });

export type DocumentFormValues = z.input<ReturnType<typeof buildDocumentFormSchema>>;
export type DocumentFormOutput = z.output<ReturnType<typeof buildDocumentFormSchema>>;

/** corps multipart des routes d’ajout et de modification */
export function buildDocumentFormData(values: DocumentFormOutput, { type, editing }: DocumentFormMode): FormData {
    const formData = new FormData();
    formData.set("name", values.name);
    if (!editing) {
        formData.set("type", type);
    }
    if (type === DatasheetDocumentTypeEnum.Link && values.url) {
        formData.set("url", values.url);
    }
    const file = values.file?.[0];
    if (type === DatasheetDocumentTypeEnum.File && file) {
        formData.set("file", file);
    }
    return formData;
}
