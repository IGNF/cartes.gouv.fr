import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";

import AppLayout from "../../../components/Layout/AppLayout";
import { useTranslation } from "../../../i18n";
import { routes } from "../../../router/router";

const ContactConfirmation = () => {
    const { t } = useTranslation("Contact");

    return (
        <AppLayout documentTitle={t("contact_confirmation.title")}>
            <h1>{t("contact_confirmation.title")}</h1>
            <Alert
                title={t("contact_confirmation.success.title")}
                description={t("contact_confirmation.success.description", { homeLink: routes.home().link })}
                severity="success"
            />
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-1w")}>
                <Button linkProps={routes.home().link}>{t("contact_confirmation.continue")}</Button>
            </div>
        </AppLayout>
    );
};

export default ContactConfirmation;
