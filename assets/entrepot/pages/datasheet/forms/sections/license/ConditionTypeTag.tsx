import Tag from "@codegouvfr/react-dsfr/Tag";
import { useFormContext, useWatch } from "react-hook-form";

import { useTranslation } from "@/i18n/i18n";
import { type ConstraintType, type MetadataFormValues } from "../../metadataSchema";

// ---------------------------------------------------------------------------
// Sous-composant : tag de type de condition en direct (useWatch)
// ---------------------------------------------------------------------------

interface ConditionTypeTagProps {
    conditionIndex: number;
}

export default function ConditionTypeTag({ conditionIndex }: ConditionTypeTagProps) {
    const { t } = useTranslation("DatasheetSections");
    const { control } = useFormContext<Partial<MetadataFormValues>>();
    const type = useWatch({ control, name: `resourceConstraints.${conditionIndex}.type` }) as ConstraintType | undefined;
    if (!type) return null;
    return <Tag small>{t("license.conditionType", { type })}</Tag>;
}
