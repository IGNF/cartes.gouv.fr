import { useEffect } from "react";

import AppLayout from "../components/Layout/AppLayout";
import SymfonyRouting from "../modules/Routing";

const RedirectToLogin = () => {
    useEffect(() => {
        window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
    }, []);

    return (
        <AppLayout documentTitle="Redirection vers la page de connexion">
            <h1>Redirection vers la page de connexion...</h1>
        </AppLayout>
    );
};

export default RedirectToLogin;
