import Main from "@/components/Layout/Main";
import { fr } from "@codegouvfr/react-dsfr";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { sandboxCommunityId } from "@/env";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { externalUrls } from "@/router/externalUrls";

import classes from "./DiscoverPublish.module.css";

import backgroundImgUrl from "@/img/discover/publish/background.png?w=400;800;1200;1400;2160&format=png&as=srcset";
import uploaderSvgUrl from "@/img/pictograms/uploader.svg";
import ButtonsGroup, { ButtonsGroupProps } from "@codegouvfr/react-dsfr/ButtonsGroup";

const route = getRouteApi("/_public/publier-une-donnee");

export default function DiscoverPublish() {
    const search = route.useSearch();
    const navigate = useNavigate();
    const { data: user } = useUserQuery();

    useEffect(() => {
        if (search.authentication_failed !== undefined) {
            navigate({ to: "/publier-une-donnee", replace: true });
        }

        if (user && search.session_expired_login_success === 1) {
            window.close();
        }
    }, [search, user, navigate]);

    // au moins un entrepôt hors bac à sable : lien direct vers la page de stats des entrepôts
    const hasNonSandboxDatastore = (user?.communities_member ?? []).some(
        (cm) => cm.community?.datastore && (sandboxCommunityId === null || cm.community._id !== sandboxCommunityId)
    );
    const statsLinkProps = {
        to: "/tableau-de-bord/statistiques-de-consommation",
        search: hasNonSandboxDatastore ? { scope: "datastore" } : {},
    } as const;

    return (
        <Main
            title="Publier une donnée"
            classes={{
                container: fr.cx("fr-container--fluid"),
            }}
        >
            <div className={classes.container}>
                <div className={classes.backgroundWrapper}>
                    <img srcSet={backgroundImgUrl} alt="illustration" className={classes.backgroundImage} />
                </div>
                <div className={classes.contentWrapper}>
                    <div className={classes.card}>
                        <img src={uploaderSvgUrl} alt="" />

                        <div className={classes.title}>
                            <h1 className={fr.cx("fr-m-0")}>Publier une donnée</h1>
                            <p className={fr.cx("fr-text--xl", "fr-m-0")}>Hébergez, créez des flux, partagez</p>
                        </div>
                        <p className={fr.cx("fr-text--lg", "fr-m-0")}>
                            Hébergez vos données, diffusez-les sous forme de flux et exploitez-les dans cartes.gouv.fr ou vos propres outils.
                        </p>

                        <ButtonsGroup
                            buttons={
                                [
                                    {
                                        iconId: "fr-icon-arrow-right-s-line",
                                        iconPosition: "right",
                                        linkProps: user ? { to: "/tableau-de-bord/entrepots" } : { href: externalUrls.login },
                                        children: user ? "Voir mes entrepôts" : "Connectez-vous pour commencer",
                                    },
                                    user
                                        ? {
                                              children: "Mes statistiques de consommation",
                                              linkProps: statsLinkProps,
                                              priority: "secondary",
                                          }
                                        : null,
                                ].filter(Boolean) as ButtonsGroupProps["buttons"]
                            }
                            inlineLayoutWhen="always"
                        />
                    </div>
                </div>
            </div>
        </Main>
    );
}
