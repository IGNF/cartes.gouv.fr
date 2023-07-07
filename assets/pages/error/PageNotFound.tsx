import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";

import AppLayout from "../../components/Layout/AppLayout";
import { defaultNavItems } from "../../config/navItems";
import { appRoot, routes } from "../../router/router";

const PageNotFound: FC = () => {
    return (
        <AppLayout navItems={defaultNavItems}>
            <div
                className={fr.cx(
                    "fr-my-7w",
                    "fr-mt-md-12w",
                    "fr-mb-md-10w",
                    "fr-grid-row",
                    "fr-grid-row--gutters",
                    "fr-grid-row--center",
                    "fr-grid-row--middle"
                )}
            >
                <div className={fr.cx("fr-py-0", "fr-col-12", "fr-col-md-6")}>
                    <h1>Page non trouvée</h1>

                    <p className={fr.cx("fr-text--sm", "fr-mb-3w")}>Erreur 404</p>

                    <p className={fr.cx("fr-text--lead", "fr-mb-3w")}>La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée.</p>

                    <p className={fr.cx("fr-text--sm", "fr-mb-5w")}>
                        Si vous avez tapé l’adresse web dans le navigateur, vérifiez qu’elle est correcte. La page n’est peut-être plus disponible. Dans ce cas,
                        pour continuer votre visite vous pouvez consulter notre page d’accueil. Sinon contactez-nous pour que l’on puisse vous rediriger vers la
                        bonne information.
                    </p>

                    <ul className={fr.cx("fr-btns-group", "fr-btns-group--inline-md")}>
                        <li>
                            <Button linkProps={routes.home().link}>Page d&apos;accueil</Button>
                        </li>
                        <li>
                            <Button linkProps={routes.contact().link} className={fr.cx("fr-btn--secondary")}>
                                Nous écrire
                            </Button>
                        </li>
                    </ul>
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-md-3", "fr-col-offset-md-1", "fr-px-6w", "fr-px-md-0", "fr-py-0")}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={"fr-responsive-img fr-artwork"}
                        aria-hidden="true"
                        width="160"
                        height="200"
                        viewBox="0 0 160 200"
                    >
                        <use className="fr-artwork-motif" href={`${appRoot}/dsfr/artwork/background/ovoid.svg#artwork-motif`} />
                        <use className="fr-artwork-background" href={`${appRoot}/dsfr/artwork/background/ovoid.svg#artwork-background`} />
                        <g transform="translate(40, 60)">
                            <use className="fr-artwork-decorative" href={`${appRoot}/dsfr/artwork/pictograms/system/technical-error.svg#artwork-decorative`} />
                            <use className="fr-artwork-minor" href={`${appRoot}/dsfr/artwork/pictograms/system/technical-error.svg#artwork-minor`} />
                            <use className="fr-artwork-major" href={`${appRoot}/dsfr/artwork/pictograms/system/technical-error.svg#artwork-major`} />
                        </g>
                    </svg>
                </div>
            </div>
        </AppLayout>
    );
};

export default PageNotFound;
