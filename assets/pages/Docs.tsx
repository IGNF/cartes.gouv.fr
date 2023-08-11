import { useEffect } from "react";

import AppLayout from "../components/Layout/AppLayout";
import BtnBackToHome from "../components/Utils/BtnBackToHome";
import { defaultNavItems } from "../config/navItems";

const Docs = () => {
    useEffect(() => {
        document.title = "Documentation | cartes.gouv.fr";
    }, []);

    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Documentation</h1>

            <p>Ces contenus ne sont pas encore prêts.</p>

            <BtnBackToHome />
        </AppLayout>
    );
};

export default Docs;
