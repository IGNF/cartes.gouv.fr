import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { FC } from "react";

import { externalUrls } from "@/router/externalUrls";
import Main from "@/components/Layout/Main";
import { routes } from "@/router/router";

import ovoidSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/background/ovoid.svg?no-inline";
import technicalErrorSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/system/technical-error.svg?no-inline";

const PageNotFound: FC = () => {
    return (
        <Main title="Page non trouvée">
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

                    <ButtonsGroup
                        buttons={[
                            {
                                children: "Page d’accueil",
                                linkProps: routes.discover().link,
                            },
                            {
                                children: "Nous écrire",
                                linkProps: { href: externalUrls.contact_us },
                                priority: "secondary",
                            },
                        ]}
                        inlineLayoutWhen="md and up"
                    />
                </div>
                <div className={fr.cx("fr-col-12", "fr-col-md-3", "fr-col-offset-md-1", "fr-px-6w", "fr-px-md-0", "fr-py-0")}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={fr.cx("fr-responsive-img", "fr-artwork")}
                        aria-hidden="true"
                        width="160"
                        height="200"
                        viewBox="0 0 160 200"
                    >
                        <use className={fr.cx("fr-artwork-motif")} href={`${ovoidSvgUrl}#artwork-motif`} />
                        <use className={fr.cx("fr-artwork-background")} href={`${ovoidSvgUrl}#artwork-background`} />
                        <g transform="translate(40, 60)">
                            <use className={fr.cx("fr-artwork-decorative")} href={`${technicalErrorSvgUrl}#artwork-decorative`} />
                            <use className={fr.cx("fr-artwork-minor")} href={`${technicalErrorSvgUrl}#artwork-minor`} />
                            <use className={fr.cx("fr-artwork-major")} href={`${technicalErrorSvgUrl}#artwork-major`} />
                        </g>
                    </svg>
                </div>
            </div>
        </Main>
    );
};

export default PageNotFound;
