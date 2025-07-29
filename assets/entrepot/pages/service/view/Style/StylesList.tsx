import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { CartesStyle, Service } from "@/@types/app";
import ConfirmDialog, { ConfirmDialogModal } from "@/components/Utils/ConfirmDialog";
import TextCopyToClipboard from "@/components/Utils/TextCopyToClipboard";
import Wait from "@/components/Utils/Wait";
import { useManageStyle } from "@/contexts/ManageStyleContext";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";

import "@/sass/components/styles-list.css";

interface StylesListProps {
    datastoreId: string;
    service: Service;
    datasheetName: string;
    offeringId: string;
}

function StylesList(props: StylesListProps) {
    const { datastoreId, service, datasheetName, offeringId } = props;

    const { t: tStyle } = useTranslation("Style");
    const { t: tCommon } = useTranslation("Common");

    const styles: CartesStyle[] = service?.configuration.styles ?? [];

    const { styleToRemove, setStyleToRemove } = useManageStyle();

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

    const [stylesShowDetails, setStylesShowDetails] = useState<Record<string, boolean>>({});

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-2v")}>
                <div className={fr.cx("fr-col")}>
                    <h3 className={fr.cx("fr-text--md", "fr-m-0")}>
                        <strong>{tStyle("my_styles")}</strong>{" "}
                        <Badge severity="info" noIcon>
                            {styles.length}
                        </Badge>
                    </h3>
                </div>
                <div className={fr.cx("fr-col")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--right")}>
                        <Button
                            size="small"
                            iconId="ri-add-line"
                            linkProps={
                                routes.datastore_service_style_add({
                                    datastoreId,
                                    datasheetName,
                                    offeringId,
                                }).link
                            }
                        >
                            {tCommon("add")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col")}>
                    {styles.map((style) => (
                        <div
                            key={style.name}
                            className={fr.cx("fr-my-2v", "fr-py-2v")}
                            style={{
                                borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                            }}
                        >
                            <div
                                className={cx(fr.cx("fr-radio-group"), "frx-radio-style-layer")}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    maxWidth: "100%",
                                }}
                            >
                                <input
                                    type="radio"
                                    id={`rb-style-${style.name}`}
                                    name={`rb-style-${style.name}`}
                                    checked={style?.current === true}
                                    value={style.name}
                                    onChange={() => {
                                        mutateChangeCurrentStyle(style.name);
                                        setStyleToRemove(undefined);
                                    }}
                                />
                                <label className={fr.cx("fr-label")} htmlFor={`rb-style-${style.name}`}>
                                    {style.name}
                                </label>
                                <div>
                                    <Button
                                        title={tStyle("edit_style")}
                                        priority={"tertiary no outline"}
                                        iconId={"fr-icon-edit-line"}
                                        linkProps={routes.datastore_service_style_edit({ datastoreId, datasheetName, offeringId, styleName: style.name }).link}
                                    />
                                    <Button
                                        title={tStyle("remove_style")}
                                        priority={"tertiary no outline"}
                                        iconId={"fr-icon-delete-line"}
                                        onClick={() => {
                                            setStyleToRemove(style.name);
                                            ConfirmDialogModal.open();
                                        }}
                                    />
                                    <Button
                                        title={"Voir les URLs"}
                                        priority={"tertiary no outline"}
                                        iconId={stylesShowDetails?.[style.name] === true ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}
                                        onClick={() => {
                                            setStylesShowDetails((prev) => ({
                                                ...prev,
                                                [style.name]: style.name in prev ? !prev[style.name] : true,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            {stylesShowDetails?.[style.name] === true && (
                                <section key={style.name} className={fr.cx("fr-my-2v")}>
                                    {style.layers.map((layer) => (
                                        <div key={style.name} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")}>
                                            <div className={fr.cx("fr-col", "fr-col-12")}>
                                                <TextCopyToClipboard
                                                    key={layer.name}
                                                    text={layer.url}
                                                    label={
                                                        // service.type === OfferingTypeEnum.WFS ? layer.name?.replace(service.layer_name + ":", "") : layer.name
                                                        layer.name
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}
                        </div>
                    ))}
                </div>
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
                title={tStyle("remove_style_confirmation", { styleName: styleToRemove })}
                onConfirm={() => {
                    if (styleToRemove !== undefined) {
                        mutateRemove(styleToRemove);
                    }
                }}
            />
        </>
    );
}

export default StylesList;
