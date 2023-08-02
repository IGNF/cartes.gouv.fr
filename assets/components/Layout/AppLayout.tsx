import { fr } from "@codegouvfr/react-dsfr";
import { FC, PropsWithChildren } from "react";

import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

type AppLayoutProps = {
    navItems?: MainNavigationProps.Item[];
};
const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, navItems = [] }) => {
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

export default AppLayout;
