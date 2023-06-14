import React from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

const Cookies = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Gestion des cookies</h1>
        </AppLayout>
    );
};

export default Cookies;