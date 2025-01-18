import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";

import AppLayout from "../../../../components/Layout/AppLayout";
import { datastoreNavItems } from "../../../../config/navItems/datastoreNavItems";
import { useTranslation } from "../../../../i18n";
import { routes } from "../../../../router/router";

const navItems = datastoreNavItems();

const DatastoreCreationRequestConfirmation = () => {
    const { t } = useTranslation("DatastoreCreationForm");

    return (
        <AppLayout navItems={navItems} documentTitle={t("request_confirmation.title")}>
            <h1>{t("request_confirmation.title")}</h1>
            <Alert
                title={t("request_confirmation.success.title")}
                description={t("request_confirmation.success.description", { homeLink: routes.home().link })}
                severity="success"
            />
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-1w")}>
                <Button linkProps={routes.dashboard_pro().link}>{t("request_confirmation.continue")}</Button>
            </div>
        </AppLayout>
    );
};

export default DatastoreCreationRequestConfirmation;
