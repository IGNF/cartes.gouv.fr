import Input from "@codegouvfr/react-dsfr/Input";
import { Controller, useFormContext } from "react-hook-form";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import ImageFieldUpload from "@/components/Input/ImageFieldUpload";
import MarkdownEditor from "@/components/Input/MarkdownEditor";
import { useTranslation } from "@/i18n/i18n";
import { getInspireKeywords, getThematicCategories } from "@/utils/metadata";
import { MetadataFormValues } from "../metadataSchema";

const thematicCategories = getThematicCategories();
const inspireKeywords = getInspireKeywords();

type DescriptionSectionProps = {
    isEditMode?: boolean;
};

export default function DescriptionSection({ isEditMode = false }: DescriptionSectionProps) {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    return (
        <div>
            <ImageFieldUpload name="thumbnail" label={t("field.thumbnail")} hintText={t("field.thumbnail.hint")} accept=".jpg, .jpeg, .png" />

            <Input
                label={t("field.name")}
                state={errors.name ? "error" : "default"}
                stateRelatedMessage={errors.name?.message}
                nativeInputProps={{ ...register("name"), disabled: isEditMode }}
            />

            <Input
                label={t("field.fileIdentifier")}
                hintText={t("field.fileIdentifier.hint")}
                state={errors.fileIdentifier ? "error" : "info"}
                stateRelatedMessage={
                    errors.fileIdentifier?.message ?? "Cet identifiant unique est associé à votre donnée et s’affichera dans l’URL de votre fiche de donnée. "
                }
                nativeInputProps={{ ...register("fileIdentifier") }}
            />

            <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange } }) => (
                    <MarkdownEditor
                        label={t("field.description")}
                        state={errors.description ? "error" : "default"}
                        stateRelatedMessage={errors.description?.message}
                        value={value ?? ""}
                        onChange={onChange}
                    />
                )}
            />

            <Controller
                control={control}
                name="themes"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label={t("field.themes")}
                        options={thematicCategories.map((c) => c.code)}
                        getOptionLabel={(option) => thematicCategories.find((c) => c.code === option)?.text ?? String(option)}
                        searchFilter={{ limit: 40 }}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        value={field.value ?? []}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        multiple
                    />
                )}
            />

            <Controller
                control={control}
                name="inspireKeywords"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label={t("field.inspireKeywords")}
                        options={inspireKeywords}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        value={field.value ?? []}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        multiple
                    />
                )}
            />

            <Controller
                control={control}
                name="additionalKeywords"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label={t("field.additionalKeywords")}
                        options={[]}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        value={field.value ?? []}
                        onChange={(_, value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        multiple
                        freeSolo
                    />
                )}
            />
        </div>
    );
}
