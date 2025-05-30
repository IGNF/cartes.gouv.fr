import Wait from "@/components/Utils/Wait";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunitiesLayers, CommunityFeatureTypeLayer, geometryTypes, RefToolLayer, ToolsFormType } from "../../../../@types/app_espaceco";
import { arrLayerTools, arrRefLayerTools, CommunityResponseDTO, LayerTools, RefLayerTools } from "../../../../@types/espaceco";
import LoadingText from "../../../../components/Utils/LoadingText";
import { useTranslation } from "../../../../i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import { getFunctionalities, getToolsDefaultValues } from "../DefaultValues";
import ActionButtonsCreation from "./ActionButtonsCreation";
import ActionButtonsEdition from "./ActionButtonsEdition";
import ContributionTools from "./tools/ContributionTools";
import { allFunctionalities } from "./tools/Functionalities";
import { getEditableLayers, getRefLayers, prepareLayersForApi } from "./tools/LayerUtils";
import SimpleLayerTools from "./tools/SimpleLayerTools";
import ReuseCommunityConfig from "../ReuseCommunityConfig";

const Tools: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tLayer } = useTranslation("LayerTools");
    const { t } = useTranslation("Functionalities");
    const { t: tmc } = useTranslation("ManageCommunity");

    const [saveOnly, setSaveOnly] = useState<boolean>(true);

    const context = useCommunityContext();

    const { mode, updateCommunity, stepper, isCommunityUpdating, isCommunityUpdatingError, updatingCommunityError } = context;
    const community = context.community!;

    const queryClient = useQueryClient();

    const {
        isPending: isUpdatingLayers,
        isError: isUpdatingLayersError,
        error: updatingLayersError,
        mutate,
    } = useMutation<
        Record<string, CommunityFeatureTypeLayer[]>,
        CartesApiException,
        Record<number, { tools: LayerTools[]; ref_tools: Record<RefLayerTools, number[]> }>
    >({
        mutationFn: (datas) => {
            return api.communityLayers.update(community.id, datas);
        },
        onSuccess(response) {
            queryClient.setQueryData<Record<string, CommunityFeatureTypeLayer[]>>(RQKeys.communityLayers(community.id), (oldLayers) => {
                return response ? response : { ...oldLayers };
            });
            updateCommunity({ functionalities: getFormValues("functionalities") }, () => {
                if (mode === "creation" && !saveOnly && !stepper?.isLastStep()) {
                    stepper?.nextStep();
                }
            });
        },
    });

    const {
        data: layers,
        isError,
        error,
        isLoading,
    } = useQuery<Record<string, CommunityFeatureTypeLayer[]>, CartesApiException>({
        queryKey: RQKeys.communityLayers(community.id),
        queryFn: ({ signal }) => api.communityLayers.getFeatureTypes(community.id, signal),
        staleTime: 3600000,
    });

    // Couches editable role = "edit" ou "ref-edit"
    const editableLayers = useMemo<CommunitiesLayers>(() => {
        return getEditableLayers(layers);
    }, [layers]);

    // Couches de rérérence pour les outils d'accrochage ou de plus court chemin
    const refLayers = useMemo<Record<RefLayerTools, RefToolLayer[]>>(() => {
        const ref: Record<RefLayerTools, RefToolLayer[]> = { snap: [], shortestpath: [] };
        for (const tool of [...arrRefLayerTools]) {
            ref[tool] = getRefLayers(tool, layers);
        }
        return ref;
    }, [layers]);

    // default values
    const defaultValues = useMemo<ToolsFormType>(() => {
        return getToolsDefaultValues(community, editableLayers);
    }, [community, editableLayers]);

    const schema = yup.object({
        functionalities: yup.array().of(yup.string().oneOf(allFunctionalities).required()).required(),
        layer_tools: yup.lazy(() => {
            const layersSchema = {};
            Object.values(editableLayers).forEach((layers) => {
                Object.keys(layers).forEach((id) => {
                    layersSchema[id] = yup.object({
                        table_title: yup.string().required(),
                        geometry_type: yup
                            .string()
                            .oneOf([...geometryTypes])
                            .required(),
                        tools: yup
                            .array()
                            .of(
                                yup
                                    .string()
                                    .oneOf([...arrLayerTools])
                                    .required()
                            )
                            .required(),
                        ref_tools: yup.object({
                            snap: yup.object({
                                active: yup.boolean().required(),
                                layers: yup
                                    .array()
                                    .of(yup.object({ id: yup.string().required(), name: yup.string().required() }).required())
                                    .required(),
                            }),
                            shortestpath: yup.object({
                                active: yup.boolean().required(),
                                layers: yup
                                    .array()
                                    .of(yup.object({ id: yup.string().required(), name: yup.string().required() }).required())
                                    .required(),
                            }),
                        }),
                    });
                });
            });
            return yup.object().shape(layersSchema);
        }),
    });

    const methods = useForm<ToolsFormType>({
        mode: "onSubmit",
        values: defaultValues,
        resolver: yupResolver(schema),
    });

    const { getValues: getFormValues, setValue: setFormValue, handleSubmit } = methods;

    const onSubmitForm = (saveOnly: boolean) => {
        setSaveOnly(saveOnly);

        const values = getFormValues();
        const datas = prepareLayersForApi(values);
        mutate(datas);
    };

    const copyFromCommunity = useCallback(
        (reUsedCommunity?: CommunityResponseDTO) => {
            if (!reUsedCommunity) {
                return;
            }

            const functionalities = getFunctionalities(reUsedCommunity.functionalities);
            setFormValue("functionalities", functionalities);
        },
        [setFormValue]
    );

    return (
        <div>
            {isLoading && <LoadingText as={"h6"} message={tLayer("loading_layers")} />}
            {isError && <Alert severity="error" closable title={error.message} />}
            {isCommunityUpdating && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={tmc("updating")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {isCommunityUpdatingError && (
                <Alert className={fr.cx("fr-my-2v")} severity="error" closable title={tCommon("error")} description={updatingCommunityError?.message} />
            )}
            {isUpdatingLayersError ? (
                <Alert severity="error" closable title={updatingLayersError.message} />
            ) : isUpdatingLayers ? (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={tLayer("updating_layers")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            ) : (
                <FormProvider {...methods}>
                    <div>
                        <h2>{t("simple_tools_title")}</h2>
                        <ReuseCommunityConfig
                            title={tmc("tools.reuse_label")}
                            description={tmc("tools.reuse_description")}
                            confirmation={tmc("tools.reuse_confirmation")}
                            onCopy={(reUsedCommunity) => {
                                copyFromCommunity(reUsedCommunity);
                            }}
                        />
                        <SimpleLayerTools />
                        {Object.keys(editableLayers).length === 0 ? (
                            <div className={fr.cx("fr-my-2v")}>
                                <Alert severity={"info"} title={tLayer("no_editable_layers")} description={""} small closable={false} />
                            </div>
                        ) : (
                            <>
                                <h2>{tLayer("direct_contribution_tools")}</h2>
                                <ContributionTools editableLayers={editableLayers} refLayers={refLayers} />
                            </>
                        )}
                        {mode === "creation" ? (
                            <ActionButtonsCreation
                                onSave={() => handleSubmit(() => onSubmitForm(true))()}
                                onContinue={() => handleSubmit(() => onSubmitForm(false))()}
                            />
                        ) : (
                            <ActionButtonsEdition onSave={() => handleSubmit(() => onSubmitForm(true))()} />
                        )}
                    </div>
                </FormProvider>
            )}
        </div>
    );
};

export default Tools;
