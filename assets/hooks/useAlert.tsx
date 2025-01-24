import { fr } from "@codegouvfr/react-dsfr";

import { IAlert } from "../@types/alert";
import { useTranslation } from "../i18n";
import { ReactNode } from "react";

export function useAlert(alert?: IAlert): { isClosable: true; title: NonNullable<ReactNode> } | undefined {
    const { t } = useTranslation("alerts");
    if (!alert) {
        return undefined;
    }
    const title = (
        <>
            {alert.title} {alert.description}
            {alert.link.label && (
                <>
                    {" "}
                    <a
                        className={fr.cx("fr-notice__link")}
                        href={alert.link.url}
                        target="_blank"
                        rel="noreferrer external"
                        title={`${alert.link.label} - ${t("newWindow")}`}
                    >
                        {alert.link.label}
                    </a>
                </>
            )}
        </>
    );
    return { isClosable: true, title };
}
