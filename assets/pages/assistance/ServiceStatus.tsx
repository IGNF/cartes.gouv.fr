import { fr } from "@codegouvfr/react-dsfr";
import { useState } from "react";

import LoadingIcon from "../../components/Utils/LoadingIcon";
import Main from "../../components/Layout/Main";

const ServiceStatus = () => {
    const [loading, setLoading] = useState(true);
    return (
        <Main title="Niveau de service">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Niveau de service {loading === true && <LoadingIcon largeIcon={true} />}</h1>
                    <p>
                        Le tableau de ci-après, basé sur l’outil Uptrends, indique la disponibilité de tous les services de la Géoplateforme sur les 30 derniers
                        jours.
                    </p>
                </div>
            </div>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <iframe src="https://status.uptrends.com/aa35b49e519e4f90866dc6bfc0a797a9" height="800px" width="100%" onLoad={() => setLoading(false)} />
                </div>
            </div>
        </Main>
    );
};

export default ServiceStatus;
