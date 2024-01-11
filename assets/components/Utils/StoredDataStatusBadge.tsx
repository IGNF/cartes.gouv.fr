import { fr } from "@codegouvfr/react-dsfr";
import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC } from "react";

import { StoredDataStatusEnum } from "../../types/app";

type StoredDataStatusBadgeProps = {
    status: string;
};

const StoredDataStatusBadge: FC<StoredDataStatusBadgeProps> = ({ status }) => {
    let severity: AlertProps.Severity = "info";
    let text = "";
    switch (status) {
        case StoredDataStatusEnum.GENERATED:
            severity = "success";
            text = "Prêt";
            break;

        case StoredDataStatusEnum.CREATED:
        case StoredDataStatusEnum.GENERATING:
            severity = "warning";
            text = "En cours de génération";
            break;

        case StoredDataStatusEnum.MODIFYING:
            severity = "warning";
            text = "En cours de modification";
            break;

        case StoredDataStatusEnum.UNSTABLE:
            severity = "error";
            text = "Echoué";
            break;

        case StoredDataStatusEnum.DELETED:
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
