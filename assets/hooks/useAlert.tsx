import { IAlert } from "../@types/alert";
import { useTranslation } from "../i18n";
import { NoticeProps } from "@codegouvfr/react-dsfr/Notice";

export type IUseAlert = Pick<NoticeProps, "title" | "description" | "link" | "severity"> & {
    severity?: "info" | "warning" | "alert";
};

export function useAlert(alert?: IAlert): IUseAlert | undefined {
    const { t } = useTranslation("Common");

    if (!alert) {
        return undefined;
    }
    const {
        description,
        link: { label, url },
        severity,
        title,
    } = alert;
    return {
        description,
        link: label
            ? {
                  linkProps: { href: url, target: "_blank", rel: "noreferrer external", title: `${label} - ${t("new_window")}` },
                  text: label,
              }
            : undefined,
        severity,
        title,
    };
}
