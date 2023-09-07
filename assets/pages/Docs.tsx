import AppLayout from "../components/Layout/AppLayout";
import BtnBackToHome from "../components/Utils/BtnBackToHome";
import { defaultNavItems } from "../config/navItems";

const Docs = () => {
    return (
        <AppLayout navItems={defaultNavItems} documentTitle="Documentation">
            <h1>Documentation</h1>

            <p>Ces contenus ne sont pas encore prêts.</p>

            <BtnBackToHome />
        </AppLayout>
    );
};

export default Docs;
