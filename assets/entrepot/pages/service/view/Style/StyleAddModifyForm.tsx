import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueries, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { StyleParser } from "geostyler-style";
import { FC, useEffect, useMemo, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import Main from "@/components/Layout/Main";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import { StyleFormProvider } from "@/contexts/StyleFormContext";
import TMSStyleTools from "@/modules/Style/TMSStyleFilesManager/TMSStyleTools";
import { routes } from "@/router/router";
import { decodeKeys, encodeKey, encodeKeys, getFileExtension } from "@/utils";
import { mbParser, qgisParser, sldParser } from "@/utils/geostyler";
import { CartesStyle, OfferingTypeEnum, Service, StyleFormatEnum } from "../../../../../@types/app";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import getWebService from "../../../../../modules/WebServices/WebServices";
import validations from "../../../../../validations";
import api from "../../../../api";
import UploadLayerStyles from "./UploadLayerStyles";

const tmsStyleTools = new TMSStyleTools();

type StyleAddModifyFormType = {
    style_name: string;
    style_files: Record<string, string>;
};

type StyleAddModifyPostDataType = {
    style_name: string;
    style_files: Record<
        keyof StyleAddModifyFormType["style_files"],
        {
            style: string;
            format: StyleFormatEnum;
        }
    >;
};

type StyleAddModifyFormProps = {
    datastoreId: string;
    datasheetName: string;
    offeringId: string;
    styleName?: string;
};

const StyleAddModifyForm: FC<StyleAddModifyFormProps> = (props) => {
    const { datastoreId, datasheetName, offeringId, styleName } = props;

    // const { t } = useTranslation("Style");
    const { t: tCommon } = useTranslation("Common");

    const schema: yup.ObjectSchema<StyleAddModifyFormType> = yup.object().shape({
        style_name: yup
            .string()
            .required("Le nom du style est obligatoire.")
            .test("is-unique", "Le nom du style existe déjà", (name) => {
                return editMode || !styleNames.includes(name);
            }),
        style_files: yup.lazy(() =>
            yup
                .object()
                .shape(
                    layerNames.reduce((acc, layerName) => {
                        const encodedKey = encodeKey(layerName);
                        acc[encodedKey] = yup
                            .string()
                            .transform((value) => value.trim())
                            .test({
                                name: "is-valid",
                                async test(value, ctx) {
                                    if (value === undefined || value === "") {
                                        return true;
                                    }
                                    if (!service) {
                                        return true;
                                    }

                                    const format = styleFormats[layerName] ?? StyleFormatEnum.SLD;
                                    return validations.getValidator(service, format).validate(value, ctx);
                                },
                            });

                        if (layerName === "mapbox") {
                            acc[encodedKey] = acc[encodedKey].required("Le fichier de style Mapbox est obligatoire");
                        }

                        return acc;
                    }, {})
                )
                .test({
                    name: "at-least-one",
                    message() {
                        if (layerNames.length === 1 && layerNames[0] === "mapbox") {
                            return "Le fichier de style Mapbox est obligatoire";
                        }
                        return "Au moins un fichier de style doit être renseigné.";
                    },
                    test(value) {
                        return Object.values(value).some((v) => v !== undefined && v !== "");
                    },
                })
        ),
    });

    const editMode: boolean = Boolean(styleName);

    const queryClient = useQueryClient();

    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: ({ signal }) => api.service.getService(datastoreId, offeringId, { signal }),
        staleTime: 600000,
    });
    const { data: service } = serviceQuery;

    const styles: CartesStyle[] = useMemo(() => service?.configuration.styles ?? [], [service]);
    const styleNames = useMemo(() => Array.from(styles, (s) => s.name), [styles]);
    const style: CartesStyle = useMemo(
        () =>
            styles.find((s) => s.name === styleName) ?? {
                name: "",
                layers: [],
            },
        [styles, styleName]
    );

    const styleFilesQuery = useQueries({
        queries: style.layers.map<UseQueryOptions<string, CartesApiException>>((layer) => ({
            queryKey: RQKeys.datastore_annexe(datastoreId, layer.annexe_id),
            queryFn: async ({ signal }) => {
                // return api.annexe.getFileContent(datastoreId, layer.annexe_id, { signal, cache: "no-store" });
                const response = await fetch(layer.url, {
                    signal,
                    cache: "no-store",
                });
                const text = await response.text();
                return text;
            },
        })),
        combine: (results) => ({
            array: results.map((result) => result.data).filter(Boolean),
            data: results.reduce(
                (acc, result, index) => {
                    const layerName = style.layers[index].name;
                    if (result.data) {
                        acc[layerName ?? "mapbox"] = result.data;
                    }
                    return acc;
                },
                {} as Record<string, string>
            ),
            isLoading: results.some((result) => result.isLoading),
            isPending: results.some((result) => result.isPending),
            isFetching: results.some((result) => result.isFetching),
            isError: results.some((result) => result.isError),
            errors: results.map((result) => result.error).filter(Boolean),
        }),
    });

    const [isMapbox, setIsMapbox] = useState(service?.type === OfferingTypeEnum.WMTSTMS);
    const layerNames: string[] = useMemo(() => (isMapbox ? ["mapbox"] : service ? getWebService(service).getLayerNames().sort() : []), [isMapbox, service]);
    const [styleFormats, setStyleFormats] = useState<Record<string, StyleFormatEnum>>({});

    useEffect(() => {
        setStyleFormats((prevFormats) => {
            return layerNames.reduce((acc, layerName) => {
                if (acc[layerName] !== undefined) {
                    return acc; // déjà défini
                }

                // recherche si le style existe déjà pour cette couche, sinon SLD comme format par défaut
                const existingStyle = style.layers.find((l) => l.name === layerName);
                const extension = getFileExtension(existingStyle?.url ?? "");
                if (extension) {
                    acc[layerName] = extension as StyleFormatEnum;
                } else {
                    acc[layerName] = isMapbox ? StyleFormatEnum.Mapbox : StyleFormatEnum.SLD; // format par défaut
                }
                return acc;
            }, prevFormats);
        });
    }, [layerNames, isMapbox, style.layers]);

    const parser: StyleParser = isMapbox ? mbParser : sldParser;
    const parsers: StyleParser[] = isMapbox ? [mbParser] : [sldParser, qgisParser];

    const form = useForm<StyleAddModifyFormType>({
        resolver: yupResolver(schema),
        defaultValues: {
            style_name: style.name,
            style_files: {},
        },
    });
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = form;

    useEffect(() => {
        if (styleFilesQuery?.data) {
            form.setValue("style_files", encodeKeys(styleFilesQuery.data), { shouldDirty: false, shouldTouch: false });
        }
    }, [form, styleFilesQuery?.data]);

    const onValid: SubmitHandler<StyleAddModifyFormType> = async (data) => {
        if (!service) return;

        data["style_files"] = decodeKeys(data.style_files);

        const values: StyleAddModifyPostDataType = {
            style_name: data.style_name,
            style_files: {},
        };

        switch (service.type) {
            case OfferingTypeEnum.WMTSTMS:
                if (isMapbox) {
                    const mbStyle = tmsStyleTools.buildMbStyle(service, data["style_files"]["mapbox"]);
                    values.style_files["mapbox"] = {
                        style: JSON.stringify(mbStyle),
                        format: StyleFormatEnum.Mapbox,
                    };
                } else {
                    const mbStyle = await tmsStyleTools.getMbStyleFromSLDQML(service, layerNames, data["style_files"] ?? {}, styleFormats ?? {});
                    values.style_files["mapbox"] = {
                        style: JSON.stringify(mbStyle),
                        format: StyleFormatEnum.Mapbox,
                    };
                }
                break;

            case OfferingTypeEnum.WFS:
                values.style_files = Object.fromEntries(
                    Object.entries(data.style_files)
                        .filter(([, value]) => value !== "")
                        .map(([key, value]) => [
                            key,
                            {
                                style: value,
                                format: styleFormats[key] ?? StyleFormatEnum.SLD,
                            },
                        ])
                );
                break;
            default:
                throw new Error(`Type de service non-supporté : ${service.type}`);
        }

        addModifyMutation.mutate(values);
    };

    const addModifyMutation = useMutation({
        mutationFn: (data: StyleAddModifyPostDataType) => {
            if (!service) return Promise.reject(null);

            return editMode ? api.style.modify(datastoreId, offeringId, data) : api.style.add(datastoreId, offeringId, data);
        },
        onSuccess: (data: CartesStyle[]) => {
            queryClient.setQueryData(RQKeys.datastore_offering(datastoreId, offeringId), (oldService: Service | undefined) => {
                if (!oldService) return oldService;
                return {
                    ...oldService,
                    configuration: {
                        ...oldService.configuration,
                        styles: [...data],
                    },
                };
            });

            data
                ?.map((style) => style.layers.map((layer) => layer.annexe_id))
                .flat()
                .forEach((annexeId) => {
                    queryClient.removeQueries({ queryKey: RQKeys.datastore_annexe(datastoreId, annexeId) });
                });

            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_offering(datastoreId, offeringId) });
            routes.datastore_service_view({ datastoreId, datasheetName, offeringId }).push();
        },
    });

    return (
        <Main title={editMode ? `Modifier le style ${style.name}` : "Ajouter un style"}>
            {serviceQuery.isPending || styleFilesQuery.isPending ? (
                <LoadingText />
            ) : serviceQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={serviceQuery.error.message}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>Retour à mes données</Button>}
                />
            ) : serviceQuery.data ? (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-16v")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datastore_service_view({ datastoreId, datasheetName, offeringId }).link}
                            title="Retour à la fiche de donnée"
                            size="large"
                        />
                        <h1 className={fr.cx("fr-m-0")}>{editMode ? `Modifier le style "${style.name}"` : "Ajouter un style"}</h1>
                        {serviceQuery?.data?.type && (
                            <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                                {serviceQuery?.data?.type}
                            </Badge>
                        )}
                    </div>

                    {addModifyMutation.error && <Alert closable description={addModifyMutation.error.message} severity="error" title={tCommon("error")} />}

                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col-4")}>
                            <h2 className={fr.cx("fr-mb-4v")}>Nom du style</h2>
                            <Input
                                label={"Nom"}
                                state={errors.style_name ? "error" : "default"}
                                stateRelatedMessage={errors?.style_name?.message}
                                nativeInputProps={{
                                    ...register("style_name"),
                                }}
                                disabled={editMode === true}
                            />
                        </div>
                    </div>

                    <StyleFormProvider
                        editMode={editMode}
                        service={service}
                        serviceType={service?.type}
                        isMapbox={isMapbox}
                        setIsMapbox={setIsMapbox}
                        defaultTable={layerNames[0]}
                        styleFormats={styleFormats}
                        setStyleFormats={setStyleFormats}
                    >
                        {layerNames.length > 0 && service !== undefined && (
                            <FormProvider {...form}>
                                <UploadLayerStyles service={service} parser={parser} parsers={parsers} names={layerNames} />
                            </FormProvider>
                        )}
                    </StyleFormProvider>

                    <div className={fr.cx("fr-grid-row", "fr-mt-16v", "fr-mb-20v")}>
                        <ButtonsGroup
                            buttons={[
                                {
                                    type: "submit",
                                    children: "Ajouter le style",
                                    onClick: handleSubmit(onValid),
                                },
                            ]}
                            inlineLayoutWhen="always"
                            style={{ marginLeft: "auto" }}
                            buttonsEquisized={true}
                        />
                    </div>
                </>
            ) : null}

            {addModifyMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon largeIcon={true} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{editMode ? tCommon("modifying") : tCommon("adding")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </Main>
    );
};

export default StyleAddModifyForm;
