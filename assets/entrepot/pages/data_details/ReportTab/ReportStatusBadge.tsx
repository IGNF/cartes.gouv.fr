import { CheckDetailed, ProcessingExecution, StoredDataStatusEnum, UploadStatusEnum } from "@/@types/app";
import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC, memo } from "react";

type ReportStatusBadgeProps = {
    status: ProcessingExecution["status"] | StoredDataStatusEnum | UploadStatusEnum | CheckDetailed["status"];
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
        case "CHECKING":
            severity = "info";
            text = "En cours de vérification";
            break;
        case "SUCCESS":
        case "GENERATED":
            severity = "success";
            text = "Réussie";
            break;
        case "CLOSED":
            severity = "success";
            text = "Fermée";
            break;
        case "OPEN":
            severity = "info";
            text = "Ouverte";
            break;
        case "DELETED":
            severity = "info";
            text = "Supprimée";
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
