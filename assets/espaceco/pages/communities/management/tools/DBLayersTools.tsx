import { ICommunityLayer } from "@/@types/app_espaceco";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { CSSProperties, FC } from "react";
import { useFormContext } from "react-hook-form";
import { getAvailableTools } from "./LayerUtils";
import LayerRefTools from "./LayerRefTools";

type DBLayersToolsProps = {
    dbLayers: Record<number, ICommunityLayer>;
};

const customStyle: CSSProperties = {
    border: "solid 1.5px",
    borderColor: fr.colors.decisions.border.actionHigh.blueFrance.default,
};

const DBLayersTools: FC<DBLayersToolsProps> = ({ dbLayers }) => {
    const { t: tLayer } = useTranslation("LayerTools");

    const { register } = useFormContext();

    return (
        <div>
            {/* Outils standards draw, delete ... */}
            {Object.entries(dbLayers).map(([id, layer]) => {
                const availableTools = getAvailableTools(layer.geometry_type);
                return (
                    <div className={fr.cx("fr-px-2v", "fr-my-2v")} style={customStyle} key={id}>
                        <div className={fr.cx("fr-my-2v")}>{tLayer("table", { table: layer.table_title, geomType: layer.geometry_type })}</div>
                        <Checkbox
                            classes={{ root: "fr-my-0" }}
                            orientation={"horizontal"}
                            small
                            options={availableTools.map((tool) => ({
                                label: tLayer("contribution_tools", { tool: tool }),
                                nativeInputProps: {
                                    ...register(`layer_tools.${id}.tools`),
                                    value: tool,
                                },
                            }))}
                        />
                        <hr />
                        <LayerRefTools layer={layer} />
                    </div>
                );
            })}
        </div>
    );
};

export default DBLayersTools;
