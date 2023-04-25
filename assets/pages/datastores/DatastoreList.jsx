import React from "react";

import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToHome from "../../components/Layout/BtnBackToHome";
import { defaultNavItems } from "../../config/navItems";

const DatastoreList = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Mes espaces de travail</h1>
            <BtnBackToHome />
        </AppLayout>
    );
};

export default DatastoreList;
