import Header, { HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { FC, ReactNode } from "react";

import useUser from "../../hooks/useUser";
import SymfonyRouting from "../../modules/Routing";
import { routes } from "../../router/router";

export type NavigationProps = MainNavigationProps.Item[] | ReactNode;

type AppHeaderProps = {
    navItems?: NavigationProps;
};
const AppHeader: FC<AppHeaderProps> = ({ navItems = [] }) => {
    const { user } = useUser();

    const quickAccessItems: (HeaderProps.QuickAccessItem | ReactNode)[] = [];

    quickAccessItems.push({
        iconId: "fr-icon-arrow-right-line",
        linkProps: {
            href: "https://www.geoportail.gouv.fr/carte",
            className: "fr-btn--icon-right",
        },
        text: "Accéder au Géoportail",
    });

    if (!user) {
        // utilisateur n'est pas connecté
        quickAccessItems.push({
            iconId: "fr-icon-account-fill",
            linkProps: {
                href: SymfonyRouting.generate("cartesgouvfr_security_login"),
            },
            text: "Se connecter",
        });
    } else {
        // utilisateur est connecté
        let btnMyAccountText = `${user.firstName} ${user.lastName}`;
        if (btnMyAccountText.replace(/\s+/g, "") === "") {
            btnMyAccountText = "Mon compte";
        }

        quickAccessItems.push({
            iconId: "fr-icon-account-fill",
            linkProps: routes.dashboard_pro().link,
            text: btnMyAccountText,
        });
        quickAccessItems.push({
            iconId: "fr-icon-logout-box-r-line",
            linkProps: {
                href: SymfonyRouting.generate("cartesgouvfr_security_logout"),
            },
            text: "Se déconnecter",
        });
    }

    return (
        <Header
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            homeLinkProps={{
                ...routes.home().link,
                title: "Accueil - cartes.gouv.fr",
            }}
            serviceTitle="cartes.gouv.fr"
            quickAccessItems={quickAccessItems}
            // renderSearchInput={({ className, id, name, placeholder, type }) => (
            //     <input className={className} id={id} name={name} placeholder={placeholder} type={type} />
            // )}
            navigation={navItems}
        />
    );
};

export default AppHeader;
