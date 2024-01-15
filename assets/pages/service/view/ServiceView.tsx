import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { FieldsetProps } from "@codegouvfr/react-dsfr/shared/Fieldset";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import { StyleManager, addStyleModal } from "./Style/StyleManager";
import LoadingText from "../../../components/Utils/LoadingText";
import RMap from "../../../components/Utils/RMap";
import TextCopyToClipboard from "../../../components/Utils/TextCopyToClipboard";
import RQKeys from "../../../modules/RQKeys";
import { type CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { CartesStyle, type Service } from "../../../types/app";
import { OfferingDetailResponseDtoTypeEnum } from "../../../types/entrepot";
import StyleLabel from "./Style/StyleLabel";
import Wait from "../../../components/Utils/Wait";

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

    // Les styles
    const styles: CartesStyle[] = useMemo(() => {
        return serviceQuery.data?.configuration.styles ?? [];
    }, [serviceQuery.data?.configuration.styles]);

    const currentStyle: CartesStyle | undefined = useMemo(() => {
        return styles.find((style) => style.current === true);
    }, [styles]);

    // Recherche du nom des styles dans tous les services de la fiche de donnees datasheetName
    const styleNames = useMemo<string[]>(() => {
        let styles: CartesStyle[] = [];
        serviceListQuery.data?.forEach((service) => {
            const configuration = service.configuration;
            if ("styles" in configuration && Array.isArray(configuration.styles)) {
                styles = styles.concat(configuration.styles);
            }
        });
        return styles.map((style) => style.name);
    }, [serviceListQuery.data]);

    const canManageStyles =
        serviceQuery.data?.type === OfferingDetailResponseDtoTypeEnum.WFS || serviceQuery.data?.type === OfferingDetailResponseDtoTypeEnum.WMTSTMS;

    const queryClient = useQueryClient();

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

    // Suppression d'un style
    const { isPending: isRemovePending, mutate: mutateRemove } = useMutation<CartesStyle[], CartesApiException, string>({
        mutationFn: (name: string) => {
            if (serviceQuery.data) {
                return api.style.remove(datastoreId, serviceQuery.data._id, { style_name: name });
            }
            return Promise.resolve([]);
        },
        onSuccess(styles) {
            if (serviceQuery.data) {
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
                queryClient.setQueryData<Service>(RQKeys.datastore_offering(datastoreId, offeringId), (oldService) => {
                    if (oldService) {
                        const newService = { ...oldService } as Service;
                        newService.configuration.styles = styles;
                        return newService;
                    }
                });
            }
            /* if (serviceQuery?.data !== undefined) {
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_offering(datastoreId, serviceQuery?.data?._id) });
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            } */
        },
    });

    // Changement de style par defaut
    const { isPending: isPendingChangeCurrentStyle, mutate: mutateChangeCurrentStyle } = useMutation<CartesStyle[], CartesApiException, string>({
        mutationFn: (name: string) => {
            if (serviceQuery.data) {
                return api.style.setCurrent(datastoreId, serviceQuery.data._id, { style_name: name });
            }
            return Promise.resolve([]);
        },
        onSuccess(styles) {
            if (serviceQuery.data) {
                queryClient.setQueryData<Service>(RQKeys.datastore_offering(datastoreId, offeringId), (oldService) => {
                    if (oldService) {
                        const newService = { ...oldService } as Service;
                        newService.configuration.styles = styles;
                        return newService;
                    }
                });
            }
        },
    });

    const handleRemove = (name: string) => {
        mutateRemove(name);
    };

    const radioOptions: FieldsetProps.Common["options"] = [];
    styles?.forEach((style) => {
        const option = {
            label: <StyleLabel style={style} onRemove={handleRemove} />,
            nativeInputProps: {
                checked: currentStyle?.name === style.name,
                onChange: () => mutateChangeCurrentStyle(style.name),
            },
        };
        radioOptions.push(option);
    });

    // Pas de gestion des styles pour les autres services
    if (canManageStyles) {
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
                    {styles && styles.length !== 0 && <RadioButtons legend={"Mes styles :"} options={radioOptions} orientation="horizontal" />}
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <Button onClick={() => addStyleModal.open()}>Ajouter un style</Button>
                    </div>
                </>
            ),
        });
    }

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
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab: "services" }).link}
                            title="Retour à la fiche de donnée"
                            size="large"
                        />
                        <h1 className={fr.cx("fr-m-0")}>{serviceQuery?.data?.layer_name}</h1>
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
                    {canManageStyles && serviceQuery.data && (
                        <StyleManager datastoreId={datastoreId} datasheetName={datasheetName} service={serviceQuery.data} styleNames={styleNames} />
                    )}
                </>
            )}
            {(isPendingChangeCurrentStyle || isRemovePending) && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{isRemovePending ? "Suppression en cours ..." : "Changement de style en cours ..."}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

export default ServiceView;
