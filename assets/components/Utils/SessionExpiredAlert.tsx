import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC, memo } from "react";

import SymfonyRouting from "../../modules/Routing";
import { useAuthStore } from "../../stores/AuthStore";

const SessionExpiredAlert: FC = () => {
    const sessionExpired = useAuthStore((state) => state.sessionExpired);

    return (
        sessionExpired && (
            <Alert
                severity="error"
                title="Session expirée"
                description={
                    <>
                        Veuillez{" "}
                        <a href={SymfonyRouting.generate("cartesgouvfr_security_login")} rel="noreferrer" target="_blank">
                            vous-reconnecter
                        </a>{" "}
                        dans un nouvel onglet
                    </>
                }
                closable={true}
            />
        )
    );
};

export default memo(SessionExpiredAlert);
