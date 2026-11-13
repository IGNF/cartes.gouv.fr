import { fr } from "@codegouvfr/react-dsfr";
import Badge, { BadgeProps } from "@codegouvfr/react-dsfr/Badge";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { FC } from "react";
import { tss } from "tss-react";

import { useTranslation } from "../../../../../i18n";

import franceMapSvg from "@/img/france-full-map.svg?raw";

// waiting : pas d’entrée, badge gris sans severity
const severityByStatus: Partial<Record<string, BadgeProps["severity"]>> = {
    successful: "success",
    in_progress: "info",
    failed: "error",
};

const IntegrationStepStatusBadge: FC<{ status: string }> = ({ status }) => {
    const { t } = useTranslation("DatasheetUploadIntegration");

    // le DSFR impose l’icône de statut sur un badge à severity : pour in_progress, icône play-circle du design posée en enfant
    const inProgress = status === "in_progress";
    return (
        <Badge small severity={severityByStatus[status]} noIcon={inProgress}>
            {inProgress && <span className={fr.cx("fr-icon-play-circle-fill", "fr-icon--xs", "fr-mr-1v")} aria-hidden="true" />}
            {t("step_status_text", { step_status: status })}
        </Badge>
    );
};

type DatasheetUploadIntegrationViewProps = {
    datastoreId: string;
    datasheetName: string | undefined;
    steps: (readonly [string, string])[] | undefined;
    failed: boolean;
    processingLaunched: boolean;
    vectorDbId: string | undefined;
    onDatasheetViewClick: (() => void) | undefined;
};

const DatasheetUploadIntegrationView: FC<DatasheetUploadIntegrationViewProps> = ({
    datastoreId,
    datasheetName,
    steps,
    failed,
    processingLaunched,
    vectorDbId,
    onDatasheetViewClick,
}) => {
    const { t } = useTranslation("DatasheetUploadIntegration");
    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.root, fr.cx("fr-pb-4w"))}>
            <h2 className={fr.cx("fr-h4", "fr-mt-4v")}>{failed ? t("integration_failed") : t("data_integration_in_progress")}</h2>

            {/* SVG inliné pour que ses variables CSS DSFR suivent le thème clair/sombre */}
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-3w")} aria-hidden="true" dangerouslySetInnerHTML={{ __html: franceMapSvg }} />

            {steps && (
                <div className={fr.cx("fr-mt-5w")}>
                    {steps.map(([step, status]) => (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle", "fr-mt-3w")} key={step}>
                            <p className={fr.cx("fr-mb-0", "fr-mr-1w")}>{t("step_title", { step_name: step })}</p>
                            <IntegrationStepStatusBadge status={status} />
                        </div>
                    ))}
                </div>
            )}

            {processingLaunched && <p className={cx(classes.centered, fr.cx("fr-mt-3w", "fr-mb-0"))}>{t("continue_browsing_data_not_ready")}</p>}

            {onDatasheetViewClick && (
                <ButtonsGroup
                    className={fr.cx("fr-mt-3w")}
                    alignment="center"
                    buttons={[{ children: t("view_datasheet"), onClick: onDatasheetViewClick }]}
                    inlineLayoutWhen="always"
                />
            )}

            {failed && vectorDbId && (
                <ButtonsGroup
                    className={fr.cx("fr-mt-3w")}
                    alignment="center"
                    buttons={[
                        {
                            children: t("check_error_report"),
                            linkProps: {
                                to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$storedDataId/details",
                                params: { datastoreId, storedDataId: vectorDbId },
                                search: { datasheetName },
                            },
                        },
                        {
                            children: t("back_to_datasheet_list"),
                            linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } },
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
    centered: {
        textAlign: "center",
    },
});

export default DatasheetUploadIntegrationView;
