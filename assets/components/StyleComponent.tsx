import { fr } from "@codegouvfr/react-dsfr";
import { Service, TagStyle } from "../types/app";
import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Input from "@codegouvfr/react-dsfr/Input";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ServiceUtils from "../modules/WebServices/ServiceUtils";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartesApiException } from "../modules/jsonFetch";
import { AddStyleFormType, StyleHelper } from "../modules/WebServices/StyleHelper";
import LoadingText from "./Utils/LoadingText";
import validations from "../validations";
import api from "../api";

type StyleComponentProps = {
    datastoreId: string;
    service?: Service;
    styleNames: string[];
    styles?: TagStyle[];
};

type FormatType = "mapbox" | "sld" | "qml";

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
                    layers.forEach((layer) => {
                        styleFiles[layer] = yup.mixed().test({
                            name: "is-valid",
                            async test(value, ctx) {
                                return validations.getValidator(format).validate(layer, value as FileList, ctx);
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
                styleFiles["no-layer"] = yup.mixed().test({
                    name: "is-valid",
                    async test(/*value, ctx*/) {
                        return true; // TODO
                    },
                });
                return yup.object().shape(styleFiles);
            }),
        });
    };

    // Le nom des layers
    const [layers, setLayers] = useState<string[]>([]);

    const [error, setError] = useState<string>();
    const [format, setFormat] = useState<FormatType>("mapbox");

    useEffect(() => {
        ServiceUtils.getLayerNames(service)
            .then((layerNames) => {
                setLayers(layerNames);
            })
            .catch((err) => setError(err.message));
    }, [service]);

    const hasStyles = service?.type === "WFS" || service?.type === "WMTS-TMS";

    const onChangeFormat = (f: FormatType) => {
        setFormat(f);
        // TODO SUPPRIMER LES ANCIENS FICHIERS DANS LES INPUTS
    };

    const checkForm = (): boolean => {
        setError(undefined);

        const values = getFormValues() as AddStyleFormType;
        const b = StyleHelper.check(values);
        if (!b) {
            setError("Il faut ajouter au moins un fichier.");
        }

        return b;
    };

    const onSubmit = () => {
        if (checkForm()) {
            const form = StyleHelper.format(getFormValues());
            mutateAdd(form);
        }
    };

    // const queryClient = useQueryClient();

    // Ajout d'un style
    const { isPending, mutate: mutateAdd } = useMutation<undefined, CartesApiException, FormData>({
        mutationFn: (form: FormData) => {
            if (service?._id) {
                return api.style.add(datastoreId, service?._id, form);
            }
            return Promise.resolve(undefined);
        },
        onSuccess: (response) => {
            // TODO METTRE A JOUR LA LISTE DES STYLES
            addStyleModal.close();
        },
        onError: (error) => {
            setError(error.message);
        },
        onSettled: () => {
            reset({});
        },
    });

    const {
        register,
        //unregister,
        reset,
        resetField,
        getValues: getFormValues,
        setValue,
        //trigger,
        formState: { errors },
        /*watch, */
        handleSubmit,
    } = useForm({ resolver: yupResolver(schema()), mode: "onChange" });

    return createPortal(
        <addStyleModal.Component
            title={"Ajouter un style"}
            buttons={[
                {
                    children: "Annuler",
                    priority: "secondary",
                    doClosesModal: false,
                    onClick: () => {
                        // TODO NE FONCTIONNE PAS reset({"style_files", {}}) ou setValue("style_files", {});
                        reset({});
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
                    {error && <Alert className={fr.cx("fr-mb-2w")} title={"Erreur"} closable description={error} severity="error" />}
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
                    {hasStyles && (format === "sld" || format === "qml") && (
                        <>
                            <p>{`Ajoutez un fichier ${format} par couche présente dans votre service.`}</p>
                            {layers.map((layer) => (
                                <div key={layer} className={fr.cx("fr-grid-row", "fr-mb-3w")}>
                                    <Upload
                                        className={fr.cx("fr-input-group")}
                                        label={layer}
                                        hint={`Sélectionner un fichier au format ${format}`}
                                        state={errors?.style_files?.[layer]?.message ? "error" : "default"}
                                        stateRelatedMessage={errors?.style_files?.[layer]?.message}
                                        nativeInputProps={{
                                            // @ts-expect-error probleme avec ce type de schema
                                            ...register(`style_files[${layer}]`),
                                            accept: `.${format}`,
                                        }}
                                    />
                                </div>
                            ))}
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
                                    label={""}
                                    hint={""}
                                    state={errors?.style_files?.["mapbox"]?.message ? "error" : "default"}
                                    stateRelatedMessage={errors?.style_files?.["mapbox"]?.message}
                                    className={fr.cx("fr-input-group")}
                                    nativeInputProps={{
                                        // @ts-expect-error probleme avec ce type de schema
                                        ...register("style_files.mapbox"),
                                        accept: ".json",
                                    }}
                                />
                            </div>
                        </>
                    )}
                    {isPending && <LoadingText message={"Ajout en cours ..."} as={"h2"} />}
                </div>
            </div>
        </addStyleModal.Component>,
        document.body
    );
};

export { addStyleModal, StyleComponent };
