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

export default function DescriptionSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    return (
        <div>
            <ImageFieldUpload name="thumbnail" label={t("field.thumbnail")} hintText={t("field.thumbnail.hint")} accept=".jpg, .jpeg, .svg" />

            <Input
                label={t("field.name")}
                state={errors.name ? "error" : "default"}
                stateRelatedMessage={errors.name?.message}
                nativeInputProps={{ ...register("name") }}
            />

            <Input
                label={t("field.uniqueId")}
                hintText={t("field.uniqueId.hint")}
                state={errors.uniqueId ? "error" : "default"}
                stateRelatedMessage={errors.uniqueId?.message}
                nativeInputProps={{ ...register("uniqueId") }}
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
