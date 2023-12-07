import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { FC, useEffect, useMemo } from "react";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RMap from "../../../components/Utils/RMap";
import TextCopyToClipboard from "../../../components/Utils/TextCopyToClipboard";
import RQKeys from "../../../modules/RQKeys";
import { type CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { TagStyle, type Service } from "../../../types/app";
import { ConfigurationDetailResponseDto, OfferingDetailResponseDtoTypeEnum } from "../../../types/entrepot"; // TODO A SUPPRIMER
import { addStyleModal, StyleComponent } from "../../../components/StyleComponent";

type ServiceViewProps = {
    datastoreId: string;
    offeringId: string;
    datasheetName: string;
};

const ServiceView: FC<ServiceViewProps> = ({ datastoreId, offeringId, datasheetName }) => {
    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: () => api.service.get(datastoreId, offeringId),
        staleTime: 60000,
    });

    // Recherche des services (offerings) contenant le tag datasheet_name a datasheetName
    const serviceListQuery = useQuery<Service[], CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        refetchInterval: 60000,
    });

    // TODO A VOIR : Styles du service
    /*const styles = useMemo<TagStyle[]>(() => {
        const configuration = serviceQuery.data?.configuration as ConfigurationDetailResponseDto;
        if (configuration) {
            return configuration.tags.styles ? JSON.parse(configuration.tags.styles) : [];
        }
    }, [serviceQuery.data]);*/

    useEffect(() => {
        console.log(serviceQuery.data);
    }, [serviceQuery.data]);

    // Recherche du nom des styles dans tous les services de la fiche de donnees datasheetName
    const styleNames = useMemo<string[]>(() => {
        let styles: TagStyle[] = [];
        serviceListQuery.data?.forEach((service) => {
            const configuration = service.configuration as ConfigurationDetailResponseDto;
            const s = configuration.tags.styles ? JSON.parse(configuration.tags.styles) : [];
            styles = styles.concat(s);
        });
        return styles.map((style) => style.name);
    }, [serviceListQuery.data]);

    const hasStyles =
        serviceQuery.data?.type === OfferingDetailResponseDtoTypeEnum.WFS || serviceQuery.data?.type === OfferingDetailResponseDtoTypeEnum.WMTSTMS;

    // ONGLETS
    const tabs = [
        {
            label: "Diffuser le service",
            content: (
                <div className={fr.cx("fr-col-12")}>
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

                    {serviceQuery?.data?.urls.map((url) => {
                        return <TextCopyToClipboard text={url.url} key={url.url} className="fr-mb-1w" />;
                    })}
                </div>
            ),
        },
    ];

    // Pas de gestion des styles pour les autres services
    if (hasStyles) {
        tabs.push({
            label: "Gérer les styles",
            content: (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <p>
                            <a href="#" target="_blank" rel="noreferrer">
                                Comment créer un style
                            </a>
                        </p>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <Button onClick={() => addStyleModal.open()}>Ajouter un style</Button>
                    </div>
                </>
            ),
        });
    }

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
                            <Tabs tabs={tabs} />
                        </div>
                    </div>
                    {hasStyles && <StyleComponent datastoreId={datastoreId} service={serviceQuery?.data} styleNames={styleNames} />}
                </>
            )}
        </DatastoreLayout>
    );
};

export default ServiceView;
