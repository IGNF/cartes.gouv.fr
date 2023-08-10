import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useColors } from "@codegouvfr/react-dsfr/useColors";
import { useQuery } from "@tanstack/react-query";
import { CSSProperties, FC } from "react";

import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { dashboardProNavItems } from "../../../config/dashboardProNavItems";
import RCKeys from "../../../modules/RCKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { type Service } from "../../../types/app";

type ServiceViewProps = {
    datastoreId: string;
    offeringId: string;
};
const ServiceView: FC<ServiceViewProps> = ({ datastoreId, offeringId }) => {
    const navItems = dashboardProNavItems;

    const theme = useColors();
    const styleBoxCopyData: CSSProperties = {
        backgroundColor: theme.decisions.background.alt.blueFrance.default,
        padding: fr.spacing("1w"),
    };

    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RCKeys.datastore_offering(datastoreId, offeringId),
        queryFn: () => api.service.get(datastoreId, offeringId),
        staleTime: 60000,
    });

    return (
        <AppLayout navItems={navItems}>
            {serviceQuery.isLoading ? (
                <LoadingText />
            ) : serviceQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={serviceQuery.error.message}
                    description={<Button linkProps={routes.datasheet_list().link}>Retour à mes données</Button>}
                />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datasheet_list().link}
                            title="Retour à la liste de mes données"
                        />
                        {serviceQuery.data.layer_name}
                        <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                            {serviceQuery.data.type}
                        </Badge>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                            <div>
                                <p>container de la carte</p>
                            </div>
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                            <div className={fr.cx("fr-grid-row")}>
                                <strong className={fr.cx("fr-text--xl")}>Diffuser le service</strong>
                            </div>

                            <div className={fr.cx("fr-grid-row")}>
                                <p>
                                    Copiez vos adresses pour les utiliser dans vos applications SIG ou web. <br />
                                    <a href="#">En savoir plus</a>
                                </p>
                            </div>

                            {/* lien public vers la carte */}
                            <div className={fr.cx("fr-grid-row")}>
                                <strong>Lien public vers la carte</strong>
                            </div>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                                <span style={styleBoxCopyData}>http://www.ign.fr/geoplateforme</span>
                                <Button iconId="ri-file-copy-2-line" priority="tertiary no outline" title="Copier dans le presse-papier" />
                            </div>

                            {/* Code HTML de l'iframe */}
                            <div className={fr.cx("fr-grid-row")}>
                                <strong>{"Code HTML de l'iframe"}</strong>
                            </div>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                                <span style={styleBoxCopyData}>{"<iframe width='600' height='40..."}</span>
                                <Button iconId="ri-file-copy-2-line" priority="tertiary no outline" title="Copier dans le presse-papier" />
                            </div>

                            {/* Adresse du service de données */}
                            <div className={fr.cx("fr-grid-row")}>
                                <strong>Adresse du service de données</strong>
                            </div>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                                <span style={styleBoxCopyData}>{"https://vt-gpf-beta.ign.fr/tms/1.0..."}</span>
                                <Button iconId="ri-file-copy-2-line" priority="tertiary no outline" title="Copier dans le presse-papier" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
};

export default ServiceView;
