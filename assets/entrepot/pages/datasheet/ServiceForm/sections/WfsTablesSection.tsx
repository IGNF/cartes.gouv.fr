import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import LoadingText from "@/components/Utils/LoadingText";
import { useTranslation } from "@/i18n";
import { getInspireKeywords } from "@/utils";
import { type ServiceFormValues } from "../serviceFormSchema";

const inspireKeywords = getInspireKeywords();

type WfsTablesSectionProps = {
    /** état du chargement des tables de la base choisie */
    status: "idle" | "pending" | "error" | "success";
};

export default function WfsTablesSection({ status }: WfsTablesSectionProps) {
    const { t } = useTranslation("ServiceForm");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ServiceFormValues>();
    const tables = useWatch({ control, name: "tables" });
    const tablesError = errors.tables?.root?.message ?? errors.tables?.message;

    if (status === "idle") {
        return <p className={fr.cx("fr-text--sm", tablesError !== undefined && "fr-error-text")}>{t("tables.no_stored_data")}</p>;
    }
    if (status === "pending") {
        return <LoadingText as="p" message={t("tables.loading")} withSpinnerIcon />;
    }
    if (status === "error") {
        return <p className={fr.cx("fr-error-text")}>{t("tables.load_error")}</p>;
    }
    if (tables.length === 0) {
        return <p className={fr.cx("fr-text--sm")}>{t("tables.none")}</p>;
    }

    return (
        <div>
            <Checkbox
                legend={t("tables.legend")}
                hintText={t("tables.hint")}
                state={tablesError ? "error" : "default"}
                stateRelatedMessage={tablesError}
                options={tables.map((table, index) => ({
                    label: table.native_name,
                    nativeInputProps: register(`tables.${index}.selected`),
                }))}
            />

            {tables.map((table, index) =>
                table.selected ? (
                    <fieldset key={table.native_name} className={fr.cx("fr-fieldset", "fr-mb-4w")}>
                        <legend className={fr.cx("fr-fieldset__legend", "fr-text--bold")}>{table.native_name}</legend>
                        <div className={fr.cx("fr-fieldset__element")}>
                            <Input
                                label={t("table.title.label")}
                                hintText={t("table.title.hint")}
                                state={errors.tables?.[index]?.title ? "error" : "default"}
                                stateRelatedMessage={errors.tables?.[index]?.title?.message}
                                nativeInputProps={register(`tables.${index}.title`)}
                            />
                            <Input
                                label={t("table.public_name.label")}
                                hintText={t("table.public_name.hint")}
                                state={errors.tables?.[index]?.public_name ? "error" : "default"}
                                stateRelatedMessage={errors.tables?.[index]?.public_name?.message}
                                nativeInputProps={register(`tables.${index}.public_name`)}
                            />
                            <Input
                                label={t("table.description.label")}
                                textArea
                                state={errors.tables?.[index]?.description ? "error" : "default"}
                                stateRelatedMessage={errors.tables?.[index]?.description?.message}
                                nativeTextAreaProps={{ ...register(`tables.${index}.description`), rows: 3 }}
                            />
                            <Controller
                                control={control}
                                name={`tables.${index}.keywords`}
                                render={({ field, fieldState: { error } }) => (
                                    <AutocompleteSelect
                                        label={t("table.keywords.label")}
                                        hintText={t("table.keywords.hint")}
                                        options={inspireKeywords}
                                        searchFilter={{ limit: undefined }}
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error?.message}
                                        value={field.value}
                                        onChange={(_, value) => field.onChange(value)}
                                        onBlur={field.onBlur}
                                        multiple
                                        freeSolo
                                    />
                                )}
                            />
                        </div>
                    </fieldset>
                ) : null
            )}
        </div>
    );
}
