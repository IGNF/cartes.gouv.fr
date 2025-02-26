import { CommunitiesLayers } from "@/@types/app_espaceco";
import { RefLayerTools } from "@/@types/espaceco";
import { fr } from "@codegouvfr/react-dsfr";
import { CSSProperties, FC } from "react";
import { RefLayersProvider } from "../../../../contexts/RefLayers";
import DBLayersTools from "./DBLayersTools";

const customStyle: CSSProperties = {
    border: "solid 1.5px",
    borderColor: fr.colors.decisions.border.actionHigh.blueFrance.default,
};

const dbStyle: CSSProperties = {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
};

type ContributionToolsProps = {
    editableLayers: CommunitiesLayers;
    refLayers: Record<RefLayerTools, { id: string; name: string }[]>;
};

const ContributionTools: FC<ContributionToolsProps> = ({ editableLayers, refLayers }) => {
    return (
        <RefLayersProvider refLayers={refLayers}>
            <div>
                {Object.entries(editableLayers).map(([dbTitle, dbLayers]) => {
                    return (
                        <div key={dbTitle}>
                            <div style={customStyle} className={fr.cx("fr-my-2v", "fr-p-1v")}>
                                <div className={fr.cx("fr-grid-row", "fr-p-2v")} style={dbStyle}>
                                    <span className={fr.cx("fr-icon-database-fill", "fr-mr-2v")} />
                                    <strong>{dbTitle}</strong>
                                </div>
                                <DBLayersTools dbLayers={dbLayers} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </RefLayersProvider>
    );
};

export default ContributionTools;
