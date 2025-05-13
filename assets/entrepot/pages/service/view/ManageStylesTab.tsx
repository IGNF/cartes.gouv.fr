import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";

import { CartesStyle, Service } from "../../../../@types/app";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import { StyleManager, addStyleModal } from "./Style/StyleManager";

import "../../../../sass/components/style-tab.scss";

type ManageStylesTabProps = {
    datastoreId: string;
    datasheetName: string;
    offeringId: string;
    service?: Service;
};

const ManageStylesTab: FC<ManageStylesTabProps> = ({ service, offeringId, datastoreId, datasheetName }) => {
    const { t: tStyle } = useTranslation("Style");
    const { t: tCommon } = useTranslation("Common");

    const [styleToRemove, setStyleToRemove] = useState<string>();

    // Recherche des services (offerings) contenant le tag datasheet_name a datasheetName
    /*const serviceListQuery = useQuery<Service[], CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        refetchInterval: 60000,
    }); */

    // Les styles
    const styles: CartesStyle[] = useMemo(() => {
        return service?.configuration.styles ?? [];
    }, [service?.configuration.styles]);

    // Recherche du nom des styles dans tous les services de la fiche de donnees datasheetName
    /* const styleNames = useMemo<string[]>(() => {
        let styles: CartesStyle[] = [];
        serviceListQuery.data?.forEach((service) => {
            const configuration = service.configuration;
            if ("styles" in configuration && Array.isArray(configuration.styles)) {
                styles = styles.concat(configuration.styles);
            }
        });
        return styles.map((style) => style.name);
    }, [serviceListQuery.data]); */

    const styleNames = useMemo<string[]>(() => {
        return Array.from(styles, (s) => s.name);
    }, [styles]);

    const queryClient = useQueryClient();

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
                        return {
                            ...oldService,
                            configuration: {
                                ...oldService.configuration,
                                styles,
                            },
                        } as Service;
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
                        return {
                            ...oldService,
                            configuration: {
                                ...oldService.configuration,
                                styles,
                            },
                        } as Service;
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
                        classes={{ content: "style" }}
                        legend={tStyle("my_styles")}
                        options={styles.map((style) => ({
                            label: style.name,
                            illustration: (
                                <Button
                                    title={tStyle("remove_style", { styleName: style.name })}
                                    priority={"tertiary no outline"}
                                    iconId={"fr-icon-delete-line"}
                                    onClick={() => {
                                        setStyleToRemove(style.name);
                                        ConfirmDialogModal.open();
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
                    <Button onClick={() => addStyleModal.open()}>{tStyle("add_style")}</Button>
                </div>
            </div>
            {service !== undefined && <StyleManager datastoreId={datastoreId} datasheetName={datasheetName} service={service} styleNames={styleNames} />}

            {(isPendingChangeCurrentStyle || isRemovePending) && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{isRemovePending ? tCommon("removing") : tCommon("modifying")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            <ConfirmDialog
                title={tStyle("remove_style", { styleName: styleToRemove })}
                onConfirm={() => {
                    if (styleToRemove !== undefined) {
                        mutateRemove(styleToRemove);
                    }
                }}
            />
        </>
    );
};

export default ManageStylesTab;
