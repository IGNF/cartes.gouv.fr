import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useState } from "react";

import LoadingIcon from "../../components/Utils/LoadingIcon";
import Main from "../../components/Layout/Main";
import { useAlertStore } from "../../stores/AlertStore";
import { IAlert } from "../../@types/alert";
import MarkdownRenderer from "../../components/Utils/MarkdownRenderer";
import Button from "@codegouvfr/react-dsfr/Button";
import SymfonyRouting from "@/modules/Routing";

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
    const alerts = useAlertStore(({ alerts }) => alerts).filter((alert) => alert.visibility.serviceLevel);

    return (
        <Main title="Niveau de service">
            <h1>Niveau de service {loading === true && <LoadingIcon largeIcon={true} />}</h1>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-xl-8")}>
                    <h2>Alertes, incidents et maintenances programmées</h2>
                </div>
                <div className={[fr.cx("fr-col-12", "fr-col-xl-4"), "text-right-xl"].join(" ")}>
                    <Button
                        className={fr.cx("fr-mb-2w")}
                        linkProps={{
                            href: SymfonyRouting.generate("cartesgouvfr_rss_feed_alerts"),
                            target: "_blank",
                            rel: "noreferrer",
                            title: "Suivre les alertes par RSS - ouvre une nouvelle fenêtre",
                        }}
                        priority="secondary"
                        iconId="ri-rss-line"
                    >
                        Suivre par RSS
                    </Button>
                </div>
            </div>
            <div className={fr.cx("fr-mb-2w")}>
                {alerts.map((alert) => (
                    <Alert
                        key={alert.id}
                        title={alert.title}
                        severity={getAlertSeverity(alert.severity)}
                        description={
                            <>
                                {alert.description && <p>{alert.description}</p>}
                                {alert.details && <MarkdownRenderer content={alert.details} />}
                            </>
                        }
                    />
                ))}
                {alerts.length === 0 && <p>Aucune alerte en cours.</p>}
            </div>
            <h2>Disponibilité des services</h2>
            <p>
                Le tableau de ci-après, basé sur l’outil Uptrends, indique la disponibilité de tous les services de la Géoplateforme sur les 30 derniers jours.
            </p>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <iframe src="https://status.uptrends.com/aa35b49e519e4f90866dc6bfc0a797a9" height="800px" width="100%" onLoad={() => setLoading(false)} />
                </div>
            </div>
        </Main>
    );
};

export default ServiceStatus;
