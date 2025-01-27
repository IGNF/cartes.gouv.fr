import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useState } from "react";

import LoadingIcon from "../../components/Utils/LoadingIcon";
import Main from "../../components/Layout/Main";
import { useAlertStore } from "../../stores/AlertStore";
import { IAlert } from "../../@types/alert";
import MarkdownRenderer from "../../components/Utils/MarkdownRenderer";

const severityMap = {
    alert: "error",
};
function getAlertSeverity(severity: IAlert["severity"]): "info" | "warning" | "error" {
    if (severity in severityMap) {
        return severityMap[severity];
    }
    return severity as Exclude<IAlert["severity"], "alert">;
}

const ServiceStatus = () => {
    const [loading, setLoading] = useState(true);
    const alerts = useAlertStore(({ alerts }) => alerts);

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
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    title={alert.title}
                    severity={getAlertSeverity(alert.severity)}
                    description={<MarkdownRenderer content={alert.details} />}
                />
            ))}
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <iframe src="https://status.uptrends.com/aa35b49e519e4f90866dc6bfc0a797a9" height="800px" width="100%" onLoad={() => setLoading(false)} />
                </div>
            </div>
        </Main>
    );
};

export default ServiceStatus;
