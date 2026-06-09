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
                state={errors.file_identifier ? "error" : "info"}
                stateRelatedMessage={
                    errors.file_identifier?.message ?? "Cet identifiant unique est associé à votre donnée et s'affichera dans l'URL de votre fiche de donnée. "
                }
                nativeInputProps={{ ...register("file_identifier") }}
            />

            <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange, onBlur } }) => (
                    <MarkdownEditor
                        label={t("field.description")}
                        state={errors.description ? "error" : "default"}
                        stateRelatedMessage={errors.description?.message}
                        value={value ?? ""}
                        onChange={onChange}
                        onBlur={onBlur}
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
                name="keywords_inspire"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label={t("field.inspireKeywords")}
                        options={inspireKeywords}
                        searchFilter={{ limit: undefined }}
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
                name="keywords_additional"
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
                        popupIcon={null}
                        forcePopupIcon={false}
                    />
                )}
            />
        </div>
    );
}
