import { fr } from "@codegouvfr/react-dsfr";
import React from "react";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

const AppLayout = ({ children }) => {
    return (
        <>
            <AppHeader />
            <div className={fr.cx("fr-container")}>{children}</div>
            <AppFooter />
        </>
    );
};

export default AppLayout;
