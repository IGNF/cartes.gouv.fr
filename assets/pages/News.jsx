import React from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";

const News = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Actualités</h1>
        </AppLayout>
    );
};

export default News;
