import Header, { HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { FC, ReactNode, memo } from "react";

// import { useLang } from "../../i18n/i18n";
import SymfonyRouting from "../../modules/Routing";
import { routes } from "../../router/router";
import { useAuthStore } from "../../stores/AuthStore";
// import LanguageSelector from "../Utils/LanguageSelector";

import "../../sass/components/header.scss";

type AppHeaderProps = {
    navItems?: MainNavigationProps.Item[];
};
const AppHeader: FC<AppHeaderProps> = ({ navItems = [] }) => {
    const user = useAuthStore((state) => state.user);
    // const { lang, setLang } = useLang();

    const quickAccessItems: (HeaderProps.QuickAccessItem | ReactNode)[] = [];

    quickAccessItems.push({
        iconId: "fr-icon-arrow-right-line",
        linkProps: {
            href: "https://www.geoportail.gouv.fr/carte",
            className: "fr-btn--icon-right",
            target: "_blank",
            rel: "noreferrer",
            title: "Accéder au Géoportail - ouvre une nouvelle fenêtre",
        },
        text: "Accéder au Géoportail",
    });

    if (!user) {
        // utilisateur n'est pas connecté
        // quickAccessItems.push({
        //     iconId: "fr-icon-account-fill",
        //     linkProps: {
        //         href: SymfonyRouting.generate("cartesgouvfr_security_login"),
        //     },
        //     text: "Se connecter",
        // });
    } else {
        // utilisateur est connecté
        let btnMyAccountText = `${user.firstName ?? ""} ${user.lastName ?? ""}`;
        if (btnMyAccountText.replace(/\s+/g, "") === "") {
            btnMyAccountText = user.userName;
        }

        quickAccessItems.push({
            iconId: "fr-icon-account-fill",
            linkProps: routes.dashboard_pro().link,
            text: btnMyAccountText.trim(),
        });
        quickAccessItems.push({
            iconId: "fr-icon-logout-box-r-line",
            linkProps: {
                href: SymfonyRouting.generate("cartesgouvfr_security_logout"),
            },
            text: "Se déconnecter",
        });
    }

    // quickAccessItems.push(<LanguageSelector lang={lang} setLang={setLang} />);

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

export default memo(AppHeader);
