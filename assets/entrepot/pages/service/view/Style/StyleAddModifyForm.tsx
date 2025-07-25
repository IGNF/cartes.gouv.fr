import { fr } from "@codegouvfr/react-dsfr";
import Alert, { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StyleParser } from "geostyler-style";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { useManageStyle } from "@/contexts/ManageStyleContext";
import { getStyleExtension } from "@/utils";
import { mbParser, qgisParser, sldParser } from "@/utils/geostyler";
import { CartesStyle, GeostylerStyles, Service, StyleFormat } from "../../../../../@types/app";
import { AnnexDetailResponseDto, OfferingDetailResponseDtoTypeEnum } from "../../../../../@types/entrepot";
import { getTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import getStyleFilesManager from "../../../../../modules/Style/StyleFilesManager";
import StyleHelper from "../../../../../modules/Style/StyleHelper";
import getWebService from "../../../../../modules/WebServices/WebServices";
import validations from "../../../../../validations";
import api from "../../../../api";
import UploadLayerStyles from "./UploadLayerStyles";

export interface StyleForm {
    style_format?: StyleFormat;
    style_name: string;
    style_files: GeostylerStyles;
}

interface EditStyle {
    annexeId: string;
    format: StyleFormat;
    name: string;
    style: string;
}

type ErrorType = {
    message: string;
    severity: AlertProps.Severity;
};

type StyleAddModifyFormProps = {
    datastoreId: string;
    datasheetName: string;
    editMode: boolean;
    service: Service;
    style: StyleForm;
    styleNames: string[];
};

const { t: tCommon } = getTranslation("Common");

const StyleAddModifyForm: FC<StyleAddModifyFormProps> = (props) => {
    const { datastoreId, datasheetName, editMode, service, style, styleNames } = props;

    const { setStyleToAddOrEdit } = useManageStyle();

    const schema = () => {
        const style_name = yup
            .string()
            .required("Le nom du style est obligatoire.")
            .test("is-unique", "Le nom du style existe déjà", (name) => {
                return editMode || !styleNames.includes(name);
            });

        if (format === "sld" || format === "qml") {
            return yup.object().shape({
                style_name: style_name,
                style_files: yup.lazy(() => {
                    const styleFiles = {};
                    Object.keys(layers).forEach((uuid) => {
                        styleFiles[uuid] = yup.string().test({
                            name: "is-valid",
                            async test(value, ctx) {
                                if (value === undefined) {
                                    return true;
                                }
                                return validations.getValidator(service, format).validate(value, ctx);
                            },
                        });
                    });
                    return yup.object().shape(styleFiles);
                }),
            });
        }

        // format mapbox (json)
        return yup.object().shape({
            style_name: style_name,
            style_files: yup.lazy(() => {
                const styleFiles = {};
                styleFiles["no_layer"] = yup.string().test({
                    name: "is-valid",
                    async test(value, ctx) {
                        if (value === undefined) {
                            return true;
                        }
                        return validations.getValidator(service, format).validate(value, ctx);
                    },
                });
                return yup.object().shape(styleFiles);
            }),
        });
    };

    // Les layers object {uuid: nom}
    const [layers, setLayers] = useState<Record<string, string>>({});

    const [error, setError] = useState<ErrorType | undefined>(undefined);

    const [format, setFormat] = useState<StyleFormat | undefined>(() => {
        if (style.style_format) {
            return style.style_format;
        }
        let defaultFormat: StyleFormat | undefined;
        if (service?.type === OfferingDetailResponseDtoTypeEnum.WFS) {
            defaultFormat = "sld";
        } else if (service?.type === OfferingDetailResponseDtoTypeEnum.WMTSTMS) {
            defaultFormat = "mapbox";
        }
        return defaultFormat;
    });

    let parser: StyleParser = sldParser;
    let parsers: StyleParser[] = [sldParser, qgisParser];
    if (format === "mapbox") {
        parser = mbParser;
        parsers = [mbParser];
    } else if (format === "qml") {
        parser = qgisParser;
    }

    // On utilise un uuid car le nom des couches peuvent contenir des espaces, des quotes
    // et la creation du schema pose problemes
    useEffect(() => {
        if (!service) return;

        const layers = {};
        const layerNames: string[] = getWebService(service).getLayerNames();
        layerNames.forEach((name) => {
            const uuid = uuidv4();
            layers[uuid] = name;
        });
        setLayers(layers);
    }, [service]);

    const form = useForm({
        resolver: yupResolver(schema()),
        mode: "onChange",
        defaultValues: {
            style_name: style.style_name,
            style_files: Object.fromEntries(style.style_files.map((file) => [file.name, file.style])),
        },
    });
    const {
        register,
        reset,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
    } = form;

    const hasStyles = service?.type === OfferingDetailResponseDtoTypeEnum.WFS || service?.type === OfferingDetailResponseDtoTypeEnum.WMTSTMS;

    const onChangeFormat = (f: StyleFormat) => {
        setFormat(f);
        reset({ style_files: {} });
    };

    const checkForm = (): boolean => {
        const values = getFormValues();
        const b = StyleHelper.check(values);
        if (!b) {
            setError({ message: "Il faut ajouter au moins un fichier.", severity: "warning" });
        }

        return b;
    };

    async function onSubmit() {
        setError(undefined);
        if (checkForm() && service && format) {
            try {
                const values = getFormValues();
                if (editMode) {
                    // Edit
                    const annexeIds = Object.fromEntries(style.style_files.map((file) => [file.name, file.annexeId]));
                    const data = Object.entries(values.style_files)
                        .map(([name, style]) => ({
                            annexeId: annexeIds[name],
                            name,
                            style,
                            format,
                        }))
                        .filter(({ annexeId }) => annexeId);
                    mutateEdit(data as EditStyle[]);
                } else {
                    // Add
                    const manager = getStyleFilesManager(service, format);
                    const formData = await manager.prepare(values);
                    mutateAdd(formData);
                }
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError({ message: e.message, severity: "error" });
                }
            }
        }
    }

    const queryClient = useQueryClient();

    // Ajout d'un style
    const { isPending, mutate: mutateAdd } = useMutation<CartesStyle[] | undefined, CartesApiException, FormData>({
        mutationFn: (form: FormData) => {
            if (service?._id) {
                return api.style.add(datastoreId, service?._id, form);
            }
            return Promise.resolve(undefined);
        },
        onSuccess: () => {
            setError(undefined);
            setStyleToAddOrEdit(undefined);
            if (service !== undefined) {
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_offering(datastoreId, service._id) });
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            }
        },
        onError: (error) => {
            setError({ message: error.message, severity: "error" });
        },
        onSettled: () => {
            reset({ style_name: "", style_files: {} });
        },
    });

    // Modification d'un style
    const { isPending: updateIsPending, mutate: mutateEdit } = useMutation<AnnexDetailResponseDto[] | undefined, CartesApiException, EditStyle[]>({
        mutationFn: (data: EditStyle[]) => {
            if (service?._id) {
                const promises = data.map(({ annexeId, format, name, style }) => {
                    const blob = new Blob([style]);
                    const extension = getStyleExtension(format);
                    const file = new File([blob], `${name}.${extension}`);
                    return api.annexe.replaceFile(datastoreId, annexeId, file);
                });
                return Promise.all(promises);
            }
            return Promise.resolve(undefined);
        },
        onSuccess: () => {
            setError(undefined);
            setStyleToAddOrEdit(undefined);
            if (service !== undefined) {
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_offering(datastoreId, service._id) });
                // queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            }
        },
        onError: (error) => {
            setError({ message: error.message, severity: "error" });
        },
        onSettled: () => {
            reset({ style_name: "", style_files: {} });
        },
    });

    const layerNames = format === "mapbox" ? ["no_layer"] : Object.values(layers);

    return (
        <form className={fr.cx("fr-grid-row")} onSubmit={handleSubmit(onSubmit)}>
            <div className={fr.cx("fr-col-12")}>
                {error && (
                    <Alert
                        className={fr.cx("fr-mb-2w")}
                        title={error?.severity === "error" ? "Erreur" : "Attention"}
                        closable
                        description={error?.message}
                        severity={error?.severity ?? "error"}
                    />
                )}
                {(isPending || updateIsPending) && (
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-2w")}>
                        <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                        <h6 className={fr.cx("fr-m-0")}>{isPending ? tCommon("adding") : tCommon("modifying")}</h6>
                    </div>
                )}
                {hasStyles && (
                    <>
                        <Input
                            label={"Nom du style :"}
                            state={errors.style_name ? "error" : "default"}
                            stateRelatedMessage={errors?.style_name?.message}
                            nativeInputProps={{
                                ...register("style_name"),
                                readOnly: editMode,
                            }}
                        />
                        <RadioButtons
                            legend={"Format du style :"}
                            options={[
                                {
                                    label: "sld",
                                    nativeInputProps: {
                                        checked: format === "sld",
                                        onChange: () => onChangeFormat("sld"),
                                    },
                                },
                                {
                                    label: "qml",
                                    nativeInputProps: {
                                        checked: format === "qml",
                                        onChange: () => onChangeFormat("qml"),
                                    },
                                },
                                service?.type === OfferingDetailResponseDtoTypeEnum.WMTSTMS && {
                                    label: "mapbox",
                                    nativeInputProps: {
                                        checked: format === "mapbox",
                                        onChange: () => onChangeFormat("mapbox"),
                                    },
                                },
                            ].filter((o) => o !== false)}
                            orientation="horizontal"
                        />
                    </>
                )}
                {Object.keys(layers).length > 0 && hasStyles && format && (
                    <UploadLayerStyles
                        /* @ts-expect-error Problème d'inférence du type de form */
                        form={form}
                        format={format}
                        names={layerNames}
                        parser={parser}
                        parsers={parsers}
                    />
                )}
            </div>
            <Button type="submit">Sauvegarder</Button>
        </form>
    );
};

export default StyleAddModifyForm;
