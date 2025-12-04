import Main from "@/components/Layout/Main";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";

import { externalUrls } from "@/router/externalUrls";
import { routes, useRoute } from "@/router/router";
import { useAuthStore } from "@/stores/AuthStore";
import classes from "./DiscoverPublish.module.css";

import backgroundImgUrl from "@/img/discover/publish/background.png";
import uploaderSvgUrl from "@/img/pictograms/uploader.svg";
import { useEffect } from "react";

export default function DiscoverPublish() {
    const { params } = useRoute();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user !== null && params?.["authentication_failed"] !== undefined) {
            routes.discover().replace();
        }

        if (user !== null && params?.["session_expired_login_success"] === 1) {
            window.close();
        }
    }, [params, user]);

    return (
        <Main title="Le service public des cartes et données du territoire" fluidContainer={true}>
            <div className={classes.container}>
                <div className={classes.backgroundWrapper}>
                    <img src={backgroundImgUrl} alt="illustration" className={classes.backgroundImage} />
                </div>
                <div className={classes.contentWrapper}>
                    <div className={classes.card}>
                        <img src={uploaderSvgUrl} alt="" />

                        <div className={classes.title}>
                            <h1 className={fr.cx("fr-m-0")}>Publier une donnée</h1>
                            <p className={fr.cx("fr-text--xl", "fr-m-0")}>Héberger, créer des flux, partager</p>
                        </div>
                        <p className={fr.cx("fr-text--lg", "fr-m-0")}>
                            Un service pour héberger vos données, les diffuser sous forme de flux et les exploiter dans cartes.gouv ou vos propres outils.
                        </p>

                        <Button
                            iconId="fr-icon-arrow-right-s-line"
                            iconPosition="right"
                            linkProps={user ? routes.datastore_selection().link : { href: externalUrls.login }}
                        >
                            {user ? "Voir mes entrepôts" : "Connectez-vous pour commencer"}
                        </Button>
                    </div>
                </div>
            </div>
        </Main>
    );
}
