import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ReportFormType } from "../../../../../@types/app_espaceco";
import { ReportStatusesType } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { EditReportParameterModal, EditReportStatusDialog } from "./EditReportStatusDialog";
import { statusesAlwaysActive } from "./Utils";

type ReportStatusesProps = {
    form: UseFormReturn<ReportFormType>;
    state?: "default" | "error" | "success";
};

// const minStatuses = getMinAuthorizedStatus();

const ReportStatuses: FC<ReportStatusesProps> = ({ form, state }) => {
    const { t: tStatus } = useTranslation("ReportStatuses");
    const { t } = useTranslation("ManageCommunity");

    const {
        watch,
        register,
        setValue: setFormValue,
        formState: { errors },
    } = form;
    const statuses = watch("report_statuses");

    const [currentStatus, setCurrentStatus] = useState<ReportStatusesType | undefined>();

    // Changement d'etat d'un checkbox
    /*const handleOnChange = (status: string, checked: boolean) => {
        const v = { ...statuses };
        const num = countActiveStatus(v);
        if ((!checked && num > minStatuses) || checked) {
            v[status].active = checked;
        }
        setFormValue("report_statuses", v);
    }; */

    return (
        <div className={fr.cx("fr-input-group", "fr-my-1w", state === "error" && "fr-input-group--error")}>
            <h3>{t("report.configure_statuses")}</h3>
            <span className={fr.cx("fr-hint-text")}>{t("report.configure_statuses.explain")}</span>
            <div className={fr.cx("fr-mt-2v")}>
                <Checkbox
                    className={fr.cx("fr-m-0")}
                    options={Object.keys(statuses).map((s) => {
                        const label = (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--top")}>
                                {statuses[s].title}
                                <Button
                                    title={tStatus("parameter")}
                                    priority="tertiary no outline"
                                    iconId="fr-icon-edit-line"
                                    size="small"
                                    onClick={() => {
                                        setCurrentStatus(s as ReportStatusesType);
                                        EditReportParameterModal.open();
                                    }}
                                />
                            </div>
                        );
                        return {
                            label: label,
                            nativeInputProps: {
                                ...register(`report_statuses.${s}.active`),
                                disabled: statusesAlwaysActive.includes(s),
                            },
                        };
                    })}
                />
            </div>
            {state !== "default" && (
                <p
                    className={fr.cx(
                        (() => {
                            switch (state) {
                                case "error":
                                    return "fr-error-text";
                                case "success":
                                    return "fr-valid-text";
                            }
                        })()
                    )}
                >
                    {errors.report_statuses?.root?.message}
                </p>
            )}
            <EditReportStatusDialog
                status={currentStatus}
                statusParams={currentStatus ? statuses?.[currentStatus] : undefined}
                onModify={(values) => {
                    if (currentStatus) {
                        const v = { ...statuses };
                        v[currentStatus] = { ...v[currentStatus], ...values };
                        setFormValue("report_statuses", v);
                    }
                }}
            />
        </div>
    );
};

export default ReportStatuses;
