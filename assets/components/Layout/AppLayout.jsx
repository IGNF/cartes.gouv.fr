import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React, { memo } from "react";

import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

const AppLayout = memo(function AppLayout({ children, navItems = [] }) {
    return (
        <>
            <AppHeader navItems={navItems} />
            <main role="main">
                <div className={fr.cx("fr-container")}>{children}</div>
            </main>
            <AppFooter />
        </>
    );
});

AppLayout.propTypes = {
    children: PropTypes.node,
    navItems: PropTypes.arrayOf(PropTypes.object),
};

export default AppLayout;
