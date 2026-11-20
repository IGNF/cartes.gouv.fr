import { format } from "date-fns";
import { type TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { z } from "zod";

import { type ComponentKey } from "@/i18n/types";
import { regex } from "@/utils";

type T = TranslationFunction<"DatasetAdd", ComponentKey>;

// mêmes limites que UploadAddDTO côté serveur
export const DATASET_NAME_MAX_LENGTH = 80;
export const DATASET_DESCRIPTION_MAX_LENGTH = 250;
export const PRODUCER_SHORT_MAX_LENGTH = 15;
/** limite Entrepôt d’une valeur de tag : les thématiques sont jointes par « , » dans un seul tag */
export const TAG_VALUE_MAX_LENGTH = 99;

type SchemaDeps = {
    t: T;
    /** vrai si la projection est connue (liste par défaut ou registre EPSG) */
    isKnownProjection: (srid: string) => boolean | Promise<boolean>;
};

export const buildDatasetAddSchema = ({ t, isKnownProjection }: SchemaDeps) =>
    z.object({
        data_upload_path: z.string().min(1, t("validation.file")),
        name: z
            .string()
            .trim()
            .min(1, t("validation.name.required"))
            .max(DATASET_NAME_MAX_LENGTH, t("validation.name.max", { max: DATASET_NAME_MAX_LENGTH }))
            .regex(regex.public_name, t("validation.name.chars")),
        description: z
            .string()
            .trim()
            .min(1, t("validation.description.required"))
            .max(DATASET_DESCRIPTION_MAX_LENGTH, t("validation.description.max", { max: DATASET_DESCRIPTION_MAX_LENGTH })),
        producer: z
            .string()
            .trim()
            .min(1, t("validation.producer.required"))
            .min(2, t("validation.producer.length"))
            .max(TAG_VALUE_MAX_LENGTH, t("validation.producer.length")),
        producer_short: z
            .string()
            .trim()
            .toUpperCase()
            .max(PRODUCER_SHORT_MAX_LENGTH, t("validation.producer_short.max", { max: PRODUCER_SHORT_MAX_LENGTH })),
        themes: z
            .array(z.string())
            .min(1, t("validation.themes.required"))
            .refine((themes) => themes.join(", ").length <= TAG_VALUE_MAX_LENGTH, t("validation.themes.max", { max: TAG_VALUE_MAX_LENGTH })),
        production_date: z
            .date({ error: t("validation.production_date.required") })
            .refine((date) => date <= new Date(), t("validation.production_date.future")),
        srid: z
            .string()
            .min(1, t("validation.srid.required"))
            .superRefine(async (srid, ctx) => {
                if (srid !== "" && !(await isKnownProjection(srid))) {
                    ctx.addIssue({ code: "custom", message: t("validation.srid.unknown", { srid }) });
                }
            }),
        zone: z
            .string()
            .trim()
            .min(1, t("validation.zone.required"))
            .max(TAG_VALUE_MAX_LENGTH, t("validation.zone.max", { max: TAG_VALUE_MAX_LENGTH })),
        email_notification: z.boolean(),
    });

export type DatasetAddFormValues = z.input<ReturnType<typeof buildDatasetAddSchema>>;
export type DatasetAddValues = z.output<ReturnType<typeof buildDatasetAddSchema>>;

export const datasetAddDefaultValues = (producer: string): DatasetAddFormValues => ({
    data_upload_path: "",
    name: "",
    description: "",
    producer,
    producer_short: "",
    themes: [],
    production_date: undefined as unknown as Date,
    srid: "EPSG:2154",
    zone: "",
    email_notification: true,
});

/** corps de la déclaration de livraison, aux noms de UploadAddDTO */
export const buildUploadAddPayload = (datasheetName: string, values: DatasetAddValues) => ({
    ...values,
    datasheet_name: datasheetName,
    producer_short: values.producer_short === "" ? undefined : values.producer_short,
    production_date: format(values.production_date, "yyyy-MM-dd"),
});
