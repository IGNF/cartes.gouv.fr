import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { Controller, useFormContext } from "react-hook-form";

import { MetadataHierarchyLevel } from "@/@types/app";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import MarkdownEditor from "@/components/Input/MarkdownEditor";
import { useTranslation } from "@/i18n/i18n";
import { charsets } from "@/utils";
import { getLanguages } from "@/utils/lang";
import { MetadataFormValues } from "../metadataSchema";

const languages = getLanguages();

export default function MetadataInfoSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    return (
        <div>
            <Controller
                control={control}
                name="resourceGenealogy"
                render={({ field: { value, onChange } }) => (
                    <MarkdownEditor
                        label={t("field.resourceGenealogy")}
                        state={errors.resourceGenealogy ? "error" : "info"}
                        stateRelatedMessage={errors.resourceGenealogy?.message ?? t("field.resourceGenealogy.info")}
                        value={value ?? ""}
                        onChange={onChange}
                    />
                )}
            />

            <Controller
                control={control}
                name="hierarchyLevel"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <RadioButtons
                        legend={t("field.hierarchyLevel")}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        options={[
                            {
                                label: t("field.hierarchyLevel.dataset"),
                                hintText: t("field.hierarchyLevel.dataset.hint"),
                                nativeInputProps: {
                                    value: MetadataHierarchyLevel.Dataset,
                                    checked: value === MetadataHierarchyLevel.Dataset,
                                    onChange: () => onChange(MetadataHierarchyLevel.Dataset),
                                },
                            },
                            {
                                label: t("field.hierarchyLevel.series"),
                                hintText: t("field.hierarchyLevel.series.hint"),
                                nativeInputProps: {
                                    value: MetadataHierarchyLevel.Series,
                                    checked: value === MetadataHierarchyLevel.Series,
                                    onChange: () => onChange(MetadataHierarchyLevel.Series),
                                },
                            },
                        ]}
                    />
                )}
            />

            <Controller
                control={control}
                name="language"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label={t("field.language")}
                        options={languages}
                        getOptionLabel={(option) =>
                            typeof option === "object" && option !== null ? (option as { language: string }).language : String(option)
                        }
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        multiple={false}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        value={field.value ?? null}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                    />
                )}
            />

            <div>
                <Select
                    label={t("field.charset")}
                    state={errors.charset ? "error" : "default"}
                    // stateRelatedMessage={errors.charset?.message ?? t("field.charset.info")}
                    nativeSelectProps={{ ...register("charset") }}
                    options={Object.keys(charsets).map((charset) => ({
                        value: charset,
                        label: charset,
                    }))}
                    className={fr.cx("fr-mb-0")}
                />
                <p className={fr.cx("fr-info-text", "fr-mt-4v")}>{t("field.charset.info")}</p>
            </div>
        </div>
    );
}
