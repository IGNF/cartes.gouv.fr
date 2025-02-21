import { PartialCommunityFeatureTypeLayer, ToolsFormType } from "@/@types/app_espaceco";
import { RefLayerToolsType } from "@/@types/espaceco";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { CSSProperties, FC } from "react";
import { useFormContext } from "react-hook-form";
import { getAvailableTools } from "./LayerTools";

const customStyle: CSSProperties = {
    border: "solid 1.5px",
    borderColor: fr.colors.decisions.border.actionHigh.blueFrance.default,
};

const dbStyle: CSSProperties = {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
};

type ContributionToolsProps = {
    editableLayers: Record<string, Record<number, PartialCommunityFeatureTypeLayer>>;
    refLayers: Record<RefLayerToolsType, Record<string, Record<number, PartialCommunityFeatureTypeLayer>>>;
    /* Outils d'accrochage ou de plus court chemin */
    layerRefTools: Record<number, Record<RefLayerToolsType, number[]>>;
};

const ContributionTools: FC<ContributionToolsProps> = ({ editableLayers, refLayers, layerRefTools }) => {
    const { t: tLayer } = useTranslation("LayerTools");
    const { register } = useFormContext<ToolsFormType>();

    const hasEditableLayers = Object.keys(editableLayers).length !== 0;

    return hasEditableLayers === false ? (
        <p>{tLayer("no_editable_layers")}</p>
    ) : (
        <div>
            {Object.keys(editableLayers).map((dbname) => {
                return (
                    <div key={dbname}>
                        <div style={customStyle} className={fr.cx("fr-my-2v", "fr-p-1v")}>
                            <div className={fr.cx("fr-grid-row", "fr-p-2v")} style={dbStyle}>
                                <span className={fr.cx("fr-icon-database-fill", "fr-mr-2v")} />
                                <strong>{dbname}</strong>
                            </div>
                        </div>
                        {/* Outils standards draw, delete ... */}
                        {Object.keys(editableLayers[dbname]).map((layerId) => {
                            const layer = editableLayers[dbname][layerId];
                            const availables = getAvailableTools(layer.geometry_type);
                            return (
                                <div className={fr.cx("fr-px-2v", "fr-my-2v")} style={customStyle} key={layerId}>
                                    <div key={layerId} className={fr.cx("fr-my-2v")}>
                                        {tLayer("table", { table: layer.table_name, geomType: layer.geometry_type })}
                                    </div>
                                    <Checkbox
                                        orientation={"horizontal"}
                                        small
                                        options={availables.map((tool) => ({
                                            label: tLayer("contribution_tools", { tool: tool }),
                                            nativeInputProps: {
                                                // @ts-expect-error "normal error"
                                                ...register(`layer_tools.${layerId}`),
                                                value: tool,
                                            },
                                        }))}
                                    />
                                    {/* ref tools */}
                                    {layerId in layerRefTools &&
                                        Object.keys(layerRefTools[layerId]).map((t) => {
                                            return (
                                                <div key={t}>
                                                    <hr />
                                                    {Object.values(refLayers[t]).length === 0 ? (
                                                        <div>{"Aucune couche"}</div>
                                                    ) : (
                                                        <Checkbox
                                                            legend={tLayer("ref_tool", { tool: t as RefLayerToolsType })}
                                                            orientation={"horizontal"}
                                                            small
                                                            options={Object.keys(refLayers[t]).map((refLayerId) => ({
                                                                label: refLayers[t][refLayerId].table_name,
                                                                nativeInputProps: {
                                                                    // @ts-expect-error "normal error"
                                                                    ...register(`ref_tools.${layerId}.${t}`),
                                                                    value: refLayerId,
                                                                },
                                                            }))}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default ContributionTools;
