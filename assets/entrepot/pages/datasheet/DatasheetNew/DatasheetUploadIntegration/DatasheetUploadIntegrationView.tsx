import { fr } from "@codegouvfr/react-dsfr";
import Badge, { BadgeProps } from "@codegouvfr/react-dsfr/Badge";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { FC } from "react";
import { tss } from "tss-react";

import { Upload } from "@/@types/app";
import { useTranslation } from "../../../../../i18n";
import { routes } from "../../../../../router/router";
import franceMapSvg from "@/img/france-full-map.svg?raw";

export type IntegrationStatus = "at_least_one_failure" | "proc_int_launched" | "all_successful";

type IntegrationStepStatusBadgeProps = {
    status: string;
};

const IntegrationStepStatusBadge: FC<IntegrationStepStatusBadgeProps> = ({ status }) => {
    const { t } = useTranslation("DatasheetUploadIntegration");

    let badgeSeverity: BadgeProps["severity"] | undefined = undefined;
    switch (status) {
        case "successful":
            badgeSeverity = "success";
            break;
        case "in_progress":
            badgeSeverity = "info";
            break;
        case "failed":
            badgeSeverity = "error";
            break;
        default:
            // waiting : badge gris sans severity
            badgeSeverity = undefined;
            break;
    }

    // le DSFR impose l’icône de statut sur un badge à severity : pour in_progress, icône play-circle du design posée en enfant
    const inProgress = status === "in_progress";
    return (
        <Badge small severity={badgeSeverity} noIcon={inProgress}>
            {inProgress && <span className={fr.cx("fr-icon-play-circle-fill", "fr-icon--xs", "fr-mr-1v")} aria-hidden="true" />}
            {t("step_status_text", { step_status: status })}
        </Badge>
    );
};

type DatasheetUploadIntegrationViewProps = {
    datastoreId: string;
    datasheetName: string | undefined;
    upload: Upload | undefined;
    integrationProgress: Record<string, string> | null;
    integrationStatus: IntegrationStatus | undefined;
    onDatasheetViewClick: () => void;
};

const DatasheetUploadIntegrationView: FC<DatasheetUploadIntegrationViewProps> = ({
    datastoreId,
    datasheetName,
    upload,
    integrationProgress,
    integrationStatus,
    onDatasheetViewClick,
}) => {
    const { t } = useTranslation("DatasheetUploadIntegration");
    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.root, fr.cx("fr-pb-4w"))}>
            <h2 className={fr.cx("fr-h4", "fr-mt-4v")}>
                {integrationStatus === "at_least_one_failure" ? t("integration_failed") : t("data_integration_in_progress")}
            </h2>

            {/* SVG local statique inliné pour que ses variables CSS DSFR suivent le thème clair/sombre */}
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-3w")} aria-hidden="true" dangerouslySetInnerHTML={{ __html: franceMapSvg }} />

            {integrationProgress && (
                <div className={fr.cx("fr-mt-5w")}>
                    {Object.entries(integrationProgress).map(([step, status]) => (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle", "fr-mt-3w")} key={step}>
                            <p className={fr.cx("fr-mb-0", "fr-mr-1w")}>{t("step_title", { step_name: step })}</p>
                            <IntegrationStepStatusBadge status={status} />
                        </div>
                    ))}
                </div>
            )}

            {integrationStatus === "proc_int_launched" && (
                <p className={cx(classes.continueText, fr.cx("fr-mt-3w", "fr-mb-0"))}>{t("continue_browsing_data_not_ready")}</p>
            )}

            {(integrationStatus === "all_successful" || integrationStatus === "proc_int_launched") && upload?.tags?.datasheet_name !== undefined && (
                <ButtonsGroup
                    className={fr.cx("fr-mt-3w")}
                    alignment="center"
                    buttons={[
                        {
                            children: t("view_datasheet"),
                            onClick: onDatasheetViewClick,
                        },
                    ]}
                    inlineLayoutWhen="always"
                />
            )}

            {integrationStatus === "at_least_one_failure" && upload?.tags?.datasheet_name !== undefined && (
                <ButtonsGroup
                    className={fr.cx("fr-mt-3w")}
                    alignment="center"
                    buttons={[
                        {
                            children: t("view_datasheet"),
                            onClick: onDatasheetViewClick,
                        },
                    ]}
                    inlineLayoutWhen="always"
                />
            )}

            {integrationStatus === "at_least_one_failure" && upload?.tags?.vectordb_id !== undefined && (
                <ButtonsGroup
                    className={fr.cx("fr-mt-3w")}
                    alignment="center"
                    buttons={[
                        {
                            children: t("check_error_report"),
                            linkProps: routes.datastore_stored_data_details({
                                datastoreId,
                                storedDataId: upload?.tags?.vectordb_id,
                                datasheetName,
                            }).link,
                        },
                        {
                            children: t("back_to_datasheet_list"),
                            linkProps: routes.datasheet_list({ datastoreId }).link,
                            priority: "secondary",
                        },
                    ]}
                    inlineLayoutWhen="always"
                />
            )}
        </div>
    );
};

const useStyles = tss.withName({ DatasheetUploadIntegrationView }).create({
    root: {
        width: "32.75rem",
        maxWidth: "100%",
        margin: "0 auto",
    },
    continueText: {
        textAlign: "center",
    },
});

export default DatasheetUploadIntegrationView;
