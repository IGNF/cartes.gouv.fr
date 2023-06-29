import React from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

const PersonalData = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Données personnelles</h1>
        </AppLayout>
    );
};

export default PersonalData;
