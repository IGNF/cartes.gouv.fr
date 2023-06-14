import React from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";

const Contact = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Nous écrire</h1>
        </AppLayout>
    );
};

export default Contact;