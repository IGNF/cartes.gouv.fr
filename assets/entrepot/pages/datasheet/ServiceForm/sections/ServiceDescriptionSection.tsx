import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { type ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { type DatasheetStoredDataItem, StoredDataTypeEnum } from "@/@types/app";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import ImageFieldUpload from "@/components/Input/ImageFieldUpload";
import { useTranslation } from "@/i18n";
import { getThematicCategories } from "@/utils";
import { SERVICE_IMAGE_ACCEPT, SERVICE_IMAGE_MAX_SIZE_MB, type ServiceFormValues } from "../serviceFormSchema";

const thematicCategories = getThematicCategories();
const thematicCategoryLabels = new Map(thematicCategories.map((category) => [category.code, category.text]));

type ServiceDescriptionSectionProps = {
    /** données stockées compatibles avec le type de flux choisi ; absentes, la donnée est affichée en texte (flux publié) */
    storedDataOptions?: DatasheetStoredDataItem[];
    onStoredDataChange?: (storedDataId: string) => void;
    storedDataLabel: string;
    storedDataName?: string;
    /** affiché sous la liste des données */
    storedDataNotice?: ReactNode;
    /** type de donnée dans le libellé, quand la liste mêle vecteur et raster */
    withDataKind: boolean;
    /** description du flux, sauf en WFS où chaque table a la sienne */
    withDescription: boolean;
    thumbnailUrl?: string;
    /** nom technique d’un flux publié : affiché en lecture seule, hors du formulaire (figé) */
    technicalName?: string;
};

export default function ServiceDescriptionSection({
    storedDataOptions,
    onStoredDataChange,
    storedDataLabel,
    storedDataName,
    storedDataNotice,
    withDataKind,
    withDescription,
    thumbnailUrl,
    technicalName,
}: ServiceDescriptionSectionProps) {
    const { t } = useTranslation("ServiceForm");
    const {
        register,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext<ServiceFormValues>();

    // thématiques choisies au dépôt, portées par la donnée stockée : préremplissage, modifiable ensuite
    const prefillThemes = (storedDataId: string) => {
        if (getValues("themes").length > 0) return;
        const themes = (storedDataOptions?.find((option) => option._id === storedDataId)?.tags.theme ?? "")
            .split(",")
            .map((theme) => theme.trim())
            .filter((theme) => thematicCategoryLabels.has(theme));
        setValue("themes", themes);
    };

    return (
        <div>
            {storedDataOptions === undefined ? (
                <div className={fr.cx("fr-mb-3w")}>
                    <p className={fr.cx("fr-label", "fr-mb-1v")}>{storedDataLabel}</p>
                    <p className={fr.cx("fr-mb-0")}>{storedDataName ?? "-"}</p>
                </div>
            ) : (
                <Controller
                    control={control}
                    name="stored_data_id"
                    render={({ field, fieldState: { error } }) => (
                        <Select
                            label={storedDataLabel}
                            placeholder={t("stored_data.placeholder")}
                            options={storedDataOptions.map((option) => ({
                                value: option._id,
                                label: withDataKind
                                    ? `${option.name} (${t(option.type === StoredDataTypeEnum.ROK4PYRAMIDRASTER ? "type.raster" : "type.vector")})`
                                    : option.name,
                            }))}
                            state={error ? "error" : "default"}
                            stateRelatedMessage={error?.message}
                            nativeSelectProps={{
                                value: field.value,
                                onBlur: field.onBlur,
                                onChange: (e) => {
                                    field.onChange(e.target.value);
                                    prefillThemes(e.target.value);
                                    onStoredDataChange?.(e.target.value);
                                },
                            }}
                        />
                    )}
                />
            )}
            {storedDataNotice}

            <Input
                label={t("title.label")}
                hintText={t("title.hint")}
                state={errors.title ? "error" : "default"}
                stateRelatedMessage={errors.title?.message}
                nativeInputProps={register("title")}
            />

            {withDescription && (
                <Input
                    label={t("description.label")}
                    textArea
                    state={errors.description ? "error" : "default"}
                    stateRelatedMessage={errors.description?.message}
                    nativeTextAreaProps={{ ...register("description"), rows: 3 }}
                />
            )}

            {technicalName === undefined ? (
                <Input
                    label={t("technical_name.label")}
                    hintText={t("technical_name.hint")}
                    state={errors.technical_name ? "error" : "default"}
                    stateRelatedMessage={errors.technical_name?.message}
                    nativeInputProps={register("technical_name")}
                />
            ) : (
                <Input label={t("technical_name.label")} nativeInputProps={{ value: technicalName, readOnly: true }} />
            )}

            <ImageFieldUpload
                name="thumbnail"
                label={t("thumbnail.label")}
                hintText={t("image.hint", { max: SERVICE_IMAGE_MAX_SIZE_MB })}
                modalTitle={t("thumbnail.modal_title")}
                accept={SERVICE_IMAGE_ACCEPT}
                maxFileSizeMb={SERVICE_IMAGE_MAX_SIZE_MB}
                existingUrl={thumbnailUrl}
            />

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
                        // un fieldset désactivé n’empêche pas MUI d’ouvrir la liste
                        disabled={field.disabled}
                        multiple
                    />
                )}
            />
        </div>
    );
}
