import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";

import { externalUrls } from "@/router/externalUrls";
import Main from "../../components/Layout/Main";
import { useTranslation } from "../../i18n/i18n";

const LoginDisabled = () => {
    const { t } = useTranslation("LoginDisabled");
    return (
        <Main title={t("title")}>
            <h1>{t("title")}</h1>

            <Alert severity="warning" description={t("description")} closable={false} small />

            <Button linkProps={{ href: externalUrls.discover_cartesgouvfr }} className={fr.cx("fr-mt-2v")}>
                {t("back_to_home")}
            </Button>
        </Main>
    );
};

export default LoginDisabled;
