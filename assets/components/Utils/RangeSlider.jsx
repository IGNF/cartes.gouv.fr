import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import "./../../sass/components/range-slider.scss";


const RangeSlider = ({ 
    min, 
    max, 
    initialMinValue, 
    initialMaxValue,
    minFixed=false,
    maxFixed=false,
    onChange=null}) => {
    const [minValue, setMinValue] = useState(initialMinValue?? min);
    const [maxValue, setMaxValue] = useState(initialMaxValue?? max);
    
    const [marks, setMarks] = useState([]);
    const [position, setPosition] = useState({
        min: ((minValue - min) / (max - min)) * 100,
        max: ((maxValue - min) / (max - min)) * 100
    });

    useEffect(() => {
        let minPos = ((minValue - min) / (max - min)) * 100;
        setPosition({ min: minPos, max: position.max });
    }, [minValue]);

    useEffect(() => {
        let maxPos = ((maxValue - min) / (max - min)) * 100;
        setPosition({ min: position.min, max: maxPos });
    }, [maxValue]);

    useEffect(() => {
        const vals = max - min;
        for (let i = 0; i <= vals; i++) {
            let mark = min + i;
            setMarks(marks => [...marks, { text: `${mark}`, left: i / vals * 100 + "%"}]);
        }
    }, []);
    
    const handleMinChange = e => {
        e.preventDefault();
        
        const m = Math.min(e.target.value, maxValue - 1);
        setMinValue(m);
        if (onChange) {
            onChange({ minValue: m, maxValue: maxValue });
        }
    };
  
    const handleMaxChange = e => {
        e.preventDefault();

        const m = Math.max(e.target.value, minValue + 1);
        setMaxValue(m);
        if (onChange) {
            onChange({ minValue: minValue, maxValue: m });
        }
    };
  
    return (
        <div className="wrapper">
            <div className="input-wrapper">
                <input
                    className="input"
                    type="range"
                    value={minValue}
                    min={min}
                    max={max}
                    onChange={handleMinChange}
                    disabled={minFixed}
                />
                <input
                    className="input"
                    type="range"
                    value={maxValue}
                    min={min}
                    max={max}
                    onChange={handleMaxChange}
                    disabled={maxFixed}
                />
            </div>
            <div className="control-wrapper">
                <div className="control" style={{ left: `${position.min}%` }} />
                <div className="rail">
                    <div className="inner-rail" style={{ left: `${position.min}%`, right: `${100 - position.max}%` }} />
                </div>
                <div className="control" style={{ left: `${position.max}%` }} />
                <div>
                    {marks.map((mark, index) => {
                        return (<label key={index} className="ui-zoom-label" style={{left: mark.left}}>{mark.text}</label>);
                    })}
                </div>
            </div>
        </div>);
};

RangeSlider.propTypes = {
    min: PropTypes.number.isRequired, 
    max: PropTypes.number.isRequired, 
    initialMinValue: PropTypes.number, 
    initialMaxValue: PropTypes.number,
    minFixed: PropTypes.bool,
    maxFixed: PropTypes.bool,
    onChange: PropTypes.func
};

export default RangeSlider;