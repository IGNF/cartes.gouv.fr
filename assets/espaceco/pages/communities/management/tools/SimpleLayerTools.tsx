import { ToolsFormType } from "@/@types/app_espaceco";
import { useTranslation } from "@/i18n/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { functionalityConfigs } from "./Functionalities";

const SimpleLayerTools: FC = () => {
    const { t } = useTranslation("Functionalities");

    const { register } = useFormContext<ToolsFormType>();

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            {Object.entries(functionalityConfigs).map(([category, config]) => (
                <div key={category} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                    <div className={fr.cx("fr-grid-row", "fr-my-2v")}>
                        {config.title}
                        <span className={fr.cx("fr-ml-2v")}>
                            <i className={config.iconId} />
                        </span>
                    </div>
                    <hr />
                    <Checkbox
                        options={config.functionalities.map((tool) => ({
                            label: t("tools_label", { tool: tool }),
                            nativeInputProps: {
                                ...register("functionalities"),
                                value: tool,
                            },
                        }))}
                    />
                </div>
            ))}
        </div>
    );
};

export default SimpleLayerTools;
