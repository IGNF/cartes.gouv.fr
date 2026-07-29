import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format as datefnsFormat } from "date-fns";
import { ChangeEventHandler, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useStyles } from "tss-react";
import { v4 as uuidv4 } from "uuid";

import { Upload } from "@/@types/app";
import Main from "@/components/Layout/Main";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import { useDatastore } from "@/contexts/datastore";
import defaultProjections from "@/data/default_projections.json";
import ignfProjections from "@/data/ignf_projections.json";
import api from "@/entrepot/api";
import FileUploader from "@/modules/FileUploader";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { delta, getFileExtension, looksLikeShapefileComponent } from "@/utils";
import MetadataSection from "../forms/MetadataSection";
import { DATASET_FILE_EXTENSIONS, DATASET_MAX_FILE_SIZE, buildDatasetAddSchema, datasetAddDefaultValues, type DatasetAddFormValues } from "./datasetAddSchema";
import DatasetSection from "./sections/DatasetSection";
import ProducerSection from "./sections/ProducerSection";
import SpatialReferenceSection from "./sections/SpatialReferenceSection";
import TemporalReferenceSection from "./sections/TemporalReferenceSection";
import ThemesSection from "./sections/ThemesSection";

const fileUploader = new FileUploader();

type DatasetAddFormProps = {
    datastoreId: string;
    datasheetName: string;
};

export default function DatasetAddForm({ datastoreId, datasheetName }: DatasetAddFormProps) {
    const { datastore } = useDatastore();

    const queryClient = useQueryClient();

    const datasetTabLink = routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: "dataset" }).link;

    // ----- Téléversement du fichier (avant soumission du formulaire) -----

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileError, setFileError] = useState<string>();
    const [fileUploadInProgress, setFileUploadInProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMax, setProgressMax] = useState(0);

    const [projections, setProjections] = useState<Record<string, string>>(defaultProjections);

    const schema = useMemo(
        () =>
            buildDatasetAddSchema({
                projections,
                onProjectionResolved: (srid, name) => setProjections((prev) => ({ ...prev, [srid]: name })),
            }),
        [projections]
    );

    const form = useForm<DatasetAddFormValues>({
        // même contournement que MetadataForm : les types conditionnels yup/RHF sont incompatibles
        resolver: yupResolver(schema) as never,
        mode: "onSubmit",
        reValidateMode: "onBlur",
        defaultValues: {
            ...datasetAddDefaultValues,
            producer: datastore.name,
        },
    });

    const {
        handleSubmit,
        setValue,
        formState: { isValidating },
    } = form;

    const validateDataFile = (file?: File): boolean => {
        if (!file) {
            setFileError("Veuillez sélectionner un fichier");
            return false;
        }

        if (looksLikeShapefileComponent(file.name)) {
            setFileError(`Le fichier ${file.name} semble faire partie d’un Shapefile. Déposez une archive zip contenant tous les fichiers composants.`);
            return false;
        }

        const extension = getFileExtension(file.name);
        if (!extension || !DATASET_FILE_EXTENSIONS.includes(extension)) {
            setFileError(`L’extension du fichier ${file.name} n’est pas acceptée`);
            return false;
        }

        if (file.size > DATASET_MAX_FILE_SIZE) {
            setFileError("La taille du fichier ne peut pas excéder 2 Go");
            return false;
        }

        return true;
    };

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = () => {
        setFileError(undefined);
        setValue("data_upload_path", "");

        const file = fileInputRef.current?.files?.[0];
        if (!file || !validateDataFile(file)) {
            return;
        }

        const uuid = uuidv4();
        setFileUploadInProgress(true);
        setProgressValue(0);
        setProgressMax(file.size);

        fileUploader
            .uploadFile(uuid, file, setProgressValue)
            .then(() => fileUploader.uploadComplete(uuid, file))
            .then((data) => {
                // projection déduite du fichier déposé (mapping IGNF → EPSG si nécessaire)
                const sridRaw = data?.srid;
                const sridMapped = typeof sridRaw === "string" && sridRaw !== "" && sridRaw in ignfProjections ? ignfProjections[sridRaw] : sridRaw;

                if (typeof sridMapped === "string" && sridMapped.trim() !== "") {
                    setValue("srid", sridMapped, { shouldValidate: true });
                }
                setValue("data_upload_path", String(data?.filename ?? ""), { shouldValidate: true });
            })
            .catch((err) => {
                console.error(err);
                setFileError(err?.msg ?? "Le téléversement du fichier a échoué");
            })
            .finally(() => {
                setFileUploadInProgress(false);
            });
    };

    // ----- Organismes proposés en autocomplétion -----

    const { data: organizations } = useQuery({
        queryKey: RQKeys.catalogs_organizations(),
        queryFn: ({ signal }) => api.catalogs.getAllOrganizations({ signal }),
        staleTime: delta.hours(10),
        enabled: !fileUploadInProgress,
    });

    const organizationsOptions = useMemo(() => organizations?.map((org) => org.name.trim()).sort() ?? [], [organizations]);

    // ----- Déclaration de la livraison -----

    const addUploadMutation = useMutation<Upload, CartesApiException, DatasetAddFormValues>({
        mutationFn: (values) => {
            const payload = {
                data_name: datasheetName,
                data_technical_name: values.name,
                data_description: values.description,
                data_srid: values.srid,
                data_upload_path: values.data_upload_path,
                producer: values.producer,
                producer_short: values.producer_short || undefined,
                themes: values.themes,
                production_date: datefnsFormat(values.production_date, "yyyy-MM-dd"),
                production_year: values.production_date.getFullYear(),
                email_notification: values.email_notification,
            };

            return api.upload.add(datastoreId, payload);
        },
        onSuccess: () => {
            // retour sur l'onglet données : l'intégration se poursuit en arrière-plan (ping depuis l'onglet)
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: "dataset" }).push();
        },
    });

    const onSubmit = handleSubmit((values) => addUploadMutation.mutate(values));

    const { css, cx } = useStyles();

    return (
        <Main title={`Ajouter une donnée — ${datasheetName}`}>
            <h1 className={fr.cx("fr-mb-1w")}>Ajouter une donnée</h1>
            <p className={fr.cx("fr-text--sm")}>Sauf mention contraire « (optionnel) » dans le label, tous les champs sont obligatoires.</p>

            {addUploadMutation.isError && (
                <Alert
                    className={fr.cx("fr-mb-2w")}
                    severity="error"
                    title="Erreur lors de l’ajout de la donnée"
                    description={addUploadMutation.error.message}
                    closable={false}
                />
            )}

            <FormProvider {...form}>
                <form onSubmit={onSubmit} noValidate>
                    <div
                        className={cx(
                            fr.cx("fr-grid-row", "fr-grid-row--gutters"),
                            css({
                                ["& > section"]: {
                                    padding: `${fr.spacing("6v")} !important`,
                                    [fr.breakpoints.up("md")]: {
                                        padding: `${fr.spacing("10v")} !important`,
                                    },
                                },
                                ["& > section:not(:last-child)"]: {
                                    borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                                },
                            })
                        )}
                    >
                        <MetadataSection title="Jeu de données">
                            <DatasetSection
                                fileInputRef={fileInputRef}
                                fileError={fileError}
                                uploadInProgress={fileUploadInProgress}
                                progressValue={progressValue}
                                progressMax={progressMax}
                                onFileChange={handleFileChange}
                            />
                        </MetadataSection>
                        <MetadataSection title="Producteur">
                            <ProducerSection organizationsOptions={organizationsOptions} defaultProducer={datastore.name} />
                        </MetadataSection>
                        <MetadataSection title="Thématiques">
                            <ThemesSection />
                        </MetadataSection>
                        <MetadataSection title="Référence temporelle">
                            <TemporalReferenceSection />
                        </MetadataSection>
                        <MetadataSection title="Référence spatiale">
                            <SpatialReferenceSection projections={projections} />
                        </MetadataSection>
                    </div>

                    <hr className={fr.cx("fr-mt-3w")} />

                    <Checkbox
                        options={[
                            {
                                label: "Recevoir une alerte par courriel lorsque le chargement est terminé.",
                                nativeInputProps: { ...form.register("email_notification") },
                            },
                        ]}
                    />

                    <ButtonsGroup
                        buttons={[
                            {
                                children: "Annuler",
                                priority: "secondary",
                                linkProps: datasetTabLink,
                            },
                            {
                                children: "Ajouter",
                                type: "submit",
                                disabled: fileUploadInProgress,
                            },
                        ]}
                        inlineLayoutWhen="always"
                        alignment="right"
                        className={fr.cx("fr-mt-2w", "fr-mb-4w")}
                    />
                </form>
            </FormProvider>

            {isValidating && (
                <Wait>
                    <LoadingIcon largeIcon={true} />
                </Wait>
            )}
            {addUploadMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message="Ajout de la donnée en cours ..." withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
        </Main>
    );
}
