import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React from "react";

import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

const AppLayout = ({ children, navItems = [] }) => {
    return (
        <>
            <AppHeader navItems={navItems} />
            <main role="main" className={fr.cx("fr-py-2w")}>
                <div className={fr.cx("fr-container")}>{children}</div>
            </main>
            <AppFooter />
        </>
    );
};

AppLayout.propTypes = {
    children: PropTypes.node,
    navItems: PropTypes.arrayOf(PropTypes.object),
};

export default AppLayout;
