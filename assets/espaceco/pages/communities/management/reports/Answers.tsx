import { fr } from "@codegouvfr/react-dsfr";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { FC } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { ReportFormType } from "../../../../../@types/app_espaceco";
import { useTranslation } from "../../../../../i18n/i18n";

type AnswersProps = {
    form: UseFormReturn<ReportFormType>;
};

const Answers: FC<AnswersProps> = ({ form }) => {
    const { t } = useTranslation("ManageCommunity");

    const { control, watch } = form;

    const allMembersCanValid = watch("all_members_can_valid");

    return (
        <div>
            <div className={fr.cx("fr-mb-2v", "fr-text--regular")}>{t("report.manage_permissions.report_answers")}</div>
            <Controller
                control={control}
                name="all_members_can_valid"
                render={({ field: { onChange } }) => (
                    <ToggleSwitch
                        className={fr.cx("fr-mb-3w")}
                        label={t("report.manage_permissions.authorize")}
                        helperText={t("report.manage_permissions.authorize_hint")}
                        showCheckedHint
                        checked={allMembersCanValid}
                        onChange={onChange}
                    />
                )}
            />
        </div>
    );
};

export default Answers;
