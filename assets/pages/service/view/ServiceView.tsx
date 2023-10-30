import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RMap from "../../../components/Utils/RMap";
import TextCopyToClipboard from "../../../components/Utils/TextCopyToClipboard";
import RQKeys from "../../../modules/RQKeys";
import { type CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { type Service } from "../../../types/app";

type ServiceViewProps = {
    datastoreId: string;
    offeringId: string;
    datasheetName?: string;
};

const ServiceView: FC<ServiceViewProps> = ({ datastoreId, offeringId, datasheetName }) => {
    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: () => api.service.get(datastoreId, offeringId),
        staleTime: 60000,
    });

    const getBackBtn = (datasheetName?: string) => {
        if (datasheetName) {
            return (
                <Button
                    iconId="fr-icon-arrow-left-s-line"
                    priority="tertiary no outline"
                    linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab: "services" }).link}
                    title="Retour à la fiche de donnée"
                />
            );
        } else {
            return (
                <Button
                    iconId="fr-icon-arrow-left-s-line"
                    priority="tertiary no outline"
                    linkProps={routes.datasheet_list({ datastoreId }).link}
                    title="Retour à la liste de mes données"
                />
            );
        }
    };

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={`Visualisation données ${datasheetName ?? serviceQuery.data?.layer_name}`}>
            {serviceQuery.isLoading ? (
                <LoadingText />
            ) : serviceQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={serviceQuery.error.message}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>Retour à mes données</Button>}
                />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                        {getBackBtn(datasheetName)}
                        {serviceQuery?.data?.layer_name}
                        {serviceQuery?.data?.type && (
                            <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                                {serviceQuery?.data?.type}
                            </Badge>
                        )}
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-8")}>{serviceQuery.data && <RMap service={serviceQuery.data} />}</div>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4", "fr-p-1w", "fr-px-2w")}>
                            <div className={fr.cx("fr-grid-row")}>
                                <strong className={fr.cx("fr-text--xl")}>Diffuser le service</strong>
                            </div>

                            <div className={fr.cx("fr-grid-row")}>
                                <p>
                                    Copiez vos adresses pour les utiliser dans vos applications SIG ou web. <br />
                                    <a href="#" target="_blank" rel="noreferrer">
                                        En savoir plus
                                    </a>
                                </p>
                            </div>

                            {/* lien public vers la carte */}
                            <div className={fr.cx("fr-grid-row")}>
                                <strong>Lien public vers la carte</strong>
                            </div>
                            <TextCopyToClipboard text={"http://www.ign.fr/geoplateforme"} className="fr-mb-4w" />

                            {/* Code HTML de l'iframe */}
                            <div className={fr.cx("fr-grid-row")}>
                                <strong>{"Code HTML de l'iframe"}</strong>
                            </div>
                            <TextCopyToClipboard text={"<iframe width='600' height='40..."} className="fr-mb-4w" />

                            {/* Adresse du service de données */}
                            <div className={fr.cx("fr-grid-row")}>
                                <strong>Adresses du service de données</strong>
                            </div>

                            {serviceQuery?.data?.urls.map((url) => <TextCopyToClipboard text={url.url} key={url.url} className="fr-mb-1w" />)}
                        </div>
                    </div>
                </>
            )}
        </DatastoreLayout>
    );
};

export default ServiceView;
