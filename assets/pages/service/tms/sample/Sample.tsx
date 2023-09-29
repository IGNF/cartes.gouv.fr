import { FC, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Translator from "../../../../modules/Translator";
import { fr } from "@codegouvfr/react-dsfr";
import RCSampleMap from "./RCSampleMap";

type booleanValue = "true" | "false";
type SampleType = {
    is_sample: booleanValue;
    center: number[];
    extent: number[];
};

const defaultSample: SampleType = {
    is_sample: "false",
    center: [2.35, 48.85],
    extent: [NaN, NaN, NaN, NaN],
};

type SampleProps = {
    visible: boolean;
    bottomZoomLevel: number;
    form: UseFormReturn;
};

const Sample: FC<SampleProps> = ({ visible, bottomZoomLevel, form }) => {
    const { setValue: setFormValue, getValues: getFormValues } = form;

    const [sample, setSample] = useState<SampleType>(defaultSample);

    useEffect(() => {
        const sample = getFormValues("sample");
        if (sample) {
            setSample(sample);
        }
    }, [getFormValues]);

    useEffect(() => {
        setFormValue("sample", sample);
    }, [sample, setFormValue]);

    // Echantillon ou pas
    const toggleSample = () => {
        if (sample) {
            const b = !(sample.is_sample === "true");
            setSample({ ...sample, is_sample: b.toString() as booleanValue });
        }
    };

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("service.tms.new.step_sample.title")}</h3>
            <p>
                <strong>{Translator.trans("service.tms.new.step_sample.doubts")}</strong>
            </p>
            <p>{Translator.trans("service.tms.new.step_sample.explain")}</p>
            <Checkbox
                options={[
                    {
                        label: Translator.trans("service.tms.new.step_sample.define_sample"),
                        nativeInputProps: {
                            onChange: () => toggleSample(),
                        },
                    },
                ]}
            />
            {visible && sample?.is_sample === "true" && (
                <RCSampleMap
                    form={form}
                    center={sample.center}
                    bottomZoomLevel={bottomZoomLevel}
                    onChange={(center, extent) => {
                        setSample({ ...sample, center: center, extent: extent });
                    }}
                />
            )}
        </div>
    );
};

export default Sample;
