import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useToggle } from "@mantine/hooks";
import { useFormContext, useWatch } from "react-hook-form";
import { useStyles } from "tss-react";

import { useTranslation } from "@/i18n/i18n";
import {
    CLASSIFICATION_CODES,
    PUBLIC_ACCESS_LIMITATIONS,
    RESTRICTION_CODES,
    type ConstraintType,
    type MetadataFormValues,
    type RestrictionCode,
    type SubConstraintFormValues,
    type SubConstraintType,
} from "../../metadataSchema";

// ---------------------------------------------------------------------------
// Sous-encart : une contrainte dans une condition
// ---------------------------------------------------------------------------

interface SubConstraintCardProps {
    conditionType: ConstraintType;
    conditionIndex: number;
    constraintIndex: number;
    field: SubConstraintFormValues & { id: string };
    onTypeChange: (constraintIndex: number, prevType: SubConstraintType | "" | undefined, newType: SubConstraintType) => void;
    onRestrictionCodeChange: (constraintIndex: number, newCode: RestrictionCode) => void;
    onRemove: (constraintIndex: number) => void;
}

export default function SubConstraintCard({
    conditionType,
    conditionIndex,
    constraintIndex,
    field,
    onTypeChange,
    onRestrictionCodeChange,
    onRemove,
}: SubConstraintCardProps) {
    const { t } = useTranslation("DatasheetSections");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<Partial<MetadataFormValues>>();

    const { css, cx } = useStyles();

    const [collapsed, toggleCollapsed] = useToggle();

    const constraintErrors = errors.resource_constraints?.[conditionIndex]?.constraints?.[constraintIndex];
    const fieldName = `resource_constraints.${conditionIndex}.constraints.${constraintIndex}` as const;

    // Type live de la contrainte - le snapshot useFieldArray (field.type) ne se rafraîchit
    // qu'après une opération de tableau ; useWatch garantit la valeur courante du registre.
    const liveType = useWatch({ control, name: `${fieldName}.type` }) as SubConstraintType | "" | undefined;

    // Sous-types sélectionnables selon le type de condition.
    // Pour « légal » : seulement useConstraints / accessConstraints / useLimitation.
    // otherConstraints est auto-seulement : on l'inclut uniquement si la carte est un
    // compagnon verrouillé de ce type afin que son libellé s'affiche dans le select désactivé.
    const availableSubTypes: SubConstraintType[] = (() => {
        switch (conditionType) {
            case "legal": {
                const base: SubConstraintType[] = ["useConstraints", "accessConstraints", "useLimitation"];
                return liveType === "otherConstraints" ? [...base, "otherConstraints"] : base;
            }
            case "security":
                // Pour sécurité : classification + useLimitation uniquement
                return ["classification", "useLimitation"];
            case "other":
                return ["useLimitation"];
        }
    })();

    return (
        <div
            className={css({
                borderLeft: `4px solid ${fr.colors.decisions.border.open.blueFrance.default}`,
                paddingLeft: fr.spacing("4v"),
                paddingTop: fr.spacing("3v"),
                paddingBottom: fr.spacing("3v"),
                marginBottom: fr.spacing("3v"),
            })}
        >
            {/* En-tête sous-encart */}
            <div
                className={css({
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: collapsed ? 0 : fr.spacing("3v"),
                    gap: fr.spacing("2v"),
                })}
            >
                <div
                    className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: fr.spacing("3v"),
                    })}
                >
                    <span className={fr.cx("fr-icon-corner-down-right-fill", "fr-icon--sm")} />
                    <p className={cx(fr.cx("fr-text--xs", "fr-m-0"), css({ color: fr.colors.decisions.text.mention.grey.default }))}>
                        {`${t("license.constraint.card.title")} ${constraintIndex + 1}`}
                    </p>
                    {liveType && <Tag small>{t("license.subConstraintType", { type: liveType as SubConstraintType })}</Tag>}
                </div>
                <div
                    className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: fr.spacing("2v"),
                        flexShrink: 0,
                    })}
                >
                    <Button
                        iconId={collapsed ? "fr-icon-arrow-down-s-line" : "fr-icon-arrow-up-s-line"}
                        priority="tertiary no outline"
                        type="button"
                        size="small"
                        onClick={() => toggleCollapsed()}
                    >
                        {collapsed ? t("license.constraint.unfold") : t("license.constraint.fold")}
                    </Button>
                    {/* Bouton supprimer masqué pour les compagnons verrouillés */}
                    {!field.locked && (
                        <Button
                            iconId="fr-icon-delete-line"
                            priority="tertiary no outline"
                            type="button"
                            size="small"
                            onClick={() => onRemove(constraintIndex)}
                        >
                            {t("license.constraint.remove")}
                        </Button>
                    )}
                </div>
            </div>
            {!collapsed && (
                <>
                    {/* Select type de contrainte - pattern register (ProducerSection) pour éviter le conflit
                        de type strict de nativeSelectProps.value avec Controller */}
                    {(() => {
                        const typeReg = register(`${fieldName}.type`);
                        return (
                            <Select
                                label={t("field.constraintType")}
                                placeholder={t("license.subConstraintType.placeholder")}
                                options={availableSubTypes.map((st) => ({
                                    value: st,
                                    label: t("license.subConstraintType", { type: st }),
                                }))}
                                nativeSelectProps={{
                                    ...typeReg,
                                    disabled: field.locked || conditionType !== "legal",
                                    onChange: (e) => {
                                        const newType = e.target.value as SubConstraintType;
                                        void typeReg.onChange(e);
                                        // Transmettre le type précédent (live) pour que ConditionCard
                                        // puisse effectuer la chirurgie compagnon sur la bonne valeur.
                                        onTypeChange(constraintIndex, liveType, newType);
                                    },
                                }}
                                state={constraintErrors?.type ? "error" : "default"}
                                stateRelatedMessage={constraintErrors?.type?.message}
                            />
                        );
                    })()}

                    {/* Champs conditionnels selon le type */}

                    {/* useConstraints / accessConstraints → Select MD_RestrictionCode */}
                    {(liveType === "useConstraints" || liveType === "accessConstraints") &&
                        (() => {
                            const codeReg = register(`${fieldName}.restriction_code`);
                            return (
                                <Select
                                    label={t("field.constraintValue")}
                                    placeholder={t("license.restrictionCode.placeholder")}
                                    options={RESTRICTION_CODES.map((code) => ({
                                        value: code,
                                        label: t("license.restrictionCode", { code }),
                                    }))}
                                    nativeSelectProps={{
                                        ...codeReg,
                                        onChange: (e) => {
                                            const newCode = e.target.value as RestrictionCode;
                                            void codeReg.onChange(e);
                                            onRestrictionCodeChange(constraintIndex, newCode);
                                        },
                                    }}
                                    state={constraintErrors?.restriction_code ? "error" : "default"}
                                    stateRelatedMessage={constraintErrors?.restriction_code?.message}
                                />
                            );
                        })()}

                    {/* otherConstraints → Select LimitationsOnPublicAccess */}
                    {liveType === "otherConstraints" && (
                        <Select
                            label={t("field.constraintRestriction")}
                            placeholder={t("license.limitationCode.placeholder")}
                            options={PUBLIC_ACCESS_LIMITATIONS.map((code) => ({
                                value: code,
                                label: t("license.limitationCode", { code }),
                            }))}
                            nativeSelectProps={{ ...register(`${fieldName}.limitation_code`) }}
                            state={constraintErrors?.limitation_code ? "error" : "default"}
                            stateRelatedMessage={constraintErrors?.limitation_code?.message}
                        />
                    )}

                    {/* classification → Select MD_ClassificationCode */}
                    {liveType === "classification" && (
                        <Select
                            label={t("field.constraintValue")}
                            placeholder={t("license.classificationCode.placeholder")}
                            options={CLASSIFICATION_CODES.map((code) => ({
                                value: code,
                                label: t("license.classificationCode", { code }),
                            }))}
                            nativeSelectProps={{ ...register(`${fieldName}.classification_code`) }}
                            state={constraintErrors?.classification_code ? "error" : "default"}
                            stateRelatedMessage={constraintErrors?.classification_code?.message}
                        />
                    )}

                    {/* useLimitation → URL (optionnel) + description (obligatoire) */}
                    {liveType === "useLimitation" && (
                        <>
                            <Input
                                label={t("field.constraintUrl")}
                                hintText={t("field.constraintUrl.hint")}
                                state={constraintErrors?.url ? "error" : "default"}
                                stateRelatedMessage={constraintErrors?.url?.message}
                                nativeInputProps={{ ...register(`${fieldName}.url`), type: "url" }}
                            />
                            <Input
                                label={t("field.constraintDescription")}
                                hintText={t("field.constraintDescription.hint")}
                                state={constraintErrors?.description ? "error" : "default"}
                                stateRelatedMessage={constraintErrors?.description?.message}
                                textArea={true}
                                nativeTextAreaProps={{ ...register(`${fieldName}.description`), rows: 3 }}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
