import * as yup from "yup";

import api from "@/entrepot/api";

export const DATASET_NAME_MAX_LENGTH = 80;
export const DATASET_DESCRIPTION_MAX_LENGTH = 250;
export const PRODUCER_SHORT_MAX_LENGTH = 15;
export const DATASET_MAX_FILE_SIZE = 2_000_000_000; // 2 Go
export const DATASET_FILE_EXTENSIONS = ["gpkg", "zip", "geojson", "csv", "sql"];

type BuildDatasetAddSchemaOptions = {
    /** projections EPSG actuellement proposées dans la liste déroulante */
    projections: Record<string, string>;
    /** appelé quand une projection inconnue de la liste est résolue via l’API EPSG */
    onProjectionResolved: (srid: string, name: string) => void;
};

export function buildDatasetAddSchema({ projections, onProjectionResolved }: BuildDatasetAddSchemaOptions) {
    return yup
        .object({
            data_upload_path: yup.string().required("Veuillez déposer un fichier de données"),
            name: yup
                .string()
                .trim()
                .required("Le nom du jeu de données est obligatoire")
                .max(DATASET_NAME_MAX_LENGTH, `Le nom du jeu de données ne peut pas dépasser ${DATASET_NAME_MAX_LENGTH} caractères`),
            description: yup
                .string()
                .trim()
                .required("La description est obligatoire")
                .max(DATASET_DESCRIPTION_MAX_LENGTH, `La description ne peut pas dépasser ${DATASET_DESCRIPTION_MAX_LENGTH} caractères`),
            producer: yup
                .string()
                .trim()
                .required("Le nom de l’organisme est obligatoire")
                .min(2, "Le nom de l’organisme doit comporter entre 2 et 99 caractères")
                .max(99, "Le nom de l’organisme doit comporter entre 2 et 99 caractères"),
            producer_short: yup
                .string()
                .trim()
                .uppercase()
                .max(PRODUCER_SHORT_MAX_LENGTH, `L’acronyme ne peut pas dépasser ${PRODUCER_SHORT_MAX_LENGTH} caractères`),
            themes: yup.array().of(yup.string().required()).min(1, "Sélectionnez au moins une thématique").required(),
            production_date: yup
                .date()
                .typeError("La date de production est invalide")
                .required("La date de production est obligatoire")
                .max(new Date(), "La date de production ne peut pas être dans le futur"),
            srid: yup
                .string()
                .required("La projection est obligatoire")
                .test({
                    name: "srid-is-accepted",
                    async test(srid, ctx) {
                        if (srid in projections) {
                            return true;
                        }

                        // projection absente de la liste par défaut : vérifie qu’il s’agit bien d’une projection EPSG connue
                        try {
                            const proj = await api.epsg.getProjFromEpsg(srid);
                            onProjectionResolved(srid, proj.name);

                            return true;
                        } catch (error) {
                            console.error(error);

                            return ctx.createError({ message: `Projection ${srid} inconnue` });
                        }
                    },
                }),
            zone: yup.string().trim().required("L’étendue spatiale est obligatoire"),
            open_download: yup.boolean().required(),
            open_extraction: yup.boolean().required(),
            extraction_public: yup.boolean().required(),
            email_notification: yup.boolean().required(),
        })
        .required();
}

export type DatasetAddFormValues = yup.InferType<ReturnType<typeof buildDatasetAddSchema>>;

export const datasetAddDefaultValues: Partial<DatasetAddFormValues> = {
    data_upload_path: "",
    name: "",
    description: "",
    producer: "",
    producer_short: "",
    themes: [],
    srid: "EPSG:2154",
    zone: "",
    open_download: false,
    open_extraction: false,
    extraction_public: false,
    email_notification: true,
};
