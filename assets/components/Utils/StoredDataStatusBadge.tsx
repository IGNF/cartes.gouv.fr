import { FC } from "react";
import { StoredDataStatuses } from "../../types/app";
import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";

type StoredDataStatusBadgeProps = {
    status: string;
};

const StoredDataStatusBadge: FC<StoredDataStatusBadgeProps> = ({ status }) => {
    let severity: AlertProps.Severity = "info";
    let text = "";
    switch (status) {
        case StoredDataStatuses.GENERATED:
            severity = "success";
            text = "Prêt";
            break;

        case StoredDataStatuses.CREATED:
        case StoredDataStatuses.GENERATING:
            severity = "warning";
            text = "En cours de génération";
            break;

        case StoredDataStatuses.MODIFYING:
            severity = "warning";
            text = "En cours de modification";
            break;

        case StoredDataStatuses.UNSTABLE:
            severity = "error";
            text = "Echoué";
            break;

        case StoredDataStatuses.DELETED:
            severity = "info";
            text = "Supprimé";
            break;

        default:
            break;
    }

    return (
        <Badge noIcon={true} severity={severity} className={fr.cx("fr-mr-2v")}>
            {text}
        </Badge>
    );
};

export default StoredDataStatusBadge;
