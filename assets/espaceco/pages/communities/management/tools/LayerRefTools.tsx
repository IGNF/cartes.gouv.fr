import { ICommunityLayer, RefToolsConfig } from "@/@types/app_espaceco";
import { arrRefLayerTools, RefLayerTools } from "@/@types/espaceco";
import { useRefLayers } from "@/espaceco/contexts/RefLayers";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Select as SelectNext } from "@codegouvfr/react-dsfr/SelectNext";
import { FC, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { getAvailableRefTools } from "./LayerUtils";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";

type LayerRefToolsProps = {
    layer: ICommunityLayer;
};

type AutocompleteOption = {
    label: string;
    value: string;
};

const LayerRefTools: FC<LayerRefToolsProps> = ({ layer }) => {
    const { t: tLayer } = useTranslation("LayerTools");

    const refLayers = useRefLayers();

    const { control, register, watch } = useFormContext();
    const refTools: Record<RefLayerTools, RefToolsConfig> = watch(`layer_tools.${layer.id}.ref_tools`);

    const availableTools = getAvailableRefTools(layer.geometry_type);

    const getRefLayerNames = useCallback(
        (t: RefLayerTools) => {
            return refTools[t].layers.map((id) => refLayers[t][id].toString());
        },
        [refLayers, refTools]
    );

    return (
        refTools && (
            <div>
                {[...arrRefLayerTools].map((t) => {
                    const active = refTools[t].active;
                    const visible = availableTools.includes(t) && Object.keys(refLayers[t]).length;
                    const layerNames = getRefLayerNames(t);

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
                            <div className={fr.cx(!active && "fr-hidden")}>
                                <div className={fr.cx("fr-grid-row")}>{tLayer("num_layers", { num: layerNames.length })}</div>
                                <div className={fr.cx("fr-grid-row", "fr-text--xs")}>{layerNames.join(", ")}</div>
                                <div className={fr.cx("fr-grid-row", "fr-my-2v")}>
                                    <div className={fr.cx("fr-col")}>
                                        <SelectNext
                                            label={null}
                                            placeholder={tLayer("select_layer_placeholder")}
                                            nativeSelectProps={{
                                                multiple: true,
                                                ...register(`layer_tools.${layer.id}.ref_tools.${t}.layers`),
                                            }}
                                            options={Object.entries(refLayers[t]).map(([id, name]) => ({
                                                label: name,
                                                value: id,
                                            }))}
                                        />
                                        {/* <Controller
                                            control={control}
                                            name={`layer_tools.${layer.id}.ref_tools.${t}.layers`}
                                            render={({ field }) => (
                                                <AutocompleteSelect
                                                    label={""}
                                                    hintText={tLayer("num_layers", { num: layerNames.length })}
                                                    options={Object.entries(refLayers[t]).map(([id, name]) => ({
                                                        label: name,
                                                        value: id,
                                                    }))}
                                                    getOptionLabel={(option) => (option as AutocompleteOption).label}
                                                    isOptionEqualToValue={(option, v) => option.value === v.value}
                                                    value={field.value}
                                                    onChange={(_, v) => field.onChange((v as AutocompleteOption).value)}
                                                    controllerField={field}
                                                />
                                            )}
                                        /> */}
                                    </div>
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
