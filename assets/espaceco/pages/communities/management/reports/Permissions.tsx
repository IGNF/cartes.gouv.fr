import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { ReportFormType } from "../../../../../@types/app_espaceco";
import { useTranslation } from "../../../../../i18n/i18n";

type PermissionsProps = {
    form: UseFormReturn<ReportFormType>;
};

const Permissions: FC<PermissionsProps> = ({ form }) => {
    const { t } = useTranslation("ManageCommunity");

    const { register } = form;

    return (
        <div className={fr.cx("fr-mt-6v")}>
            <h3>{t("report.manage_permissions")}</h3>
            <RadioButtons
                legend={t("report.manage_permissions.shared_report")}
                options={["all", "restrained", "personal"].map((option) => {
                    return {
                        label: t("report.manage_permissions.shared_report.option", { option: option }),
                        nativeInputProps: {
                            ...register("shared_georem"),
                            value: option,
                        },
                    };
                })}
            />
        </div>
    );
};

export default Permissions;
