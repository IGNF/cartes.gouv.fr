import React from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";

const Faq = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Questions fréquentes</h1>
        </AppLayout>
    );
};

export default Faq;
