import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityFeatureTypeLayer, CommunityFormMode, PartialCommunityFeatureTypeLayer, ToolsFormType } from "../../../../@types/app_espaceco";
import { CommunityResponseDTO, LayerTools, RefLayerTools, RefLayerToolsType } from "../../../../@types/espaceco";
import LoadingText from "../../../../components/Utils/LoadingText";
import { useTranslation } from "../../../../i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import { getToolsDefaultValues } from "../DefaultValues";
import { COMMUNITY_FORM_STEPS } from "../FormSteps";
import ActionButtons from "./ActionButtons";
import ContributionTools from "./tools/ContributionTools";
import { allFunctionalities } from "./tools/Functionalities";
import { getEditableLayers, getRefLayers } from "./tools/LayerTools";
import SimpleLayerTools from "./tools/SimpleLayerTools";

type EditToolsProps = {
    mode: CommunityFormMode;
    community: CommunityResponseDTO;
    onPrevious?: () => void;
    onSubmit: (datas: object, saveOnly: boolean) => void;
};

const EditTools: FC<EditToolsProps> = ({ mode, community, onPrevious, onSubmit }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tLayer } = useTranslation("LayerTools");
    const { t } = useTranslation("Functionalities");

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
    const editableLayers = useMemo<Record<string, Record<number, PartialCommunityFeatureTypeLayer>>>(() => {
        return getEditableLayers(layers);
    }, [layers]);

    // Couches de rérérence pour les outils d'accrochage ou de plus court chemin
    const refLayers = useMemo<Record<RefLayerToolsType, Record<string, Record<number, PartialCommunityFeatureTypeLayer>>>>(() => {
        const ref = { snap: {}, shortestpath: {} };
        for (const tool of [...RefLayerTools]) {
            ref[tool] = getRefLayers(tool, layers);
        }
        return ref;
    }, [layers]);

    // default values
    const values = getToolsDefaultValues(community, editableLayers) as ToolsFormType;

    const layerTools = values.layer_tools;
    const layerRefTools = values.ref_tools;
    console.log("EDITABLELAYERS : ", editableLayers);
    console.log("REFLAYERS : ", refLayers);
    // console.log("LAYERREFTOOLS : ", layerRefTools);

    const schema = yup.object({
        functionalities: yup.array().of(yup.string().oneOf(allFunctionalities).required()).required(),
        layer_tools: yup.lazy(() => {
            const layersSchema = {};
            Object.keys(layerTools).forEach((id) => {
                layersSchema[id] = yup
                    .array()
                    .of(
                        yup
                            .string()
                            .oneOf([...LayerTools])
                            .required()
                    )
                    .required();
            });
            return yup.object().shape(layersSchema);
        }),
        ref_tools: yup.lazy(() => {
            const layersSchema = {};
            Object.keys(layerRefTools).forEach((id) => {
                layersSchema[id] = yup.array().of(yup.number().required()).required();
            });
            return yup.object().shape(layersSchema);
        }),
    });

    const methods = useForm<ToolsFormType>({
        mode: "onSubmit",
        values: values,
        resolver: yupResolver(schema),
    });
    const { getValues: getFormValues, handleSubmit } = methods;

    const onSubmitForm = (saveOnly: boolean) => {
        const values = getFormValues();
        console.log(values);

        // TODO REMETTRE
        /*const datas = { ...values };
        onSubmit(datas, saveOnly); */

        onSubmit({}, saveOnly);
    };

    return (
        <div>
            {isError ? (
                <Alert severity="error" closable title={error.message} />
            ) : isLoading ? (
                <LoadingText as={"h6"} message={tLayer("loading_layers")} />
            ) : (
                <FormProvider {...methods}>
                    <div>
                        <h2>{t("simple_tools_title")}</h2>
                        <SimpleLayerTools />
                        <h2>{tLayer("direct_contribution_tools")}</h2>
                        <ContributionTools editableLayers={editableLayers} refLayers={refLayers} layerRefTools={layerRefTools} />
                        {mode === "edition" ? (
                            <div className="fr-grid-row fr-grid-row--right">
                                <Button priority={"primary"} onClick={() => handleSubmit(() => onSubmitForm(true))()}>
                                    {tCommon("save")}
                                </Button>
                            </div>
                        ) : (
                            <ActionButtons
                                step={COMMUNITY_FORM_STEPS.TOOLS}
                                onPrevious={onPrevious}
                                onSave={() => handleSubmit(() => onSubmitForm(true))()}
                                onContinue={() => handleSubmit(() => onSubmitForm(false))()}
                            />
                        )}
                    </div>
                </FormProvider>
            )}
        </div>
    );
};

export default EditTools;
