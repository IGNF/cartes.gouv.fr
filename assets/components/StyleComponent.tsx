import { fr } from "@codegouvfr/react-dsfr";
import { Service, TagStyle } from "../types/app";
import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Input from "@codegouvfr/react-dsfr/Input";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import Alert, { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ServiceUtils from "../modules/WebServices/ServiceUtils";
import * as yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useMutation /*, useQueryClient*/, useQueryClient } from "@tanstack/react-query";
import { CartesApiException } from "../modules/jsonFetch";
import { AddStyleFormType, StyleHelper } from "../modules/WebServices/StyleHelper";
import validations from "../validations";
import api from "../api";
import { ConfigurationDetailResponseDto, OfferingDetailResponseDto } from "../types/entrepot";
import RQKeys from "../modules/RQKeys";

type StyleComponentProps = {
    datastoreId: string;
    service?: Service;
    styleNames: string[];
    styles?: TagStyle[];
};

type FormatType = "mapbox" | "sld" | "qml";

type ErrorType = {
    message: string;
    severity: AlertProps.Severity;
};

const addStyleModal = createModal({
    id: "style-modal",
    isOpenedByDefault: false,
});

const StyleComponent: FC<StyleComponentProps> = ({ datastoreId, service, styleNames }) => {
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
                        styleFiles[uuid] = yup.mixed().test({
                            name: "is-valid",
                            async test(value, ctx) {
                                const files = value;

                                const file = files?.[0] ?? undefined;
                                if (file === undefined) {
                                    return true;
                                }
                                return validations.getValidator(format).validate(layers[uuid], value as FileList, ctx);
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
                styleFiles["no_layer"] = yup.mixed().test({
                    name: "is-valid",
                    async test(value, ctx) {
                        const files = value;

                        const file = files?.[0] ?? undefined;
                        if (file === undefined) {
                            return true;
                        }
                        return validations.getValidator(format).validate(undefined, value as FileList, ctx);
                    },
                });
                return yup.object().shape(styleFiles);
            }),
        });
    };

    // Les layers object {uuid: nom}
    const [layers, setLayers] = useState<Record<string, string>>({});

    const [error, setError] = useState<ErrorType | undefined>(undefined);
    const [format, setFormat] = useState<FormatType>("mapbox");

    // On utilise un uuid car le nom des couches peuvent contenir des espaces, des quotes
    // et la creation du schema pose problemes
    useEffect(() => {
        const getLayerNames = async () => {
            return ServiceUtils.getLayerNames(service);
        };

        getLayerNames()
            .then((layerNames) => {
                const layers = {};
                layerNames.forEach((name) => {
                    const uuid = uuidv4();
                    layers[uuid] = name;
                });
                setLayers(layers);
            })
            .catch((err) => setError({ message: err.message, severity: "error" }));
    }, [service]);

    const {
        register,
        reset,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
    } = useForm({ resolver: yupResolver(schema()), mode: "onChange" });

    const hasStyles = service?.type === "WFS" || service?.type === "WMTS-TMS";

    const onChangeFormat = (f: FormatType) => {
        setFormat(f);
        reset({ style_files: {} });
    };

    const checkForm = (): boolean => {
        setError(undefined);

        const values = getFormValues() as AddStyleFormType;
        const b = StyleHelper.check(values);
        if (!b) {
            setError({ message: "Il faut ajouter au moins un fichier.", severity: "warning" });
        }

        return b;
    };

    const onSubmit = () => {
        if (checkForm()) {
            const form = StyleHelper.format(getFormValues(), layers);
            mutateAdd(form);
        }
    };

    const queryClient = useQueryClient();

    // Ajout d'un style
    const { isPending, mutate: mutateAdd } = useMutation<undefined, CartesApiException, FormData>({
        mutationFn: (form: FormData) => {
            if (service?._id) {
                return api.style.add(datastoreId, service?._id, form);
            }
            return Promise.resolve(undefined);
        },
        onSuccess: (styles) => {
            console.log(styles);
            // TODO METTRE A JOUR LA LISTE DES STYLES
            /*queryClient.setQueryData<OfferingDetailResponseDto>(RQKeys.datastore_offering(datastoreId, service?._id), (service) => {    
            });*/
            addStyleModal.close();
        },
        onError: (error) => {
            setError({ message: error.message, severity: "error" });
        },
        onSettled: () => {
            setError(undefined);
            reset({ style_name: "", style_files: {} });
        },
    });

    return createPortal(
        <addStyleModal.Component
            title={"Ajouter un style"}
            buttons={[
                {
                    children: "Annuler",
                    priority: "secondary",
                    doClosesModal: false,
                    onClick: () => {
                        setError(undefined);
                        reset({ style_name: "", style_files: {} });
                        addStyleModal.close();
                    },
                },
                {
                    children: "Ajouter le style",
                    doClosesModal: false,
                    onClick: handleSubmit(onSubmit),
                },
            ]}
        >
            <div className={fr.cx("fr-grid-row")}>
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
                            <RadioButtons
                                legend={"Format du style :"}
                                options={[
                                    {
                                        label: "mapbox",
                                        nativeInputProps: {
                                            checked: format === "mapbox",
                                            onChange: () => onChangeFormat("mapbox"),
                                        },
                                    },
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
                                ]}
                                orientation="horizontal"
                            />
                        </>
                    )}
                    {hasStyles && format === "sld" && (
                        <>
                            <p>{`Ajoutez un fichier ${format} par couche présente dans votre service.`}</p>
                            {Object.keys(layers).map((uid) => {
                                return (
                                    <div key={uid} className={fr.cx("fr-grid-row", "fr-mb-3w")}>
                                        <Upload
                                            className={fr.cx("fr-input-group")}
                                            label={layers[uid]}
                                            hint={`Sélectionner un fichier au format ${format}`}
                                            state={errors?.style_files?.[uid]?.message ? "error" : "default"}
                                            stateRelatedMessage={errors?.style_files?.[uid]?.message}
                                            nativeInputProps={{
                                                // @ts-expect-error probleme avec ce type de schema
                                                ...register(`style_files.${uid}`),
                                                accept: `.${format}`,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </>
                    )}
                    {hasStyles && format === "qml" && (
                        <>
                            <p>{`Ajoutez un fichier ${format} par couche présente dans votre service.`}</p>
                            {Object.keys(layers).map((uid) => {
                                return (
                                    <div key={uid} className={fr.cx("fr-grid-row", "fr-mb-3w")}>
                                        <Upload
                                            className={fr.cx("fr-input-group")}
                                            label={layers[uid]}
                                            hint={`Sélectionner un fichier au format ${format}`}
                                            state={errors?.style_files?.[uid]?.message ? "error" : "default"}
                                            stateRelatedMessage={errors?.style_files?.[uid]?.message}
                                            nativeInputProps={{
                                                // @ts-expect-error probleme avec ce type de schema
                                                ...register(`style_files.${uid}`),
                                                accept: `.${format}`,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </>
                    )}
                    {hasStyles && format === "mapbox" && (
                        <>
                            <p className={fr.cx("fr-text--xs", "fr-mb-0")}>
                                Le fichier doit être au format JSON et respecter les spécifications de style Mapbox. Le fichier sera modifié pour conserver
                                uniquement les layers qui correspondent à des couches de votre service.
                            </p>
                            <div className={fr.cx("fr-grid-row", "fr-mb-2w")}>
                                <Upload
                                    className={fr.cx("fr-input-group")}
                                    label={""}
                                    hint={"Sélectionner un fichier au format json (mapbox)"}
                                    state={errors?.style_files?.["no_layer"]?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.style_files?.["no_layer"]?.message}
                                    nativeInputProps={{
                                        // @ts-expect-error probleme avec ce type de schema
                                        ...register("style_files.no_layer"),
                                        accept: ".json",
                                    }}
                                />
                            </div>
                        </>
                    )}
                    {isPending && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>Ajout en cours ...</h6>
                        </div>
                    )}
                </div>
            </div>
        </addStyleModal.Component>,
        document.body
    );
};

export { addStyleModal, StyleComponent };
