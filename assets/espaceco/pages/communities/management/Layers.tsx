import { fr } from "@codegouvfr/react-dsfr";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { Options, optionsFromCapabilities } from "ol/source/WMTS";
import { FC, useMemo, useState } from "react";
import useCapabilities from "../../../../hooks/useCapabilities";
import { useTranslation } from "../../../../i18n/i18n";

const baseMaps = ["GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2", "GEOGRAPHICALGRIDSYSTEMS.MAPS.BDUNI.J1", "ORTHOIMAGERY.ORTHOPHOTOS", "CADASTRALPARCELS.PARCELS"];

const Layers: FC = () => {
    const { t } = useTranslation("ManageCommunity");
    const { data: capabilities } = useCapabilities();

    /* const cbBaseMapsOptions = useMemo<ReactNode[]>(() => {
        if (!capabilities) return [];


        Array.from(baseMaps, (m) => <div key={m} className={fr.cx("fr-grid-row", "fr-grid-row--middle")}></div>);
    }, [capabilities]); */

    const cbBaseMapsOptions = useMemo<Options[]>(() => {
        if (!capabilities) return [];

        const options: Options[] = [];
        baseMaps.forEach((m) => {
            const wmtsOptions = optionsFromCapabilities(capabilities, { layer: m, style: "Légende générique" });
            if (wmtsOptions) {
                options.push(wmtsOptions);
            }
        });
        return options;
    }, [capabilities]);
    console.log(cbBaseMapsOptions);

    const [selectedTabId, setSelectedTabId] = useState("tab1");

    return (
        <>
            <h2>{t("layer.tab.title")}</h2>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-7")}>
                    <Tabs
                        selectedTabId={selectedTabId}
                        tabs={[
                            { tabId: "my_datas", label: t("layer.tabl") },
                            { tabId: "gp_datas", label: t("layer.tab2") },
                            { tabId: "base_maps", label: t("layer.tab3") },
                        ]}
                        onTabChange={setSelectedTabId}
                    >
                        <>
                            {(() => {
                                switch (selectedTabId) {
                                    case "my_datas":
                                        return <p>`Content of ${selectedTabId}`</p>;
                                    case "gp_datas":
                                        return <p>`Content of ${selectedTabId}`</p>;
                                    case "base_maps":
                                        return <p>`Content of ${selectedTabId}`</p>;
                                }
                            })()}
                        </>
                    </Tabs>
                </div>
                <div className={fr.cx("fr-col-5")} />
            </div>
        </>
    );
};

export default Layers;
