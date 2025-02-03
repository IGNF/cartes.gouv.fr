import { useEffect } from "react";

import AppLayout from "../components/Layout/AppLayout";
import SymfonyRouting from "../modules/Routing";
import Main from "../components/Layout/Main";

const RedirectToLogin = () => {
    useEffect(() => {
        window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
    }, []);

    return (
        <AppLayout>
            <Main title="Redirection vers la page de connexion">
                <h1>Redirection vers la page de connexion...</h1>
            </Main>
        </AppLayout>
    );
};

export default RedirectToLogin;
