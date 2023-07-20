import React from "react";

import AppLayout from "../components/Layout/AppLayout";
import { defaultNavItems } from "../config/navItems";

const NewsItem = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Une actualité</h1>
        </AppLayout>
    );
};

export default NewsItem;
