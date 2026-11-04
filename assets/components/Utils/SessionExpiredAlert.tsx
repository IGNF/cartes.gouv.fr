import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC, memo } from "react";

import SymfonyRouting from "../../modules/Routing";
import { useAuthStore } from "../../stores/AuthStore";
import { groups, useRoute } from "@/router/router";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { reconnect } from "@/modules/reconnect";

const SessionExpiredAlert: FC = () => {
    const sessionExpired = useAuthStore((state) => state.sessionExpired);
    const { data: user } = useUserQuery();
    const route = useRoute();

    return (
        !groups.public.has(route) &&
        sessionExpired &&
        user && (
            <div className={fr.cx("fr-mb-4v")}>
                <Alert
                    severity="error"
                    title="Session expirée"
                    description={
                        <>
                            Veuillez{" "}
                            <a
                                href={SymfonyRouting.generate("cartesgouvfr_security_login")}
                                onClick={(e) => {
                                    e.preventDefault();
                                    void reconnect();
                                }}
                            >
                                vous reconnecter
                            </a>
                        </>
                    }
                    closable={false}
                />
            </div>
        )
    );
};

export default memo(SessionExpiredAlert);
