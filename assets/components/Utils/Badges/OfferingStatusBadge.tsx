import { fr } from "@codegouvfr/react-dsfr";
import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC, memo, ReactNode, useMemo } from "react";

import { OfferingStatusEnum } from "../../../@types/app";

type OfferingStatusBadgeProps = {
    status: OfferingStatusEnum;
};

const OfferingStatusBadge: FC<OfferingStatusBadgeProps> = ({ status }) => {
    const { severity, text } = useMemo(() => {
        let severity: AlertProps.Severity = "info";
        let text: NonNullable<ReactNode> = "";

        switch (status) {
            case OfferingStatusEnum.PUBLISHED:
                severity = "success";
                text = "Publié";
                break;

            case OfferingStatusEnum.PUBLISHING:
                severity = "warning";
                text = (
                    <>
                        En cours de
                        <br />
                        publication
                    </>
                );
                break;

            case OfferingStatusEnum.UNPUBLISHING:
                severity = "warning";
                text = (
                    <>
                        En cours de
                        <br />
                        dépublication
                    </>
                );
                break;

            case OfferingStatusEnum.MODIFYING:
                severity = "warning";
                text = (
                    <>
                        En cours de
                        <br />
                        modification
                    </>
                );
                break;

            case OfferingStatusEnum.UNSTABLE:
                severity = "error";
                text = "Echoué";
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

export default memo(OfferingStatusBadge);
