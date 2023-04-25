import React from "react";

import AppLayout from "../components/Layout/AppLayout";
import BtnBackToHome from "../components/Layout/BtnBackToHome";
import { defaultNavItems } from "../config/navItems";

const Docs = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Docs</h1>
            <BtnBackToHome />
        </AppLayout>
    );
};

export default Docs;
