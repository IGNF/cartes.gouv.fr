import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityFormMode, CommunityLayer, measureTools, navigationTools, otherTools, reportTools, ToolsFormType } from "../../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import LoadingText from "../../../../components/Utils/LoadingText";
import { useTranslation } from "../../../../i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import { getDefaultValues } from "../DefaultValues";
import { COMMUNITY_FORM_STEPS } from "../FormSteps";
import { allTools } from "./tools/Functionalities";

type EditToolsProps = {
    mode: CommunityFormMode;
    community: CommunityResponseDTO;
    onSubmit: (datas: FormData) => void;
};

const fields = ["database", "table", "role", "snapto", "tools"];

const EditTools: FC<EditToolsProps> = ({ mode, community, onSubmit }) => {
    const { t } = useTranslation("Functionalities");

    const {
        data: layers,
        isError,
        error,
        isLoading,
    } = useQuery<CommunityLayer[], CartesApiException>({
        queryKey: RQKeys.communityLayers(community.id, fields),
        queryFn: ({ signal }) => api.communityLayers.getFeatureTypes(community.id, fields, signal),
        staleTime: 3600000,
    });

    const schema = yup.object({
        functionalities: yup.array().of(yup.string().oneOf(allTools).required()).required(),
    });

    const values = getDefaultValues(community, COMMUNITY_FORM_STEPS.TOOLS) as ToolsFormType;

    const { register, watch } = useForm<ToolsFormType>({
        mode: "onSubmit",
        values: values,
        resolver: yupResolver(schema),
    });

    const editables = useMemo(() => {
        if (layers) {
            return layers.filter((l) => l.role === "edit" || l.role === "ref-edit");
        }
        return [];
    }, [layers]);

    console.log(editables);
    // console.log(watch());

    return (
        <>
            {isLoading && <LoadingText as={"h6"} message={t("loading_layers")} />}
            {isError && <Alert severity="error" closable title={error.message} />}
            <div>
                <h2>{t("simple_tools_title")}</h2>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    <div className={fr.cx("fr-col-6")}>
                        <Checkbox
                            legend={t("navigation_tools")}
                            options={navigationTools.map((tool) => ({
                                label: t("navigation_tools_label", { tool: tool }),
                                nativeInputProps: {
                                    ...register("functionalities"),
                                    value: tool,
                                },
                            }))}
                        />
                        <Checkbox
                            legend={t("other_tools")}
                            options={otherTools.map((tool) => ({
                                label: t("other_tools_label", { tool: tool }),
                                nativeInputProps: {
                                    ...register("functionalities"),
                                    value: tool,
                                },
                            }))}
                        />
                    </div>
                    <div className={fr.cx("fr-col-6")}>
                        <Checkbox
                            legend={t("report_tools")}
                            options={reportTools.map((tool) => ({
                                label: t("report_tools_label", { tool: tool }),
                                nativeInputProps: {
                                    ...register("functionalities"),
                                    value: tool,
                                },
                            }))}
                        />
                        <Checkbox
                            legend={t("measure_tools")}
                            options={measureTools.map((tool) => ({
                                label: t("measure_tools_label", { tool: tool }),
                                nativeInputProps: {
                                    ...register("functionalities"),
                                    value: tool,
                                },
                            }))}
                        />
                    </div>
                </div>
                <h2>{t("direct_contribution_tools")}</h2>
            </div>
        </>
    );
};

export default EditTools;
