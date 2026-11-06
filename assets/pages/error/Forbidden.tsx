import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC } from "react";

import { useTranslation } from "@/i18n";

/** droits insuffisants, rendu dans la zone de travail par le layout de la ressource */
const Forbidden: FC = () => {
    const { t } = useTranslation("Common");

    return <Alert className={fr.cx("fr-mb-2w")} title={t("information")} description={t("no_necessary_rights")} severity={"info"} />;
};

export default Forbidden;
