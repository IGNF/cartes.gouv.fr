import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useStyles } from "tss-react";

import { useTranslation } from "@/i18n/i18n";
import { OPEN_LICENSE_URL, makeLegalDefaults, makeOpenLicenseCondition, type MetadataFormValues, type ResourceConstraintFormValues } from "../metadataSchema";
import ConditionCard from "./license/ConditionCard";

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export default function LicenseSection() {
    const { t } = useTranslation("DatasheetSections");
    const {
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    const { css } = useStyles();

    const { fields, append, remove } = useFieldArray({ control, name: "resource_constraints" });

    // Détection de la licence ouverte Etalab pour désactiver le bouton dédié
    const resource_constraints = useWatch({ control, name: "resource_constraints" }) as ResourceConstraintFormValues[] | undefined;
    const hasOpenLicense = (resource_constraints ?? []).some((condition) =>
        condition.constraints?.some((c) => c.type === "useLimitation" && c.url === OPEN_LICENSE_URL)
    );

    function handleAddCondition() {
        // Issue #1050 : le type par défaut d'une nouvelle condition est « légal »
        append({ type: "legal", constraints: makeLegalDefaults() } as unknown as ResourceConstraintFormValues & { id: string });
    }

    function handleAddOpenLicense() {
        append(makeOpenLicenseCondition() as unknown as ResourceConstraintFormValues & { id: string });
    }

    return (
        <>
            <div
                className={css({
                    ["& > section"]: {
                        padding: `${fr.spacing("6v")} 0 !important`,
                        [fr.breakpoints.up("md")]: {
                            padding: `${fr.spacing("10v")} 0 !important`,
                        },
                    },
                    ["& > section:not(:last-child)"]: {
                        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                    },
                    ["& > section:first-of-type"]: {
                        paddingTop: "0 !important",
                    },
                })}
            >
                {fields.map((field, conditionIndex) => (
                    <ConditionCard key={field.id} conditionIndex={conditionIndex} onRemoveCondition={(i) => remove(i)} />
                ))}
                {errors.resource_constraints && (
                    <p className={fr.cx("fr-error-text", "fr-my-4v")}>
                        {Array.isArray(errors.resource_constraints)
                            ? "Veuillez corriger les erreurs dans les conditions de licence."
                            : errors.resource_constraints.message}
                    </p>
                )}
            </div>

            {/* Boutons d'ajout en bas de section */}
            <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="sm and up"
                buttons={[
                    {
                        iconId: "fr-icon-add-line",
                        priority: "tertiary",
                        type: "button",
                        onClick: handleAddOpenLicense,
                        disabled: hasOpenLicense,
                        children: t("license.addOpenLicense"),
                    },
                    {
                        iconId: "fr-icon-add-line",
                        priority: "secondary",
                        type: "button",
                        onClick: handleAddCondition,
                        children: t("license.add"),
                    },
                ]}
            />
        </>
    );
}
