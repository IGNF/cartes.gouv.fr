import { fr } from "@codegouvfr/react-dsfr";
import Main from "../components/Layout/Main";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

const Documentation = () => {
    return (
        <Main title="Documentation">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Documentation</h1>

                    <p>
                        Les premiers services de la <strong>Géoplateforme</strong> (API entrepôt, API géocodage , API calcul d’itinéraire, flux WFS, WMS, WMTS…)
                        sont disponibles et d’ores et déjà accessibles en direct.
                        <br />
                        Ils sont progressivement référencés dans le catalogue <strong>cartes.gouv.fr</strong>.
                        <br />
                        Vous pouvez accéder à la documentation de ces services en cliquant sur «&nbsp;en savoir plus&nbsp;».
                    </p>

                    <ButtonsGroup
                        buttons={[
                            {
                                linkProps: {
                                    href: "https://www.ign.fr/geoplateforme/fonctionnalites-de-la-geoplateforme-premieres-briques-et-prochaines-mises-en-service",
                                    rel: "noreferrer",
                                    target: "_blank",
                                },
                                children: "En savoir plus",
                            },
                        ]}
                        inlineLayoutWhen="always"
                        alignment="center"
                    />

                    <p>
                        La <strong>Géoplateforme</strong> est une infrastructure ouverte et collaborative pour l’hébergement, le partage, le traitement et la
                        mise en cartographie des géodonnées.
                    </p>
                    <p>
                        Le site <strong>cartes.gouv.fr</strong>, qui se construit progressivement, sera le portail de référence pour accéder aux données et
                        services de la Géoplateforme, dont il sera en quelque sorte la vitrine principale (mais pas exclusive) tout autant qu’un pupitre de
                        commande accessible à tous.
                    </p>
                    <p>
                        Les fonctionnalités de la <strong>Géoplateforme</strong> peuvent néanmoins déjà être utilisées sans passer par{" "}
                        <strong>cartes.gouv.fr</strong>.
                    </p>
                </div>
            </div>
        </Main>
    );
};

export default Documentation;
