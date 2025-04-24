import { fr } from "@codegouvfr/react-dsfr";

import { routes } from "../router/router";
import Main from "../components/Layout/Main";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

const Join = () => {
    return (
        <Main title="Nous rejoindre">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Rejoignez la communauté des utilisateurs et contributeurs de la Géoplateforme et cartes.gouv.fr</h1>
                    <ul>
                        <li>Pour suivre l’actualité du programme Géoplateforme</li>
                        <li>Pour contribuer à des groupes de travail et co-construire l’offre de services Géoplateforme - cartes.gouv.fr</li>
                        <li>
                            Pour échanger et partager avec les autres membres de la communauté sur vos retours d’utilisation des données, des services, des
                            outils et sur vos cas d’usages,...
                        </li>
                        <li>Pour exprimer vos idées et poser des questions sur des thématiques précises</li>
                        <li>Pour participer à des événements, à des temps d’information, à des ateliers thématiques...</li>
                    </ul>
                    <p>
                        N’attendez plus pour rejoindre la <strong>communauté d’utilisateurs Géoplateforme - Cartes.gouv</strong>&nbsp;!
                    </p>
                    <ButtonsGroup
                        buttons={[
                            {
                                linkProps: {
                                    href: "https://www.expertises-territoires.fr/jcms/pl1_557493/fr/communaute-geoplateforme-et-cartes-gouv",
                                    rel: "noreferrer",
                                    target: "_blank",
                                },
                                children: "Rejoignez la communauté",
                            },
                        ]}
                        inlineLayoutWhen="always"
                        alignment="center"
                    />
                </div>
            </div>
        </Main>
    );
};

export default Join;
