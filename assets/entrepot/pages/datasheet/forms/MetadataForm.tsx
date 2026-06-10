import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { applyApiValidationErrors } from "@/modules/setApiFormErrors";
import { delta } from "@/utils";
import { useStyles } from "tss-react";
import MetadataSection from "./MetadataSection";
import { MetadataFormValues, buildMetadataSchema, defaultMetadataValues } from "./metadataSchema";
import DateSection from "./sections/DateSection";
import DescriptionSection from "./sections/DescriptionSection";
import LicenseSection from "./sections/LicenseSection";
import MetadataInfoSection from "./sections/MetadataInfoSection";
import ProducerSection from "./sections/ProducerSection";
import SpatialCoverageSection from "./sections/SpatialCoverageSection";

type ActionsRenderProps = { isSubmitting: boolean };

type MetadataFormProps = {
    mode?: "create" | "edit";
    defaultValues?: Partial<MetadataFormValues>;
    onSubmit: (values: MetadataFormValues) => Promise<void> | void;
    renderTopActions?: (state: ActionsRenderProps) => React.ReactNode;
    renderBottomActions?: (state: ActionsRenderProps) => React.ReactNode;
};

export default function MetadataForm({
    mode = "create",
    defaultValues = defaultMetadataValues,
    onSubmit,
    renderTopActions,
    renderBottomActions,
}: MetadataFormProps) {
    const { t } = useTranslation("DatasheetSections");
    const { datastore } = useDatastore();

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastore._id),
        queryFn: ({ signal }) => api.datasheet.getList(datastore._id, { signal }),
        refetchInterval: delta.seconds(30),
        enabled: mode === "create",
    });

    const schema = useMemo(
        () =>
            buildMetadataSchema({
                existingDatasheetNames: datasheetListQuery.data?.map((d) => d.name) ?? [],
                isEditMode: mode === "edit",
                checkFileIdentifier: (fileIdentifier) => api.metadata.checkFileIdentifierAvailability(datastore._id, fileIdentifier),
            }),
        [datasheetListQuery.data, mode, datastore._id]
    );

    const form = useForm<MetadataFormValues>({
        resolver: yupResolver(schema) as never,
        defaultValues,
        mode: "onSubmit",
        reValidateMode: "onBlur",
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
        control,
        setError,
        reset,
    } = form;

    const submit = handleSubmit(async (values) => {
        try {
            await onSubmit(values);
        } catch (e) {
            // Applique les erreurs de validation backend sur les champs correspondants.
            // L'erreur reste dans le state du composant consommateur (useMutation) pour
            // l'affichage dans l'alerte globale — on ne la reswallowe pas.
            applyApiValidationErrors(e, setError);
            throw e;
        }
    });

    const { css, cx } = useStyles();

    return (
        <>
            <Button
                onClick={() => {
                    reset({
                        name: "test-design-2026",
                        file_identifier: "SANDBOX.test-design-2026",
                        description: "test-design-2026-description",
                        themes: ["Agriculture"],
                        keywords_inspire: ["Objet hydrographique"],
                        keywords_additional: ["foo", "bar"],
                        producers: [
                            {
                                organization_name: "INSTITUT NATIONAL DE L'INFORMATION GEOGRAPHIQUE ET FORESTIERE (IGN)",
                                organization_email: "ign@ign.fr",
                                role: "pointOfContact",
                            },
                        ],
                        update_frequency: "annually",
                        charset: "utf8",
                        resource_genealogy: "test-design-2026-resource-genealogy",
                    });
                }}
            >
                Test données
            </Button>

            <FormProvider {...form}>
                <form onSubmit={submit} noValidate>
                    {renderTopActions?.({ isSubmitting })}

                    <div
                        className={cx(
                            fr.cx("fr-container"),
                            css({
                                backgroundColor: fr.colors.decisions.background.default.grey.default,
                            })
                        )}
                    >
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
                            <MetadataSection title={t("section.description")}>
                                <DescriptionSection isEditMode={mode === "edit"} />
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
                        </div>

                        <div className={fr.cx("fr-container")}>{renderBottomActions?.({ isSubmitting })}</div>
                    </div>
                </form>
            </FormProvider>
            <DevTool control={control} />
        </>
    );
}
