import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Slider from "@mui/material/Slider";
import { FC, memo } from "react";

import { getArrayRange } from "../../utils";

type RangeSliderProps = {
    min?: number;
    max?: number;
    values: number[];
    onChange: (values: number[]) => void;
};

const RangeSlider: FC<RangeSliderProps> = (props) => {
    const { min = 0, max = 20, values, onChange } = props;

    return (
        <MuiDsfrThemeProvider>
            <Slider
                min={min}
                max={max}
                marks={getArrayRange(min, max).map((v) => ({
                    value: v,
                    label: v.toString(),
                }))}
                getAriaLabel={() => "Minimum distance"}
                value={values}
                onChange={(_, newValue) => {
                    if (!Array.isArray(newValue)) {
                        return;
                    }
                    onChange(newValue);
                }}
                valueLabelDisplay="auto"
                getAriaValueText={(value) => {
                    return `Zoom ${value}`;
                }}
                disableSwap
            />
        </MuiDsfrThemeProvider>
    );
};

export default memo(RangeSlider);
