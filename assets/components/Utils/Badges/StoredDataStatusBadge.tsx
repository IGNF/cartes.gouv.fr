import { fr } from "@codegouvfr/react-dsfr";
import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC, memo, ReactNode, useMemo } from "react";

import { StoredData, StoredDataStatusEnum } from "../../../@types/app";

type StoredDataStatusBadgeProps = {
    status: StoredData["status"];
};

const StoredDataStatusBadge: FC<StoredDataStatusBadgeProps> = ({ status }) => {
    const { severity, text } = useMemo(() => {
        let severity: AlertProps.Severity = "info";
        let text: NonNullable<ReactNode> = "";

        switch (status) {
            case StoredDataStatusEnum.GENERATED:
                severity = "success";
                text = "Prêt";
                break;

            case StoredDataStatusEnum.CREATED:
            case StoredDataStatusEnum.GENERATING:
                severity = "warning";
                text = (
                    <>
                        En cours de
                        <br />
                        génération
                    </>
                );
                break;

            case StoredDataStatusEnum.MODIFYING:
                severity = "warning";
                text = (
                    <>
                        En cours de
                        <br />
                        modification
                    </>
                );
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
        return {
            severity,
            text,
        };
    }, [status]);

    return (
        <Badge noIcon={true} severity={severity} className={fr.cx("fr-mr-2v")}>
            {text}
        </Badge>
    );
};

export default memo(StoredDataStatusBadge);
