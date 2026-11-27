import Main from "@/components/Layout/Main";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup, { ButtonsGroupProps } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import useUserQuery from "@/hooks/queries/useUserQuery";
import { externalUrls } from "@/router/externalUrls";

import classes from "../Discover.module.css";

import background1200 from "@/img/discover/background-1200.webp";
import background1600 from "@/img/discover/background-1600.webp";
import background2160 from "@/img/discover/background-2160.webp";
import background800 from "@/img/discover/background-800.webp";
import contributorSvgUrl from "@/img/pictograms/contributor.svg";

const routeApi = getRouteApi("/_public/contribuer-aux-donnees");

const backgroundSrcSet = `${background800} 800w, ${background1200} 1200w, ${background1600} 1600w, ${background2160} 2160w`;
// object-fit: cover sur un bloc d’au moins 600 px de haut : l’image couvre au moins 1080 px de large (ratio 1,8), sauf quand le bloc (65vw max) est plus large
const backgroundSizes = "(min-width: 1662px) 65vw, 1080px";

export default function DiscoverContribute() {
    const { login_failed } = routeApi.useSearch();
    const navigate = useNavigate();
    const { data: user } = useUserQuery();

    // anonyme seulement : le paramètre, gardé jusqu’à la fermeture (page rendue deux fois au chargement), revient par le referer après une connexion réussie
    const loginFailed = !user && login_failed === 1;

    useEffect(() => {
        if (user && login_failed !== undefined) {
            void navigate({ to: "/contribuer-aux-donnees", replace: true });
        }
    }, [login_failed, navigate, user]);

    return (
        <Main
            title="Contribuer aux données"
            classes={{
                container: fr.cx("fr-container--fluid"),
            }}
        >
            <div className={classes.container}>
                <div className={classes.backgroundWrapper}>
                    <img src={background1200} srcSet={backgroundSrcSet} sizes={backgroundSizes} alt="" className={classes.backgroundImage} />
                </div>
                <div className={classes.contentWrapper}>
                    <div className={classes.card}>
                        {loginFailed && (
                            <Alert
                                severity="error"
                                title="La connexion a échoué"
                                closable
                                isClosed={false}
                                onClose={() => void navigate({ to: "/contribuer-aux-donnees", replace: true })}
                            />
                        )}
                        <img src={contributorSvgUrl} alt="" />

                        <div className={classes.title}>
                            <h1 className={fr.cx("fr-m-0")}>Contribuer aux données</h1>
                            <p className={fr.cx("fr-text--xl", "fr-m-0")}>Participez, signalez et enrichissez</p>
                        </div>
                        <p className={fr.cx("fr-text--lg", "fr-m-0")}>
                            Un service pour mobiliser une communauté autour de vos données, recueillir des signalements et permettre à des utilisateurs de
                            contribuer à leur enrichissement ou à leur mise à jour.
                        </p>

                        <ButtonsGroup
                            buttons={
                                [
                                    {
                                        iconId: "fr-icon-arrow-right-s-line",
                                        iconPosition: "right",
                                        linkProps: user ? { to: "/contribuer-aux-donnees/guichets" } : { href: externalUrls.login },
                                        children: user ? "Voir mes guichets" : "Connectez-vous pour commencer",
                                    },
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
