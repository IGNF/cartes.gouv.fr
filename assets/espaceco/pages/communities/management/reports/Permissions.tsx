import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { ReportFormType } from "../../../../../@types/app_espaceco";
import { useTranslation } from "../../../../../i18n/i18n";

type PermissionsProps = {
    form: UseFormReturn<ReportFormType>;
};

const Permissions: FC<PermissionsProps> = ({ form }) => {
    const { t } = useTranslation("ManageCommunity");

    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div>
            <h3>{t("report.manage_permissions")}</h3>
            <Checkbox
                legend={t("report.manage_permissions.shared_report")}
                hintText={t("report.manage_permissions.shared_report_hint")}
                options={["all", "restrained", "personal"].map((option) => {
                    return {
                        label: t("report.manage_permissions.shared_report.option", { option: option }),
                        nativeInputProps: {
                            ...register("shared_georem"),
                            value: option,
                        },
                    };
                })}
                state={errors.shared_themes ? "error" : "default"}
                stateRelatedMessage={errors?.shared_themes?.message}
            />
        </div>
    );
};

export default Permissions;
