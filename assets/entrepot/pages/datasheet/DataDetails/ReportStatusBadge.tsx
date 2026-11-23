import { type AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { type FC, memo } from "react";

import { type CheckStatusEnum, type ProcessingExecution, type StoredDataStatusEnum, type UploadStatusEnum } from "@/@types/app";
import { useTranslation } from "@/i18n";

type ReportStatusBadgeProps = {
    status: ProcessingExecution["status"] | StoredDataStatusEnum | UploadStatusEnum | CheckStatusEnum;
};

type BadgeLook = {
    severity: AlertProps.Severity | "new";
    key: `status.${"waiting" | "progress" | "checking" | "success" | "closed" | "open" | "deleted" | "failure" | "aborted"}`;
};

const LOOKS: Record<string, BadgeLook> = {
    CREATED: { severity: "new", key: "status.waiting" },
    WAITING: { severity: "info", key: "status.waiting" },
    PROGRESS: { severity: "info", key: "status.progress" },
    GENERATING: { severity: "info", key: "status.progress" },
    MODIFYING: { severity: "info", key: "status.progress" },
    CHECKING: { severity: "info", key: "status.checking" },
    SUCCESS: { severity: "success", key: "status.success" },
    GENERATED: { severity: "success", key: "status.success" },
    CLOSED: { severity: "success", key: "status.closed" },
    OPEN: { severity: "info", key: "status.open" },
    DELETED: { severity: "info", key: "status.deleted" },
    FAILURE: { severity: "error", key: "status.failure" },
    UNSTABLE: { severity: "error", key: "status.failure" },
    ABORTED: { severity: "error", key: "status.aborted" },
};

const ReportStatusBadge: FC<ReportStatusBadgeProps> = ({ status }) => {
    const { t } = useTranslation("DataDetails");
    const look = LOOKS[status];

    return <Badge severity={look?.severity}>{look ? t(look.key) : ""}</Badge>;
};

export default memo(ReportStatusBadge);
