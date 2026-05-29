import { fr } from "@codegouvfr/react-dsfr";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";

import { useTranslation } from "@/i18n/i18n";
import DateSection from "./sections/DateSection";
import DescriptionSection from "./sections/DescriptionSection";
import LicenseSection from "./sections/LicenseSection";
import MetadataInfoSection from "./sections/MetadataInfoSection";
import ProducerSection from "./sections/ProducerSection";
import SpatialCoverageSection from "./sections/SpatialCoverageSection";
import MetadataSection from "./MetadataSection";
import { MetadataFormValues, defaultMetadataValues, masterSchema } from "./metadataSchema";
import { useStyles } from "tss-react";

type ActionsRenderProps = { isSubmitting: boolean };

type MetadataFormProps = {
    defaultValues?: Partial<MetadataFormValues>;
    onSubmit: (values: MetadataFormValues) => Promise<void> | void;
    renderTopActions?: (state: ActionsRenderProps) => React.ReactNode;
    renderBottomActions?: (state: ActionsRenderProps) => React.ReactNode;
};

export default function MetadataForm({ defaultValues = defaultMetadataValues, onSubmit, renderTopActions, renderBottomActions }: MetadataFormProps) {
    const { t } = useTranslation("DatasheetSections");

    const form = useForm<MetadataFormValues>({
        resolver: yupResolver(masterSchema) as never,
        defaultValues,
        // mode: "onBlur",
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = form;

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
    });

    const { css, cx } = useStyles();

    return (
        <>
            {renderTopActions?.({ isSubmitting })}

            <div
                className={cx(
                    fr.cx("fr-container"),
                    css({
                        backgroundColor: fr.colors.decisions.background.default.grey.default,
                    })
                )}
            >
                <FormProvider {...form}>
                    <form onSubmit={submit} noValidate>
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
                                <DescriptionSection />
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

                        {renderBottomActions?.({ isSubmitting })}
                    </form>
                </FormProvider>
            </div>
        </>
    );
}
