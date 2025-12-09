import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";

import SymfonyRouting from "@/modules/Routing";
import { externalLink, externalUrls } from "@/router/externalUrls";
import { routes } from "@/router/router";
import { useAuthStore } from "@/stores/AuthStore";
import HeaderMenu from "./HeaderMenu";

export function HeaderMenuHelp() {
    return (
        <HeaderMenu
            openButtonProps={{
                children: "Aide",
                iconId: "fr-icon-question-fill",
            }}
            items={[
                {
                    iconId: "fr-icon-question-mark",
                    children: "Questions fréquentes",
                    linkProps: externalLink("documentation", "Questions fréquentes"),
                },
                {
                    iconId: "fr-icon-book-2-line",
                    children: "Guide d'utilisation",
                    linkProps: externalLink("documentationProducerGuide", "Guide d'utilisation"),
                },
                {
                    iconId: "fr-icon-mail-line",
                    children: "Nous contacter",
                    linkProps: externalLink("contact_us", "Nous contacter"),
                },
            ]}
        />
    );
}

export function HeaderMenuServices() {
    return (
        <HeaderMenu
            openButtonProps={{
                children: "Services",
                iconId: "fr-icon-grid-fill",
            }}
            items={[
                {
                    iconId: "fr-icon-road-map-line",
                    children: "Explorer les cartes",
                    linkProps: { href: externalUrls.maps },
                },
                {
                    iconId: "fr-icon-search-line",
                    children: "Rechercher une donnée",
                    linkProps: { href: externalUrls.catalogue },
                },
                {
                    iconId: "fr-icon-database-line",
                    children: "Publier une donnée",
                    linkProps: routes.discover_publish().link,
                },
                // {
                //     iconId: "fr-icon-brush-line",
                //     children: (
                //         <>
                //             Créer une carte{" "}
                //             <Badge severity="success" className={"fr-ml-auto"}>
                //                 Bêta
                //             </Badge>
                //         </>
                //     ),
                //     linkProps: { href: externalUrls.create_map },
                // },
            ]}
            actionButtonProps={{
                children: "Découvrir cartes.gouv.fr",
                linkProps: externalLink("discover_cartesgouvfr", "Découvrir cartes.gouv"),
            }}
        />
    );
}

export function HeaderMenuUser() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return (
            <Button
                iconId="fr-icon-account-fill"
                linkProps={{
                    href: SymfonyRouting.generate("cartesgouvfr_security_login"),
                }}
            >
                Se connecter
            </Button>
        );
    }

    let userDisplayName = `${user.first_name ?? ""} ${user.last_name ?? ""}`;
    if (userDisplayName.replace(/\s+/g, "") === "") {
        userDisplayName = user.user_name;
    }

    return (
        <HeaderMenu
            openButtonProps={{
                children: "Mon espace",
                iconId: "fr-icon-account-fill",
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
                            <strong>{userDisplayName}</strong>
                            <span
                                className={fr.cx("fr-text--xs", "fr-m-0")}
                                style={{
                                    color: fr.colors.decisions.text.mention.grey.default,
                                }}
                            >
                                {user.email}
                            </span>
                        </div>
                    ),
                },
                {
                    children: "Tableau de bord",
                    iconId: "fr-icon-dashboard-3-line",
                    linkProps: routes.dashboard().link,
                },
                {
                    children: "Mon compte",
                    iconId: "fr-icon-user-line",
                    linkProps: routes.my_account().link,
                },
            ]}
            actionButtonProps={{
                children: "Se déconnecter",
                iconId: "fr-icon-logout-box-r-line",
                linkProps: {
                    href: SymfonyRouting.generate("cartesgouvfr_security_logout"),
                },
            }}
        />
    );
}
