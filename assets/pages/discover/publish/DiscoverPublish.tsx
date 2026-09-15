import Main from "@/components/Layout/Main";
import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup, { ButtonsGroupProps } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useEffect } from "react";

import { sandboxCommunityId } from "@/env";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { externalUrls } from "@/router/externalUrls";
import { routes, useRoute } from "@/router/router";

import classes from "./DiscoverPublish.module.css";

import background1200 from "@/img/discover/publish/background-1200.webp";
import background1600 from "@/img/discover/publish/background-1600.webp";
import background2160 from "@/img/discover/publish/background-2160.webp";
import background800 from "@/img/discover/publish/background-800.webp";
import uploaderSvgUrl from "@/img/pictograms/uploader.svg";

const backgroundSrcSet = `${background800} 800w, ${background1200} 1200w, ${background1600} 1600w, ${background2160} 2160w`;
// largeurs du .backgroundWrapper dans DiscoverPublish.module.css
const backgroundSizes = "(min-width: 1440px) 65vw, (min-width: 1248px) 60vw, (min-width: 992px) 55vw, (min-width: 576px) 50vw, 100vw";

export default function DiscoverPublish() {
    const { params } = useRoute();
    const { data: user } = useUserQuery();

    useEffect(() => {
        if (params?.["authentication_failed"] !== undefined) {
            routes.discover_publish().replace();
        }

        if (user && params?.["session_expired_login_success"] === 1) {
            window.close();
        }
    }, [params, user]);

    // au moins un entrepôt hors bac à sable : lien direct vers la page de stats des entrepôts
    const hasNonSandboxDatastore = (user?.communities_member ?? []).some(
        (cm) => cm.community?.datastore && (sandboxCommunityId === null || cm.community._id !== sandboxCommunityId)
    );
    const statsRoute = hasNonSandboxDatastore ? routes.stats_by_scope({ scope: "datastore" }) : routes.stats_scope_selection();

    return (
        <Main
            title="Publier une donnée"
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
                                        linkProps: user ? routes.datastore_selection().link : { href: externalUrls.login },
                                        children: user ? "Voir mes entrepôts" : "Connectez-vous pour commencer",
                                    },
                                    user
                                        ? {
                                              children: "Mes statistiques de consommation",
                                              linkProps: statsRoute.link,
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
