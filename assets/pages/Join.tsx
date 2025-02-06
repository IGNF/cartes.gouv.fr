import { fr } from "@codegouvfr/react-dsfr";

import { routes } from "../router/router";
import Main from "../components/Layout/Main";

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
                        N’attendez plus pour rejoindre la <strong>communauté d’utilisateurs Géoplateforme - Cartes.gouv</strong> ! Une fois votre demande
                        envoyée, vous recevrez un e-mail de confirmation, puis un e-mail de la plateforme OSMOSE qui vous permettra d’activer votre compte et de
                        modifier le mot de passe.
                    </p>
                </div>
            </div>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <iframe
                        src="https://analytics-eu.clickdimensions.com/ignfr-agj1s/pages/gcw4gjajee2dsqaisj8xtw.html?PageId=82b8c5810930ed119db10022489f174f"
                        height="880px"
                        width="100%"
                    />
                </div>
            </div>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    {
                        "Les informations recueillies à partir de ce formulaire sont nécessaires à la gestion de votre demande par les services de l’IGN concernés. "
                    }
                    <a href={routes.personal_data().href}>{"En savoir plus sur la gestion des données à caractère personnel"}</a>.
                </div>
            </div>
        </Main>
    );
};

export default Join;
