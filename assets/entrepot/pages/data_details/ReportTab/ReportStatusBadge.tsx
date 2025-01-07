import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC, memo } from "react";

type ReportStatusBadgeProps = {
    status: string;
    className?: string;
};
const ReportStatusBadge: FC<ReportStatusBadgeProps> = ({ status, className }) => {
    let text: string;
    let severity: AlertProps.Severity | "new" | undefined = undefined;

    switch (status) {
        case "CREATED":
            severity = "new";
            text = "En attente de lancement";
            break;
        case "WAITING":
            severity = "info";
            text = "En attente de lancement";
            break;
        case "PROGRESS":
        case "GENERATING":
        case "MODIFYING":
            severity = "info";
            text = "En cours d’exécution";
            break;
        case "SUCCESS":
        case "GENERATED":
            severity = "success";
            text = "Réussie";
            break;
        case "FAILURE":
        case "UNSTABLE":
            severity = "error";
            text = "Echouée";
            break;
        case "ABORTED":
            severity = "error";
            text = "Annulée";
            break;
        default:
            text = "";
    }

    return (
        <Badge severity={severity} className={className}>
            {text}
        </Badge>
    );
};

export default memo(ReportStatusBadge);
