import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ReportFormType, ReportStatusesDTO2 } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import getDefaultStatuses from "./Utils";

type ReportStatusesProps = {
    form: UseFormReturn<ReportFormType>;
    statuses?: ReportStatusesDTO2;
};
const ReportStatuses: FC<ReportStatusesProps> = ({ form, statuses }) => {
    const { t } = useTranslation("ManageCommunity");

    const [newStatus, setNewStatus] = useState<ReportStatusesDTO2>(() => {
        return statuses ? { ...statuses } : getDefaultStatuses();
    });

    return (
        <div>
            <h3>{t("report.configure_statuses")}</h3>
            <span className={fr.cx("fr-hint-text")}>{t("report.configure_statuses.explain")}</span>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-6")}>
                    <ul className={fr.cx("fr-raw-list")}>
                        {newStatus.map((s) => (
                            <li key={s.status}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                    <div className={fr.cx("fr-col-10")}>
                                        <Checkbox
                                            options={[
                                                {
                                                    label: s.wording,
                                                    nativeInputProps: {
                                                        value: s.status,
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                    <div className={fr.cx("fr-col-2")}>
                                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                            <Button title={""} priority="secondary" iconId="fr-icon-settings-5-line" size="small" />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportStatuses;
