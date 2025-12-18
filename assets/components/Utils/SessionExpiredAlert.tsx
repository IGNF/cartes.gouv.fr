import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC, memo } from "react";

import SymfonyRouting from "../../modules/Routing";
import { useAuthStore } from "../../stores/AuthStore";
import { groups, useRoute } from "@/router/router";

const SessionExpiredAlert: FC = () => {
    const sessionExpired = useAuthStore((state) => state.sessionExpired);
    const route = useRoute();

    return (
        !groups.public.has(route) &&
        sessionExpired && (
            <div className={fr.cx("fr-mb-4v")}>
                <Alert
                    severity="error"
                    title="Session expirée"
                    description={
                        <>
                            Veuillez{" "}
                            <a
                                href={SymfonyRouting.generate("cartesgouvfr_security_login", {
                                    session_expired: 1,
                                })}
                                rel="noreferrer"
                                target="_blank"
                            >
                                vous-reconnecter
                            </a>{" "}
                            dans un nouvel onglet
                        </>
                    }
                    closable={true}
                />
            </div>
        )
    );
};

export default memo(SessionExpiredAlert);
