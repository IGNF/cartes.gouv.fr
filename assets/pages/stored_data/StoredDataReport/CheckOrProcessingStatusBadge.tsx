import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC } from "react";

type CheckOrProcessingStatusBadgeProps = {
    status: string;
};
const CheckOrProcessingStatusBadge: FC<CheckOrProcessingStatusBadgeProps> = ({ status }) => {
    let text;
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
            severity = "info";
            text = "En cours d'exécution";
            break;
        case "SUCCESS":
            severity = "success";
            text = "Réussie";
            break;
        case "FAILURE":
            severity = "error";
            text = "Echouée";
            break;
        case "ABORTED":
            severity = "error";
            text = "Annulée";
            break;
    }

    return <Badge severity={severity}>{text}</Badge>;
};

export default CheckOrProcessingStatusBadge;
