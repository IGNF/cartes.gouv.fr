import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup, { ButtonsGroupProps } from "@codegouvfr/react-dsfr/ButtonsGroup";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";

import { getWorkingLayers, MapInitial } from "@/components/Utils/RMap";
import { useManageStyle } from "@/contexts/ManageStyleContext";
import StyleHelper from "@/modules/Style/StyleHelper";
import { CartesStyle, GeostylerStyle, GeostylerStyles, Service } from "../../../../@types/app";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";

import "@/sass/components/upload-style-files.css";

type ManageStylesProps = {
    initial: MapInitial;
    datastoreId: string;
    datasheetName: string;
    offeringId: string;
    service?: Service;
};

const ManageStyles: FC<ManageStylesProps> = (props) => {
    const { initial, service, offeringId, datastoreId, datasheetName } = props;
    const { t: tStyle } = useTranslation("Style");
    const { t: tCommon } = useTranslation("Common");

    const [editMode, setEditMode] = useState(false);
    const { styleToAddOrEdit, setStyleToAddOrEdit, styleToRemove, setStyleToRemove } = useManageStyle();

    // Recherche des services (offerings) contenant le tag datasheet_name a datasheetName
    /*const serviceListQuery = useQuery<Service[], CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        refetchInterval: 60000,
    }); */

    // Les styles
    const styles: CartesStyle[] = service?.configuration.styles ?? [];

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
            setStyleToAddOrEdit(undefined);
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
                <RadioButtons
                    className={fr.cx("fr-mt-4v")}
                    classes={{ inputGroup: cx(fr.cx("fr-radio-rich"), "frx-rb-style-layer") }}
                    legend={
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col")}>
                                <h3 className={fr.cx("fr-text--md", "fr-m-0")}>
                                    <strong>{tStyle("my_styles")}</strong>{" "}
                                    <Badge severity="info" noIcon>
                                        {styles.length}
                                    </Badge>
                                </h3>
                            </div>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--right")}>
                                <Button size="small" onClick={() => setEditMode(true)} disabled={editMode}>
                                    {tStyle("modify")}
                                </Button>
                            </div>
                        </div>
                    }
                    options={styles.map((style) => ({
                        label: style.name,
                        illustration: (
                            <>
                                <Button
                                    title={tStyle("edit_style")}
                                    priority={"tertiary no outline"}
                                    iconId={"fr-icon-edit-line"}
                                    onClick={async () => {
                                        const styleFiles: GeostylerStyles = [];
                                        const promises: Promise<GeostylerStyle | undefined>[] = [];
                                        for (const layer of getWorkingLayers(initial.layers)) {
                                            if (StyleHelper.filterLayer(layer)) {
                                                promises.push(StyleHelper.getStyleFromUrl(layer, style));
                                            }
                                        }
                                        for (const style of await Promise.all(promises)) {
                                            if (style) {
                                                styleFiles.push(style);
                                            }
                                        }
                                        setStyleToAddOrEdit({
                                            style_name: style.name,
                                            style_files: styleFiles,
                                            style_format: styleFiles[0].format,
                                        });
                                    }}
                                />
                                <Button
                                    title={tStyle("remove_style", { styleName: style.name })}
                                    priority={"tertiary no outline"}
                                    iconId={"fr-icon-delete-line"}
                                    onClick={() => {
                                        setStyleToRemove(style.name);
                                        ConfirmDialogModal.open();
                                    }}
                                />
                            </>
                        ),
                        nativeInputProps: {
                            checked: style?.current === true,
                            onChange: () => {
                                mutateChangeCurrentStyle(style.name);
                                setStyleToAddOrEdit(undefined);
                                setStyleToRemove(undefined);
                            },
                        },
                    }))}
                    disabled={!editMode}
                />

                {/* {editMode && ( */}
                <ButtonsGroup
                    buttons={(() => {
                        const buttons: ButtonsGroupProps["buttons"] = [
                            {
                                children: tStyle("add_style"),
                                priority: "secondary",
                                onClick: () => setStyleToAddOrEdit({ style_name: "", style_files: [] }),
                            },
                        ];
                        if (styleToAddOrEdit !== undefined) {
                            buttons.push({
                                children: tCommon("cancel"),
                                priority: "secondary",
                                onClick: () => setStyleToAddOrEdit(undefined),
                            });
                        }
                        return buttons;
                    })()}
                    inlineLayoutWhen="never"
                />
                {/* )} */}
            </div>

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

export default ManageStyles;
