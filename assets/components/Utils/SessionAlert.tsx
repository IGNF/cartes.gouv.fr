import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, Suspense, memo } from "react";

import { useTranslation } from "@/i18n/i18n";
import { reconnect } from "@/modules/session";
import { useSessionStore } from "@/stores/SessionStore";

const SessionAlertContent: FC = () => {
    const { t } = useTranslation("SessionAlert");

    return (
        <div className={fr.cx("fr-mb-4v")}>
            <Alert
                severity="error"
                title={t("expired_title")}
                description={
                    <>
                        <p>{t("expired_description")}</p>
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

/** rendue dans toute page, sous le fil d’Ariane ; sans hook de traduction ici : ce composant vit aussi dans le fallback du Suspense du routeur */
const SessionAlert: FC = () => {
    const expired = useSessionStore((state) => state.status === "expired");

    if (!expired) return null;

    return (
        <Suspense fallback={null}>
            <SessionAlertContent />
        </Suspense>
    );
};

export default memo(SessionAlert);
