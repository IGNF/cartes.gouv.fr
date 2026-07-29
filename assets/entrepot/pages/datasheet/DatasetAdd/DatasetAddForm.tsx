import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format as datefnsFormat } from "date-fns";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useStyles } from "tss-react";

import { Upload } from "@/@types/app";
import Main from "@/components/Layout/Main";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import defaultProjections from "@/data/default_projections.json";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { delta } from "@/utils";
import MetadataSection from "../forms/MetadataSection";
import { buildDatasetAddSchema, datasetAddDefaultValues, type DatasetAddFormValues } from "./datasetAddSchema";
import DatasetSection from "./sections/DatasetSection";
import ProducerSection from "./sections/ProducerSection";
import SpatialReferenceSection from "./sections/SpatialReferenceSection";
import TemporalReferenceSection from "./sections/TemporalReferenceSection";
import ThemesSection from "./sections/ThemesSection";
import useDatasetFileUpload from "./useDatasetFileUpload";

type DatasetAddFormProps = {
    datastoreId: string;
    datasheetName: string;
    /** valeur par défaut proposée : le nom du responsable de la donnée (custodian des métadonnées) */
    defaultProducer: string;
};

export default function DatasetAddForm({ datastoreId, datasheetName, defaultProducer }: DatasetAddFormProps) {
    const queryClient = useQueryClient();

    const datasetTabLink = routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: "dataset" }).link;

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
            producer: defaultProducer,
        },
    });

    const {
        handleSubmit,
        setValue,
        formState: { isValidating },
    } = form;

    // ----- Téléversement du fichier (avant soumission du formulaire) -----

    const {
        fileInputRef,
        fileError,
        uploadInProgress: fileUploadInProgress,
        progressValue,
        progressMax,
        handleFileChange,
    } = useDatasetFileUpload({
        onFileSelected: () => setValue("data_upload_path", ""),
        onUploadSuccess: ({ srid, uploadPath }) => {
            if (srid) {
                setValue("srid", srid, { shouldValidate: true });
            }
            setValue("data_upload_path", uploadPath, { shouldValidate: true });
        },
    });

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
                            <ProducerSection organizationsOptions={organizationsOptions} defaultProducer={defaultProducer} />
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
