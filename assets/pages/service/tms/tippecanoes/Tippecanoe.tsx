import { FC, useEffect, useMemo, useState } from "react";
import tippecanoes from "../../../../data/tippecanoe.json";
import RichLabel from "./RichLabel";
import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { UseFormReturn } from "react-hook-form";
import { appRoot } from "../../../../router/router";
import Translator from "../../../../modules/Translator";
import "../../../../sass/components/tippecanoe.scss";

type TippeCanoeValues = "-S10" | "-pn -S15" | "-an -S15" | "-aL -D8 -S15" | "-ac -aD -an -S15" | "-ac -an -S10" | "-ab -S20";
type TippeCanoeProps = {
    visible: boolean;
    state: "default" | "error" | "success";
    stateRelatedMessage: string;
    form: UseFormReturn;
};

const TippeCanoe: FC<TippeCanoeProps> = ({ visible, form, state, stateRelatedMessage }) => {
    const { register, setValue: setFormValue, getValues: getFormValues } = form;

    const [value, setValue] = useState<TippeCanoeValues>();

    const options = useMemo(() => {
        return Object.values(tippecanoes).map((tpc) => ({
            label: <RichLabel label={tpc.label} image={`${appRoot}/${tpc.image}`} />,
            hintText: tpc.explain,
            nativeInputProps: {
                value: tpc.value,
                checked: value === tpc.value,
                onChange: () => {
                    setValue(tpc.value as TippeCanoeValues);
                },
            },
        }));
    }, [value]);

    useEffect(() => {
        setFormValue("tippecanoe", value);
    }, [value, setFormValue]);

    useEffect(() => {
        const selectedTippecanoe = getFormValues("tippecanoe");
        setValue(selectedTippecanoe);
    }, [getFormValues]);

    return (
        <div className={fr.cx("fr-my-2v", "fr-grid-row", !visible && "fr-hidden")}>
            <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                <RadioButtons
                    {...register("tippecanoe")}
                    legend={Translator.trans("service.tms.new.step_tippecanoe.title")}
                    options={options}
                    state={state}
                    stateRelatedMessage={stateRelatedMessage}
                />
            </div>
        </div>
    );
};

export default TippeCanoe;
