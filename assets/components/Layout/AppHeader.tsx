import Badge from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import Header, { HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { FC, memo } from "react";

import { catalogueUrl } from "@/env";
// import { useLang } from "../../i18n/i18n";
import SymfonyRouting from "../../modules/Routing";
import { groups, routes, useRoute } from "../../router/router";
import HeaderMenu from "./HeaderMenu";
import { useAuthStore } from "../../stores/AuthStore";
// import LanguageSelector from "../Utils/LanguageSelector";

import "../../sass/components/header.scss";

type AppHeaderProps = {
    navItems?: MainNavigationProps.Item[];
};
const AppHeader: FC<AppHeaderProps> = ({ navItems = [] }) => {
    const user = useAuthStore((state) => state.user);
    // const { lang, setLang } = useLang();
    const route = useRoute();

    const quickAccessItems: (HeaderProps.QuickAccessItem | JSX.Element | null)[] = [];

    const geoportailQuickAccessItem: HeaderProps.QuickAccessItem = {
        iconId: "fr-icon-arrow-right-line",
        linkProps: {
            href: "https://www.geoportail.gouv.fr/carte",
            className: "fr-btn--icon-right",
            target: "_blank",
            rel: "noreferrer",
            title: "Accéder au Géoportail - ouvre une nouvelle fenêtre",
        },
        text: "Accéder au Géoportail",
    };

    const catalogueQuickAccessItem: HeaderProps.QuickAccessItem = {
        iconId: "fr-icon-arrow-right-line",
        linkProps: {
            href: catalogueUrl,
            className: "fr-btn--icon-right",
            target: "_blank",
            rel: "noreferrer",
            title: "Catalogue - ouvre une nouvelle fenêtre",
        },
        text: "Catalogue",
    };

    if (!user) {
        // utilisateur n'est pas connecté
        quickAccessItems.push(geoportailQuickAccessItem);

        quickAccessItems.push({
            iconId: "fr-icon-account-fill",
            linkProps: {
                href: SymfonyRouting.generate("cartesgouvfr_security_login"),
            },
            text: "Se connecter",
        });
    } else {
        // utilisateur est connecté
        if (route.name === false || groups.public.has(route)) {
            // on garde le lien vers le géoportail sur les pages également accessibles publiquement
            quickAccessItems.push(geoportailQuickAccessItem);
        } else {
            // on met plutôt le lien catalogue sur les pages accessibles uniquement connecté
            quickAccessItems.push(catalogueQuickAccessItem);
        }

        let btnMyAccountText = `${user.first_name ?? ""} ${user.last_name ?? ""}`;
        if (btnMyAccountText.replace(/\s+/g, "") === "") {
            btnMyAccountText = user.user_name;
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
        quickAccessItems.push(
            <HeaderMenu
                openButtonProps={{
                    children: "Services",
                    iconId: "fr-icon-grid-fill",
                }}
                actionButtonProps={{
                    children: "Découvrir cartes.gouv",
                    linkProps: {
                        target: "_blank",
                        rel: "noreferrer",
                        href: "https://www.cartes.gouv.fr",
                    },
                }}
                items={[
                    {
                        children: (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <strong>Nom utilisateur</strong>
                                <span
                                    className={fr.cx("fr-text--xs", "fr-m-0")}
                                    style={{
                                        color: fr.colors.decisions.text.mention.grey.default,
                                    }}
                                >
                                    adresseutilisateur@email.com
                                </span>
                            </div>
                        ),
                    },
                    {
                        iconId: "fr-icon-road-map-line",
                        children: "Explorer les cartes",
                        linkProps: {
                            href: "#",
                        },
                    },
                    {
                        iconId: "fr-icon-search-line",
                        children: "Rechercher une donnée",
                        linkProps: {
                            href: "#",
                        },
                    },
                    {
                        iconId: "fr-icon-database-line",
                        children: "Publier une donnée",
                        linkProps: {
                            href: "#",
                        },
                    },
                    {
                        iconId: "fr-icon-brush-line",
                        children: (
                            <>
                                Créer une carte{" "}
                                <Badge severity="success" className={"fr-ml-auto"}>
                                    Bêta
                                </Badge>
                            </>
                        ),
                        linkProps: {
                            href: "#",
                        },
                    },
                ]}
            />
        );
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
            serviceTitle={
                <>
                    cartes.gouv.fr{" "}
                    <Badge severity="success" noIcon={true} as="span">
                        Bêta
                    </Badge>
                </>
            }
            serviceTagline="Le service public des cartes et données du territoire"
            quickAccessItems={quickAccessItems}
            // renderSearchInput={({ className, id, name, placeholder, type }) => (
            //     <input className={className} id={id} name={name} placeholder={placeholder} type={type} />
            // )}
            navigation={navItems}
        />
    );
};

export default memo(AppHeader);
