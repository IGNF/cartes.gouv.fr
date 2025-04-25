import { fr } from "@codegouvfr/react-dsfr";
import { CartesStyle, Service, StyleFormat } from "../../../../../@types/app";
import { FC, useEffect, useState } from "react";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Input from "@codegouvfr/react-dsfr/Input";
import Alert, { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import * as yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import StyleHelper from "../../../../../modules/Style/StyleHelper";
import validations from "../../../../../validations";
import api from "../../../../api";
import { OfferingDetailResponseDtoTypeEnum } from "../../../../../@types/entrepot";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import UploadLayerStyles from "./UploadLayerStyles";
import getWebService from "../../../../../modules/WebServices/WebServices";
import getStyleFilesManager from "../../../../../modules/Style/StyleFilesManager";
import { getTranslation } from "../../../../../i18n/i18n";
import { mbParser, qgisParser, sldParser } from "@/utils/geostyler";
import { StyleParser } from "geostyler-style";
import Button from "@codegouvfr/react-dsfr/Button";

export interface StyleForm {
    style_name: string;
    style_files: Record<string, string>;
}

type ErrorType = {
    message: string;
    severity: AlertProps.Severity;
};

type StyleManagerProps = {
    datastoreId: string;
    datasheetName: string;
    service: Service;
    style: StyleForm;
    styleNames: string[];
};

const { t: tCommon } = getTranslation("Common");

const StyleManager: FC<StyleManagerProps> = ({ datastoreId, datasheetName, service, style, styleNames }) => {
    const schema = () => {
        const style_name = yup
            .string()
            .required("Le nom du style est obligatoire.")
            .test("is-unique", "Le nom du style existe déjà", (name) => {
                return !styleNames.includes(name);
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
                                const files = value;

                                const file = files?.[0] ?? undefined;
                                if (file === undefined) {
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
                        const files = value;

                        const file = files?.[0] ?? undefined;
                        if (file === undefined) {
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
        let defaultFormat: StyleFormat | undefined;
        if (service?.type === OfferingDetailResponseDtoTypeEnum.WFS) {
            defaultFormat = "sld";
        } else if (service?.type === OfferingDetailResponseDtoTypeEnum.WMTSTMS) {
            defaultFormat = "mapbox";
        }
        return defaultFormat;
    });

    let parser: StyleParser = sldParser;
    if (format === "mapbox") {
        parser = mbParser;
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

    const form = useForm({ resolver: yupResolver(schema()), mode: "onChange", defaultValues: style });
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

    const onSubmit = () => {
        setError(undefined);
        if (checkForm() && service && format) {
            const manager = getStyleFilesManager(service, format);
            manager
                .prepare(getFormValues(), layers)
                .then((formData) => mutateAdd(formData))
                .catch((e: Error) => {
                    setError({ message: e.message, severity: "error" });
                });
        }
    };

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
            if (service !== undefined) {
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_offering(datastoreId, service._id) });
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            }
            // addStyleModal.close();
        },
        onError: (error) => {
            setError({ message: error.message, severity: "error" });
        },
        onSettled: () => {
            reset({ style_name: "", style_files: {} });
        },
    });

    const radioOptions = [
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
    ];

    if (service?.type === OfferingDetailResponseDtoTypeEnum.WMTSTMS) {
        radioOptions.unshift({
            label: "mapbox",
            nativeInputProps: {
                checked: format === "mapbox",
                onChange: () => onChangeFormat("mapbox"),
            },
        });
    }

    const layerNames = format === "mapbox" ? ["no_layer"] : Object.keys(layers);

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
                {isPending && (
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-2w")}>
                        <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                        <h6 className={fr.cx("fr-m-0")}>{tCommon("adding")}</h6>
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
                            }}
                        />
                        <RadioButtons legend={"Format du style :"} options={radioOptions} orientation="horizontal" />
                    </>
                )}
                {Object.keys(layers).length > 0 && hasStyles && (
                    /* @ts-expect-error Problème d'inférence du type */
                    <UploadLayerStyles form={form} format={format} names={layerNames} parser={parser} />
                )}
            </div>
            <Button type="submit">Sauvegarder</Button>
        </form>
    );
};

export default StyleManager;
