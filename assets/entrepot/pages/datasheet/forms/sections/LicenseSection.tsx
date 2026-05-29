import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { useFieldArray, useFormContext } from "react-hook-form";

import { useTranslation } from "@/i18n/i18n";

import { LicenseFormValues, MetadataFormValues } from "../metadataSchema";

const emptyLicense: LicenseFormValues = { conditionType: "", constraintType: "" };

export default function LicenseSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    const { fields, append, remove } = useFieldArray({ control, name: "licenses" });

    return (
        <div>
            {fields.map((field, index) => {
                const fieldErrors = errors.licenses?.[index];
                return (
                    <div
                        key={field.id}
                        className={fr.cx("fr-p-3w", "fr-mb-3w")}
                        style={{ border: `1px solid ${fr.colors.decisions.border.default.grey.default}` }}
                    >
                        <p className={fr.cx("fr-text--bold", "fr-mb-2w")}>
                            {t("license.card.title")} {index + 1}
                        </p>

                        <Input
                            label={t("field.conditionType")}
                            state={fieldErrors?.conditionType ? "error" : "default"}
                            stateRelatedMessage={fieldErrors?.conditionType?.message}
                            nativeInputProps={{ ...register(`licenses.${index}.conditionType`) }}
                        />

                        <Input
                            label={t("field.constraintType")}
                            state={fieldErrors?.constraintType ? "error" : "default"}
                            stateRelatedMessage={fieldErrors?.constraintType?.message}
                            nativeInputProps={{ ...register(`licenses.${index}.constraintType`) }}
                        />

                        <Button iconId="fr-icon-delete-line" priority="tertiary" type="button" className={fr.cx("fr-mt-2w")} onClick={() => remove(index)}>
                            {t("license.remove")}
                        </Button>
                    </div>
                );
            })}

            <Button iconId="fr-icon-add-line" priority="tertiary" type="button" onClick={() => append(emptyLicense)}>
                {t("license.add")}
            </Button>
        </div>
    );
}
