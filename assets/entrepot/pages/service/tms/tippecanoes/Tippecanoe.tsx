import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

import tippecanoes from "../../../../../data/tippecanoe.json";
import { useTranslation } from "../../../../../i18n";
import { appRoot } from "../../../../../router/router";
import RichLabel from "./RichLabel";

import "../../../../../sass/components/tippecanoe.scss";

type TippeCanoeProps = {
    visible: boolean;
    state: "default" | "error" | "success";
    stateRelatedMessage: string;
    form: UseFormReturn;
};

const TippeCanoe: FC<TippeCanoeProps> = ({ visible, form, state, stateRelatedMessage }) => {
    const { t } = useTranslation("PyramidVectorGenerateForm");

    const { register } = form;

    return (
        <div className={fr.cx("fr-my-2v", "fr-grid-row", !visible && "fr-hidden")}>
            <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                <RadioButtons
                    legend={t("step_generalisation.tippecanoe_option.label")}
                    options={Object.values(tippecanoes).map((tpc) => ({
                        label: <RichLabel label={tpc.label} image={`${appRoot}/${tpc.image}`} />,
                        hintText: tpc.explain,
                        nativeInputProps: {
                            ...register("tippecanoe"),
                            value: tpc.value,
                        },
                    }))}
                    state={state}
                    stateRelatedMessage={stateRelatedMessage}
                />
            </div>
        </div>
    );
};

export default TippeCanoe;
