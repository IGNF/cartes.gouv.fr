import { ICommunityLayer, RefToolsConfig } from "@/@types/app_espaceco";
import { arrRefLayerTools, RefLayerTools } from "@/@types/espaceco";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { useRefLayers } from "@/espaceco/contexts/RefLayers";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { getAvailableRefTools } from "./LayerUtils";

type LayerRefToolsProps = {
    layer: ICommunityLayer;
};

type AutocompleteOption = {
    name: string;
    id: string;
};

const LayerRefTools: FC<LayerRefToolsProps> = ({ layer }) => {
    const { t: tLayer } = useTranslation("LayerTools");

    const refLayers = useRefLayers();

    const { control, register, watch } = useFormContext();
    const refTools: Record<RefLayerTools, RefToolsConfig> = watch(`layer_tools.${layer.id}.ref_tools`);

    const availableTools = getAvailableRefTools(layer.geometry_type);

    return (
        refTools && (
            <div>
                {[...arrRefLayerTools].map((t) => {
                    const active = refTools[t].active;
                    const visible = availableTools.includes(t) && Object.keys(refLayers[t]).length;
                    //const layerNames = getRefLayerNames(t);

                    return (
                        <div key={t}>
                            <Checkbox
                                classes={{ root: "fr-my-0" }}
                                className={fr.cx(!visible && "fr-hidden")}
                                legend={null}
                                small
                                options={[
                                    {
                                        label: tLayer("ref_tool", { tool: t }),
                                        nativeInputProps: {
                                            ...register(`layer_tools.${layer.id}.ref_tools.${t}.active`),
                                        },
                                    },
                                ]}
                            />
                            <div className={fr.cx("fr-grid-row", "fr-my-2v", !active && "fr-hidden")}>
                                <div className={fr.cx("fr-col")}>
                                    <Controller
                                        control={control}
                                        name={`layer_tools.${layer.id}.ref_tools.${t}.layers`}
                                        render={({ field }) => (
                                            <AutocompleteSelect
                                                label={""}
                                                hintText={tLayer("num_layers", { num: refTools[t].layers.length })}
                                                options={Object.values(refLayers[t]).map((layer) => layer)}
                                                getOptionLabel={(option) => (option as AutocompleteOption).name}
                                                isOptionEqualToValue={(option, v) => option.id === v.id}
                                                value={field.value}
                                                onChange={(_, value) => field.onChange(value)}
                                                controllerField={field}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )
    );
};

export default LayerRefTools;
