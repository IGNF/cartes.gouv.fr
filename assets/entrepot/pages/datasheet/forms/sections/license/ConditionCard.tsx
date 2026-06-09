import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useToggle } from "@mantine/hooks";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useStyles } from "tss-react";

import { useTranslation } from "@/i18n/i18n";
import {
    CONSTRAINT_TYPES,
    makeDefaultConstraints,
    makeLockedOtherConstraints,
    makeLockedUseLimitation,
    type ConstraintType,
    type MetadataFormValues,
    type RestrictionCode,
    type SubConstraintFormValues,
    type SubConstraintType,
} from "../../metadataSchema";
import ConditionTypeTag from "./ConditionTypeTag";
import SubConstraintCard from "./SubConstraintCard";

// ---------------------------------------------------------------------------
// Sous-composant : encart de condition (contient le useFieldArray imbriqué)
// ---------------------------------------------------------------------------

interface ConditionCardProps {
    conditionIndex: number;
    onRemoveCondition: (conditionIndex: number) => void;
}

export default function ConditionCard({ conditionIndex, onRemoveCondition }: ConditionCardProps) {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        getValues,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    const { css } = useStyles();

    // Repli/dépli de la carte condition (Figma)
    const [collapsed, toggleCollapsed] = useToggle();

    // useFieldArray imbriqué : doit vivre dans ce composant enfant (règle react-hook-form)
    const { fields, append, remove, update, insert } = useFieldArray({
        control,
        name: `resource_constraints.${conditionIndex}.constraints`,
    });

    // Type de condition courant (pour les règles métier de chirurgie)
    const conditionType = useWatch({
        control,
        name: `resource_constraints.${conditionIndex}.type`,
    }) as ConstraintType | undefined;

    const conditionErrors = errors.resource_constraints?.[conditionIndex];

    // ----- Handlers de chirurgie sur les sous-contraintes -----

    /**
     * Changement de sous-type d'une contrainte non verrouillée.
     * Règle : use/access → non-use/access : supprimer le compagnon à i+1.
     *         non-use/access → use/access : insérer un compagnon useLimitation à i+1.
     *
     * prevType est passé depuis SubConstraintCard (valeur live via useWatch), pas depuis le
     * snapshot useFieldArray qui serait figé lors de changements consécutifs sans opération de tableau.
     */
    function handleSubTypeChange(constraintIndex: number, prevType: SubConstraintType | "" | undefined, newType: SubConstraintType) {
        const wasUseOrAccess = prevType === "useConstraints" || prevType === "accessConstraints";
        const isUseOrAccess = newType === "useConstraints" || newType === "accessConstraints";

        if (wasUseOrAccess && !isUseOrAccess) {
            // Le sous-encart précédent avait un compagnon à constraintIndex+1 : le supprimer.
            // On lit le compagnon via getValues (pas le snapshot figé) pour vérifier le locked.
            const companion = getValues(`resource_constraints.${conditionIndex}.constraints.${constraintIndex + 1}` as const);
            if (companion?.locked) {
                remove(constraintIndex + 1);
            }
        } else if (!wasUseOrAccess && isUseOrAccess) {
            // Nouveau sous-type avec compagnon : insérer un useLimitation verrouillé à constraintIndex+1
            insert(constraintIndex + 1, makeLockedUseLimitation() as SubConstraintFormValues & { id: string });
        }
        // Si le type reste dans le même groupe (use/access ↔ use/access), on ne touche pas au compagnon.
    }

    /**
     * Changement de valeur (restriction_code) pour useConstraints ou accessConstraints.
     * Règle INSPIRE : si la valeur passe à « otherRestrictions », le compagnon useLimitation
     * devient otherConstraints ; si elle quitte « otherRestrictions », le compagnon
     * otherConstraints redevient useLimitation.
     *
     * On lit le compagnon via getValues pour éviter le snapshot figé.
     */
    function handleRestrictionCodeChange(constraintIndex: number, newCode: RestrictionCode) {
        const companion = getValues(`resource_constraints.${conditionIndex}.constraints.${constraintIndex + 1}` as const);
        if (!companion?.locked) return; // pas de compagnon géré → rien à faire

        if (newCode === "otherRestrictions" && companion.type !== "otherConstraints") {
            // Franchit la frontière otherRestrictions : compagnon → otherConstraints
            update(constraintIndex + 1, makeLockedOtherConstraints() as SubConstraintFormValues & { id: string });
        } else if (newCode !== "otherRestrictions" && companion.type === "otherConstraints") {
            // Quitte otherRestrictions : compagnon → useLimitation
            update(constraintIndex + 1, makeLockedUseLimitation() as SubConstraintFormValues & { id: string });
        }
        // Sinon : dans le même groupe → compagnon conservé tel quel
    }

    /**
     * Suppression d'un sous-encart.
     * Si le sous-encart a un compagnon verrouillé à constraintIndex+1, on les supprime ensemble.
     * On lit type et compagnon via getValues pour éviter le snapshot figé.
     */
    function handleRemoveSubConstraint(constraintIndex: number) {
        const current = getValues(`resource_constraints.${conditionIndex}.constraints.${constraintIndex}` as const);
        const currentType = current?.type as SubConstraintType | undefined;
        const isUseOrAccess = currentType === "useConstraints" || currentType === "accessConstraints";
        const companion = getValues(`resource_constraints.${conditionIndex}.constraints.${constraintIndex + 1}` as const);
        if (isUseOrAccess && companion?.locked) {
            remove([constraintIndex, constraintIndex + 1]);
        } else {
            remove(constraintIndex);
        }
    }

    /** Ajouter une contrainte selon le type de condition. */
    function handleAddConstraint() {
        if (conditionType === "legal") {
            // Paire : useConstraints(license) + compagnon useLimitation
            append([
                { type: "useConstraints", locked: false, restriction_code: "license" } as SubConstraintFormValues & { id: string },
                makeLockedUseLimitation() as SubConstraintFormValues & { id: string },
            ]);
        } else {
            // security / other : useLimitation supprimable (type Select désactivé)
            append({ type: "useLimitation", locked: false, description: "" } as SubConstraintFormValues & { id: string });
        }
    }

    return (
        <section>
            {/* En-tête de la carte condition */}
            <div
                className={css({
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: fr.spacing("4v"),
                    gap: fr.spacing("4v"),
                })}
            >
                <div
                    className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: fr.spacing("4v"),
                    })}
                >
                    <p
                        className={css({
                            ...fr.typography["fr-text--xs"],
                            color: fr.colors.decisions.text.mention.grey.default,
                            margin: 0,
                        })}
                    >
                        {`${t("license.card.title")} ${conditionIndex + 1}`}
                    </p>
                    <ConditionTypeTag conditionIndex={conditionIndex} />
                </div>
                <div
                    className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: fr.spacing("2v"),
                    })}
                >
                    <Button
                        iconId="fr-icon-delete-line"
                        priority="tertiary no outline"
                        type="button"
                        size="small"
                        onClick={() => onRemoveCondition(conditionIndex)}
                    >
                        {t("license.remove")}
                    </Button>
                    {/* Chevron repli/dépli — Figma */}
                    <Button
                        iconId={collapsed ? "fr-icon-arrow-down-s-line" : "fr-icon-arrow-up-s-line"}
                        priority="tertiary no outline"
                        type="button"
                        size="small"
                        title={collapsed ? t("license.constraint.unfold") : t("license.constraint.fold")}
                        onClick={() => toggleCollapsed()}
                    />
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* Select type de condition - pattern register (ProducerSection) */}
                    {(() => {
                        const condTypeReg = register(`resource_constraints.${conditionIndex}.type`);
                        return (
                            <Select
                                label={t("field.conditionType")}
                                placeholder={t("license.conditionType.placeholder")}
                                options={CONSTRAINT_TYPES.map((ct) => ({
                                    value: ct,
                                    label: t("license.conditionType", { type: ct }),
                                }))}
                                nativeSelectProps={{
                                    ...condTypeReg,
                                    onChange: (e) => {
                                        const newType = e.target.value as ConstraintType;
                                        void condTypeReg.onChange(e);
                                        // Réinitialiser les sous-contraintes aux défauts du nouveau type :
                                        // on vide le tableau imbriqué puis on injecte les défauts.
                                        if (fields.length > 0) {
                                            remove(fields.map((_, i) => i));
                                        }
                                        append(makeDefaultConstraints(newType) as (SubConstraintFormValues & { id: string })[]);
                                    },
                                }}
                                state={conditionErrors?.type ? "error" : "default"}
                                stateRelatedMessage={conditionErrors?.type?.message}
                            />
                        );
                    })()}

                    {/* Sous-encarts de contraintes */}
                    {conditionType && (
                        <div
                            className={css({
                                marginTop: fr.spacing("4v"),
                                display: "flex",
                                flexDirection: "column",
                                gap: fr.spacing("4v"),
                            })}
                        >
                            {fields.map((field, constraintIndex) => (
                                <SubConstraintCard
                                    key={field.id}
                                    conditionType={conditionType}
                                    conditionIndex={conditionIndex}
                                    constraintIndex={constraintIndex}
                                    field={field as SubConstraintFormValues & { id: string }}
                                    onTypeChange={handleSubTypeChange}
                                    onRestrictionCodeChange={handleRestrictionCodeChange}
                                    onRemove={handleRemoveSubConstraint}
                                />
                            ))}
                            <Button iconId="fr-icon-add-line" priority="tertiary no outline" type="button" onClick={handleAddConstraint}>
                                {t("license.constraint.add")}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
