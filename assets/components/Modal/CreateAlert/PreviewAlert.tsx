import { FC } from "react";
import { symToStr } from "tsafe/symToStr";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useWatch } from "react-hook-form";
import { fr } from "@codegouvfr/react-dsfr";

import { useTranslation } from "../../../i18n";
import { useAlert } from "../../../hooks/useAlert";
import { IAlert } from "../../../@types/alert";

const PreviewAlert: FC = () => {
    const { t } = useTranslation("alerts");
    const form = useWatch();
    const alertProps = useAlert(form as IAlert);

    return (
        <div className={fr.cx("fr-input-group")}>
            <span className={fr.cx("fr-label")}>{t("preview")}</span>
            {alertProps && <Notice className={fr.cx("fr-mt-1w")} {...alertProps} isClosable={false} />}
        </div>
    );
};
PreviewAlert.displayName = symToStr({ PreviewAlert });

export default PreviewAlert;
