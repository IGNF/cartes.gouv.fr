import Badge from "@codegouvfr/react-dsfr/Badge";
import Header from "@codegouvfr/react-dsfr/Header";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { FC, memo } from "react";

import { routes } from "../../router/router";
import { HeaderMenuHelp, HeaderMenuServices, HeaderMenuUser } from "./Header/HeaderMenus";

import "../../sass/components/header.scss";

import placeholder16x9 from "@/img/placeholder.16x9.png";

type AppHeaderProps = {
    navItems?: MainNavigationProps.Item[];
};
const AppHeader: FC<AppHeaderProps> = ({ navItems = [] }) => {
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
            operatorLogo={{
                imgUrl: placeholder16x9,
                orientation: "horizontal",
                linkProps: {
                    ...routes.home().link,
                    title: "Accueil - cartes.gouv.fr",
                },
                alt: "",
            }}
            serviceTitle={
                <>
                    Cartes.gouv.fr{" "}
                    <Badge severity="success" noIcon={true} as="span">
                        Bêta
                    </Badge>
                </>
            }
            serviceTagline="Le service public des cartes et des données du territoire"
            quickAccessItems={[
                <HeaderMenuHelp key="header-menu-help" />,
                <HeaderMenuServices key="header-menu-services" />,
                <HeaderMenuUser key="header-menu-user" />,
            ]}
            // renderSearchInput={({ className, id, name, placeholder, type }) => (
            //     <input className={className} id={id} name={name} placeholder={placeholder} type={type} />
            // )}
            navigation={navItems}
        />
    );
};

export default memo(AppHeader);
