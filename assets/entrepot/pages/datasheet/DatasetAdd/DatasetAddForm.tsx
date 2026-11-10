import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { Upload } from "@/@types/app";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import DatePicker from "@/components/Input/DatePicker";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import useOrganizationNamesQuery from "@/hooks/queries/useOrganizationNamesQuery";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { setApiFormErrors } from "@/modules/setApiFormErrors";
import { getThematicCategories } from "@/utils";
import DatasheetUploadIntegrationDialog from "../DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegrationDialog";
import MetadataSection from "../forms/MetadataSection";
import MetadataSectionsContainer from "../forms/MetadataSectionsContainer";
import { buildDatasetAddSchema, buildUploadAddPayload, datasetAddDefaultValues, type DatasetAddFormValues, type DatasetAddValues } from "./datasetAddSchema";
import DatasetSection from "./sections/DatasetSection";
import ProducerSection from "./sections/ProducerSection";
import SpatialReferenceSection from "./sections/SpatialReferenceSection";
import useDatasetFileUpload from "./useDatasetFileUpload";

import defaultProjections from "@/data/default_projections.json";

const thematicCategories = getThematicCategories();
const thematicCategoryLabels = new Map(thematicCategories.map((category) => [category.code, category.text]));

// résolutions EPSG partagées entre validations : le résolveur revalide tout le schéma à chaque passage
const epsgResolutions = new Map<string, Promise<{ name: string }>>();
const resolveEpsg = (srid: string) => {
    let resolution = epsgResolutions.get(srid);
    if (!resolution) {
        resolution = api.epsg.getProjFromEpsg(srid) as Promise<{ name: string }>;
        // un échec (réseau, code inconnu) reste retentable
        resolution.catch(() => epsgResolutions.delete(srid));
        epsgResolutions.set(srid, resolution);
    }
    return resolution;
};

type DatasetAddFormProps = {
    datastoreId: string;
    datasheetName: string;
    defaultProducer: string;
};

export default function DatasetAddForm({ datastoreId, datasheetName, defaultProducer }: DatasetAddFormProps) {
    const { t } = useTranslation("DatasetAdd");
    const queryClient = useQueryClient();
    const [projections, setProjections] = useState<Record<string, string>>(defaultProjections);

    const schema = useMemo(
        () =>
            buildDatasetAddSchema({
                t,
                isKnownProjection: async (srid) => {
                    if (srid in projections) return true;
                    try {
                        const { name } = await resolveEpsg(srid);
                        setProjections((previous) => ({ ...previous, [srid]: name }));
                        return true;
                    } catch {
                        return false;
                    }
                },
            }),
        [t, projections]
    );

    const form = useForm<DatasetAddFormValues, unknown, DatasetAddValues>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
        reValidateMode: "onBlur",
        defaultValues: datasetAddDefaultValues(defaultProducer),
    });
    const { handleSubmit, setValue, setError, trigger, control, formState } = form;

    const fileUpload = useDatasetFileUpload({
        onFileSelected: () => setValue("data_upload_path", ""),
        onUploadSuccess: ({ srid, uploadPath }) => {
            if (srid) setValue("srid", srid);
            setValue("data_upload_path", uploadPath);
            void trigger(["srid", "data_upload_path"]);
        },
    });

    const { data: organizationsOptions = [] } = useOrganizationNamesQuery({ enabled: !fileUpload.uploadInProgress });

    const addUploadMutation = useMutation<Upload, ApiError, DatasetAddValues>({
        mutationFn: (values) => api.upload.add(datastoreId, buildUploadAddPayload(datasheetName, values)),
        // le dialogue d’intégration prend le relais puis renvoie vers l’onglet Données
        onSuccess: () => queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) }),
        onError: (error) => setApiFormErrors(error, setError),
    });

    return (
        <>
            <h1 className={fr.cx("fr-mb-1w")}>{t("title")}</h1>
            <p className={fr.cx("fr-text--sm")}>{t("mandatory_fields")}</p>

            {addUploadMutation.isError && (
                <Alert
                    className={fr.cx("fr-mb-2w")}
                    severity="error"
                    title={t("error_title")}
                    description={getApiErrorMessage(addUploadMutation.error)}
                    small
                />
            )}

            <FormProvider {...form}>
                <form onSubmit={(e) => void handleSubmit((values) => addUploadMutation.mutate(values))(e)} noValidate>
                    <MetadataSectionsContainer>
                        <MetadataSection title={t("section.dataset")}>
                            <DatasetSection
                                fileInputRef={fileUpload.fileInputRef}
                                fileError={fileUpload.fileError}
                                uploadInProgress={fileUpload.uploadInProgress}
                                progressValue={fileUpload.progressValue}
                                progressMax={fileUpload.progressMax}
                                onFileChange={fileUpload.handleFileChange}
                            />
                        </MetadataSection>
                        <MetadataSection title={t("section.producer")}>
                            <ProducerSection organizationsOptions={organizationsOptions} />
                        </MetadataSection>
                        <MetadataSection title={t("section.themes")}>
                            <Controller
                                control={control}
                                name="themes"
                                render={({ field, fieldState: { error } }) => (
                                    <AutocompleteSelect
                                        label={t("themes.label")}
                                        hintText={t("themes.hint")}
                                        options={thematicCategories.map((category) => category.code)}
                                        getOptionLabel={(option) => thematicCategoryLabels.get(option) ?? String(option)}
                                        searchFilter={{ limit: 40 }}
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error?.message}
                                        value={field.value}
                                        onChange={(_, value) => field.onChange(value)}
                                        onBlur={field.onBlur}
                                        multiple
                                    />
                                )}
                            />
                        </MetadataSection>
                        <MetadataSection title={t("section.temporal")}>
                            <Controller
                                control={control}
                                name="production_date"
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <DatePicker
                                        label={t("production_date.label")}
                                        hintText={t("production_date.hint")}
                                        value={value instanceof Date ? value : undefined}
                                        onChange={(date) => onChange(date)}
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error?.message}
                                    />
                                )}
                            />
                        </MetadataSection>
                        <MetadataSection title={t("section.spatial")}>
                            <SpatialReferenceSection projections={projections} />
                        </MetadataSection>
                        <MetadataSection>
                            <Controller
                                control={control}
                                name="email_notification"
                                render={({ field: { value, onChange } }) => (
                                    <ToggleSwitch
                                        checked={value}
                                        label={t("email_notification")}
                                        onChange={(checked) => onChange(checked)}
                                        showCheckedHint={false}
                                    />
                                )}
                            />
                        </MetadataSection>
                    </MetadataSectionsContainer>

                    <ButtonsGroup
                        buttons={[
                            {
                                children: t("cancel"),
                                priority: "secondary",
                                linkProps: {
                                    to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue",
                                    params: { datastoreId, datasheetName },
                                    search: { activeTab: "dataset" },
                                },
                            },
                            { children: t("submit"), type: "submit", disabled: fileUpload.uploadInProgress },
                        ]}
                        inlineLayoutWhen="always"
                        alignment="right"
                        className={fr.cx("fr-mt-2w", "fr-mb-4w")}
                    />
                </form>
            </FormProvider>

            {(formState.isValidating || addUploadMutation.isPending) && (
                <Wait>
                    <LoadingText as="h6" message={addUploadMutation.isPending ? t("adding") : undefined} withSpinnerIcon={true} />
                </Wait>
            )}
            {addUploadMutation.isSuccess && (
                <Wait>
                    <DatasheetUploadIntegrationDialog
                        datastoreId={datastoreId}
                        uploadId={addUploadMutation.data._id}
                        datasheetName={datasheetName}
                        datasheetView="nouvelle"
                    />
                </Wait>
            )}
        </>
    );
}
