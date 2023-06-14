import React from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";

const SiteMap = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Plan du site</h1>
        </AppLayout>
    );
};

export default SiteMap;