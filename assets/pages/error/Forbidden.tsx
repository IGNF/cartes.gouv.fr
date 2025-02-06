import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC } from "react";
import { useTranslation } from "../../i18n";
import Main from "../../components/Layout/Main";

const Forbidden: FC = () => {
    const { t } = useTranslation("Common");

    return (
        <Main>
            <Alert className={fr.cx("fr-mb-2w")} title={t("information")} description={t("no_necessary_rights")} severity={"info"} />
        </Main>
    );
};

export default Forbidden;
