import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FC, useCallback, useMemo } from "react";

import api from "../../../api";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { CartesStyle, Service } from "../../../../@types/app";
import { StyleManager, addStyleModal } from "./Style/StyleManager";

type ManageStylesTabProps = {
    datastoreId: string;
    datasheetName: string;
    offeringId: string;
    service?: Service;
    setCurrentStyle: React.Dispatch<React.SetStateAction<CartesStyle | undefined>>;
};
const ManageStylesTab: FC<ManageStylesTabProps> = ({ service, offeringId, datastoreId, datasheetName, setCurrentStyle }) => {
    const { t: tStyle } = useTranslation("Style");

    // Recherche des services (offerings) contenant le tag datasheet_name a datasheetName
    const serviceListQuery = useQuery<Service[], CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        refetchInterval: 60000,
    });

    // Les styles
    const styles: CartesStyle[] = useMemo(() => {
        return service?.configuration.styles ?? [];
    }, [service?.configuration.styles]);

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

    const queryClient = useQueryClient();

    const getCurrentStyle = useCallback(() => {
        if (service?.configuration.styles) {
            return service?.configuration.styles.find((style) => style.current === true);
        }
    }, [service?.configuration.styles]);

    // Suppression d'un style
    const { isPending: isRemovePending, mutate: mutateRemove } = useMutation<CartesStyle[], CartesApiException, string>({
        mutationFn: (name: string) => {
            if (service) {
                return api.style.remove(datastoreId, service._id, { style_name: name });
            }
            return Promise.resolve([]);
        },
        onSuccess(styles) {
            if (service) {
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
                queryClient.setQueryData<Service>(RQKeys.datastore_offering(datastoreId, offeringId), (oldService) => {
                    if (oldService) {
                        const newService = { ...oldService } as Service;
                        newService.configuration.styles = styles;
                        setCurrentStyle(getCurrentStyle());
                        return newService;
                    }
                });
            }
        },
    });

    // Changement de style par defaut
    const { isPending: isPendingChangeCurrentStyle, mutate: mutateChangeCurrentStyle } = useMutation<CartesStyle[], CartesApiException, string>({
        mutationFn: (name: string) => {
            if (service) {
                return api.style.setCurrent(datastoreId, service._id, { style_name: name });
            }
            return Promise.resolve([]);
        },
        onSuccess(styles) {
            if (service) {
                queryClient.setQueryData<Service>(RQKeys.datastore_offering(datastoreId, offeringId), (oldService) => {
                    if (oldService) {
                        const newService = { ...oldService } as Service;
                        newService.configuration.styles = styles;
                        setCurrentStyle(getCurrentStyle());
                        return newService;
                    }
                });
            }
        },
    });

    return (
        <>
            <div className={fr.cx("fr-col-12")}>
                {/* TODO: quand documentation disponible
                <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                    <p>
                        <a href="#" target="_blank" rel="noreferrer">
                            Comment créer un style
                        </a>
                    </p>
                </div> */}
                {styles && styles.length !== 0 && (
                    <RadioButtons
                        legend={"Mes styles :"}
                        options={styles.map((style) => ({
                            label: style.name,
                            illustration: (
                                <Button
                                    title={tStyle("remove_style")}
                                    priority={"tertiary no outline"}
                                    iconId={"fr-icon-delete-line"}
                                    onClick={() => {
                                        mutateRemove(style.name);
                                    }}
                                />
                            ),
                            nativeInputProps: {
                                checked: style?.current === true,
                                onChange: () => mutateChangeCurrentStyle(style.name),
                            },
                        }))}
                    />
                )}
                <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                    <Button onClick={() => addStyleModal.open()}>Ajouter un style</Button>
                </div>
            </div>
            {service !== undefined && <StyleManager datastoreId={datastoreId} datasheetName={datasheetName} service={service} styleNames={styleNames} />}

            {(isPendingChangeCurrentStyle || isRemovePending) && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{isRemovePending ? "Suppression en cours ..." : "Changement de style en cours ..."}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default ManageStylesTab;
