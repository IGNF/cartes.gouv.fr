import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";

import { useTranslation } from "../../i18n/i18n";
import { routes } from "../../router/router";
import Main from "../../components/Layout/Main";

const LoginDisabled = () => {
    const { t } = useTranslation("LoginDisabled");
    return (
        <Main title={t("title")}>
            <h1>{t("title")}</h1>

            <Alert severity="warning" description={t("description")} closable={false} small />

            <Button linkProps={routes.discover().link} className={fr.cx("fr-mt-2v")}>
                {t("back_to_home")}
            </Button>
        </Main>
    );
};

export default LoginDisabled;
