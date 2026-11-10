import Button from "@codegouvfr/react-dsfr/Button";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useMemo } from "react";
import { type FieldPath, FormProvider, useForm } from "react-hook-form";

import api from "@/entrepot/api";
import { datasheetListQueryOptions } from "@/hooks/queries/datasheetListQueryOptions";
import { useTranslation } from "@/i18n/i18n";
import { isApiError } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { setApiFormErrors } from "@/modules/setApiFormErrors";
import { delta } from "@/utils/delta";
import MetadataSection from "./MetadataSection";
import MetadataSectionsContainer from "./MetadataSectionsContainer";
import { buildMetadataSchema, defaultMetadataValues, type MetadataFormValues, type MetadataValues } from "./metadataSchema";
import DateSection from "./sections/DateSection";
import DescriptionSection from "./sections/DescriptionSection";
import LicenseSection from "./sections/LicenseSection";
import MetadataInfoSection from "./sections/MetadataInfoSection";
import ProducerSection from "./sections/ProducerSection";
import SpatialCoverageSection from "./sections/SpatialCoverageSection";

type ActionsRenderProps = { isSubmitting: boolean; isDirty: boolean };

type MetadataFormProps = {
    datastoreId: string;
    mode?: "create" | "edit";
    defaultValues?: Partial<MetadataFormValues>;
    /** rejette l’erreur d’API : ses violations sont posées sur les champs, l’appelant affiche l’alerte */
    onSubmit: (values: MetadataValues) => Promise<unknown>;
    /** champs désactivés (droits insuffisants) */
    disabled?: boolean;
    renderTopActions?: (state: ActionsRenderProps) => ReactNode;
    renderBottomActions?: (state: ActionsRenderProps) => ReactNode;
    /** vignette déjà enregistrée (modification) */
    existingThumbnailUrl?: string;
};

export default function MetadataForm({
    datastoreId,
    mode = "create",
    defaultValues = defaultMetadataValues,
    onSubmit,
    disabled = false,
    renderTopActions,
    renderBottomActions,
    existingThumbnailUrl,
}: MetadataFormProps) {
    const { t } = useTranslation("DatasheetSections");
    const isEditMode = mode === "edit";
    const queryClient = useQueryClient();

    // aide à la saisie seulement : la création revérifie le nom (409)
    const datasheetListQuery = useQuery({ ...datasheetListQueryOptions(datastoreId), throwOnError: false, retry: false, enabled: !isEditMode });

    const schema = useMemo(
        () =>
            buildMetadataSchema({
                t,
                isEditMode,
                existingDatasheetNames: datasheetListQuery.data?.map((datasheet) => datasheet.name) ?? [],
                // le résolveur valide tout le formulaire à chaque changement : une requête par identifiant, la création revérifie
                isFileIdentifierAvailable: (fileIdentifier) =>
                    queryClient.query({
                        queryKey: RQKeys.datastore_metadata_file_identifier_availability(datastoreId, fileIdentifier),
                        queryFn: () => api.metadata.isFileIdentifierAvailable(datastoreId, fileIdentifier),
                        staleTime: delta.minutes(1),
                    }),
            }),
        [t, isEditMode, datasheetListQuery.data, datastoreId, queryClient]
    );

    const form = useForm<MetadataFormValues, unknown, MetadataValues>({
        resolver: zodResolver(schema),
        defaultValues,
        disabled,
        mode: "onSubmit",
        reValidateMode: "onBlur",
    });

    const {
        handleSubmit,
        formState: { isSubmitting, dirtyFields },
        control,
        setError,
        reset,
    } = form;

    // isDirty compare tout l’arbre des valeurs et vaut true dès le chargement : seuls les champs modifiés comptent
    const isDirty = Object.keys(dirtyFields).length > 0;
    // modification : alerte du navigateur si l’on quitte la page avec des changements non enregistrés
    const warnOnLeave = isEditMode && isDirty && !isSubmitting;
    useEffect(() => {
        if (!warnOnLeave) {
            return;
        }
        const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [warnOnLeave]);

    const submit = handleSubmit(async (values) => {
        try {
            await onSubmit(values);
        } catch (error) {
            // 422 : violations par champ ; 409 : nom ou identifiant pris, champ désigné par details.field
            if (!setApiFormErrors(error, setError) && isApiError(error) && error.status === 409) {
                const field = (error.details as { field?: string } | undefined)?.field;
                if (field) {
                    setError(field as FieldPath<MetadataFormValues>, { type: "server", message: error.detail ?? error.title });
                }
            }
        }
    });

    const actionsState = { isSubmitting, isDirty };

    return (
        <>
            {/* remplissage de test, gardé à la demande d’Orka (décision 9) */}
            <Button
                type="button"
                priority="tertiary"
                size="small"
                onClick={() =>
                    reset({
                        ...defaultMetadataValues,
                        name: "test-design-2026",
                        file_identifier: "SANDBOX.test-design-2026",
                        description: "test-design-2026-description",
                        themes: ["environment"],
                        keywords_inspire: ["Hydrographie"],
                        keywords_additional: ["foo", "bar"],
                        producers: [{ organization_name: "Organisme de test", organization_email: "contact@example.test", role: "pointOfContact" }],
                        update_frequency: "annually",
                        scale: 25000,
                        resource_genealogy: "test-design-2026-resource-genealogy",
                    })
                }
            >
                Test données
            </Button>

            <FormProvider {...form}>
                <form onSubmit={(event) => void submit(event)} noValidate>
                    {renderTopActions?.(actionsState)}

                    <MetadataSectionsContainer>
                        <MetadataSection title={t("section.description")}>
                            <DescriptionSection isEditMode={isEditMode} existingThumbnailUrl={existingThumbnailUrl} />
                        </MetadataSection>
                        <MetadataSection title={t("section.producer")}>
                            <ProducerSection />
                        </MetadataSection>
                        <MetadataSection title={t("section.date")}>
                            <DateSection />
                        </MetadataSection>
                        <MetadataSection title={t("section.spatialCoverage")}>
                            <SpatialCoverageSection />
                        </MetadataSection>
                        <MetadataSection title={t("section.license")}>
                            <LicenseSection />
                        </MetadataSection>
                        <MetadataSection title={t("section.metadataInfo")}>
                            <MetadataInfoSection />
                        </MetadataSection>
                    </MetadataSectionsContainer>

                    {renderBottomActions?.(actionsState)}
                </form>
            </FormProvider>
            <DevTool control={control} />
        </>
    );
}
