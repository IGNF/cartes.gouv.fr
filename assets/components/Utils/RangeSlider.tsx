import { FC, useState } from "react";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Slider from "@mui/material/Slider";

type RangeSliderProps = {
    min?: number;
    max?: number;
    initialValues?: number[];
    onChange?: (values: number[]) => void;
};

const RangeSlider: FC<RangeSliderProps> = (props) => {
    const { min = 0, max = 20, initialValues = [0, 20], onChange = null } = props;

    const marks: { value: number; label: string }[] = [];
    for (let m = min; m <= max; ++m) {
        marks.push({ value: m, label: m.toString() });
    }

    const minValue = Math.max(min, initialValues[0]),
        maxValue = Math.min(max, initialValues[1]);

    const [values, setValues] = useState([minValue, maxValue]);

    /* Changement d'une des deux valeurs */
    const handleChange = (e, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        const v = activeThumb === 0 ? [Math.min(newValue[0], values[1] - 1), values[1]] : [values[0], Math.max(newValue[1], values[0] + 1)];
        setValues(v);
        onChange?.(v);
    };

    return (
        <MuiDsfrThemeProvider>
            <Slider
                min={min}
                max={max}
                marks={marks}
                getAriaLabel={() => "Minimum distance"}
                value={values}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={(value) => {
                    return `Zoom ${value}`;
                }}
                disableSwap
            />
        </MuiDsfrThemeProvider>
    );
};

export default RangeSlider;
