import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { Controller, useFormContext } from "react-hook-form";

import { type DatasheetStoredDataItem } from "@/@types/app";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import ImageFieldUpload from "@/components/Input/ImageFieldUpload";
import { getThematicCategories } from "@/utils/metadata";
import { type ServiceFormValues } from "../serviceFormSchema";

const thematicCategories = getThematicCategories();
const thematicCategoryLabels = new Map(thematicCategories.map((category) => [category.code, category.text]));

export const SERVICE_IMAGE_ACCEPT = ["jpg", "jpeg", "png"];
export const SERVICE_IMAGE_MAX_SIZE_MO = 5;

type ServiceDescriptionSectionProps = {
    /** données stockées compatibles avec le type de flux choisi */
    storedDataOptions: DatasheetStoredDataItem[];
    datasetSelectLabel: string;
    /** droit ANNEX : le champ vignette n’est proposé qu’avec ce droit */
    canManageAnnexes: boolean;
    /** modification : la donnée et le nom technique ne changent plus */
    readOnlyIdentity?: boolean;
};

export default function ServiceDescriptionSection({
    storedDataOptions,
    datasetSelectLabel,
    canManageAnnexes,
    readOnlyIdentity = false,
}: ServiceDescriptionSectionProps) {
    const {
        register,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext<ServiceFormValues>();

    // la donnée stockée porte les thématiques choisies au dépôt : préremplissage, modifiable ensuite
    const prefillThemesFromStoredData = (storedDataId: string) => {
        if (getValues("themes").length > 0) {
            return;
        }
        const storedData = storedDataOptions.find((option) => option._id === storedDataId);
        const themes = (storedData?.tags.theme ?? "")
            .split(",")
            .map((theme) => theme.trim())
            .filter((theme) => thematicCategoryLabels.has(theme));
        setValue("themes", themes);
    };

    return (
        <div>
            <Controller
                control={control}
                name="stored_data_id"
                render={({ field, fieldState: { error } }) => (
                    <Select
                        label={datasetSelectLabel}
                        placeholder="Sélectionner une option"
                        options={storedDataOptions.map((option) => ({ value: option._id, label: option.name }))}
                        state={error ? "error" : "default"}
                        stateRelatedMessage={error?.message}
                        disabled={readOnlyIdentity}
                        nativeSelectProps={{
                            value: field.value,
                            onBlur: field.onBlur,
                            onChange: (e) => {
                                field.onChange(e.target.value);
                                prefillThemesFromStoredData(e.target.value);
                            },
                        }}
                    />
                )}
            />

            <Input
                label="Titre du flux"
                hintText="Titre concis et non-technique permettant aux utilisateurs de comprendre de quel flux il s’agit"
                state={errors.title ? "error" : "default"}
                stateRelatedMessage={errors.title?.message}
                nativeInputProps={{ ...register("title") }}
            />

            <Input
                label="Nom technique du flux"
                hintText="Le nom technique du flux ne doit pas contenir d’espace ni de caractères spéciaux et doit être unique. Il permet d’identifier le flux dans les services qui l’utiliseront."
                state={errors.technical_name ? "error" : "default"}
                stateRelatedMessage={errors.technical_name?.message}
                disabled={readOnlyIdentity}
                nativeInputProps={{ ...register("technical_name") }}
            />

            {canManageAnnexes && (
                <ImageFieldUpload
                    name="thumbnail"
                    label="Vignette (optionnel)"
                    hintText={`Taille maximale : ${SERVICE_IMAGE_MAX_SIZE_MO} Mo. Formats supportés : jpg, png.`}
                    modalTitle="Ajouter une vignette"
                    accept={SERVICE_IMAGE_ACCEPT}
                    maxFileSizeMo={SERVICE_IMAGE_MAX_SIZE_MO}
                />
            )}

            <Controller
                control={control}
                name="themes"
                render={({ field, fieldState: { error } }) => (
                    <AutocompleteSelect
                        label="Thématiques"
                        hintText="Vous pouvez sélectionner plusieurs thématiques"
                        options={thematicCategories.map((category) => category.code)}
                        getOptionLabel={(option) => thematicCategoryLabels.get(option) ?? String(option)}
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
        </div>
    );
}
