import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Slider from "@mui/material/Slider";

const RangeSlider = (props) => {
    const { min = 0, max = 20, initialValues = [0, 20], onChange = null } = props;

    const minDistance = 1;
    const marks = [...new Array(21)].map((item, idx) => ({ value: idx, label: idx.toString() }));
    const valueText = (value) => {
        return `Zoom ${value}`;
    };

    const [values, setValues] = useState(initialValues);
    useEffect(() => {
        onChange?.(values);
    }, [values]);

    const handleChange = (e, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        if (activeThumb === 0) {
            setValues([Math.min(newValue[0], values[1] - minDistance), values[1]]);
        } else {
            setValues([values[0], Math.max(newValue[1], values[0] + minDistance)]);
        }
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
                getAriaValueText={valueText}
                disableSwap
            />
        </MuiDsfrThemeProvider>
    );
};

RangeSlider.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    initialValues: PropTypes.arrayOf(PropTypes.number),
    center: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func,
};

export default RangeSlider;
