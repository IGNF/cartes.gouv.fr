import { FC, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Translator from "../../../../modules/Translator";
import { fr } from "@codegouvfr/react-dsfr";
import RCSampleMap from "./RCSampleMap";
import olDefaults from "../../../../data/ol-defaults.json";

type booleanValue = "true" | "false";
export type SampleType = {
    is_sample: booleanValue;
    center: number[];
    area: string | undefined;
};

type SampleProps = {
    visible: boolean;
    bottomZoomLevel: number;
    form: UseFormReturn;
};

const Sample: FC<SampleProps> = ({ visible, bottomZoomLevel, form }) => {
    const { setValue: setFormValue, getValues: getFormValues } = form;

    const [sample, setSample] = useState<SampleType>({
        is_sample: "false",
        center: olDefaults.center,
        area: undefined,
    });

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
                    onChange={(center, area) => {
                        setSample({ ...sample, center: center, area: area });
                    }}
                />
            )}
        </div>
    );
};

export default Sample;
