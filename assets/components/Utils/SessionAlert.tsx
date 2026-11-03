import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, Suspense, memo } from "react";

import { useTranslation } from "@/i18n/i18n";
import { reconnect } from "@/modules/session";
import { SessionStatus, useSessionStore } from "@/stores/SessionStore";

const SessionAlertContent: FC<{ status: "expiring" | "expired" }> = ({ status }) => {
    const { t } = useTranslation("SessionAlert");

    return (
        <div className={fr.cx("fr-mb-4v")}>
            <Alert
                severity={status === "expired" ? "error" : "warning"}
                title={status === "expired" ? t("expired_title") : t("expiring_title")}
                description={
                    <>
                        <p>{status === "expired" ? t("expired_description") : t("expiring_description")}</p>
                        <Button type="button" priority="secondary" size="small" iconId="fr-icon-refresh-line" onClick={() => reconnect()}>
                            {t("reconnect")}
                        </Button>
                    </>
                }
                closable={false}
            />
        </div>
    );
};

function needsAlert(status: SessionStatus): status is "expiring" | "expired" {
    return status === "expiring" || status === "expired";
}

/** rendue dans toute page, sous le fil d’Ariane ; sans hook de traduction ici : ce composant vit aussi dans le fallback du Suspense du routeur */
const SessionAlert: FC = () => {
    const status = useSessionStore((state) => state.status);

    if (!needsAlert(status)) return null;

    return (
        <Suspense fallback={null}>
            <SessionAlertContent status={status} />
        </Suspense>
    );
};

export default memo(SessionAlert);
