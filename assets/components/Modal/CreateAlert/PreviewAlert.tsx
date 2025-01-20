import { FC } from "react";
import { symToStr } from "tsafe/symToStr";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useWatch } from "react-hook-form";
import { fr } from "@codegouvfr/react-dsfr";

import { useTranslation } from "../../../i18n";

const PreviewAlert: FC = () => {
    const { t } = useTranslation("ConfigAlerts");
    const form = useWatch();
    const title = (
        <>
            {form.title} {form.description}
            {form.link.label && (
                <>
                    {" "}
                    <a
                        className={fr.cx("fr-notice__link")}
                        href={form.link.url}
                        target="_blank"
                        rel="noreferrer external"
                        title={`${form.link.label} - ${t("newWindow")}`}
                    >
                        {form.link.label}
                    </a>
                </>
            )}
        </>
    );

    return (
        <div className={fr.cx("fr-input-group")}>
            <span className={fr.cx("fr-label")}>{t("preview")}</span>
            <Notice className={fr.cx("fr-mt-1w")} isClosable={false} title={title} />
        </div>
    );
};
PreviewAlert.displayName = symToStr({ PreviewAlert });

export default PreviewAlert;
