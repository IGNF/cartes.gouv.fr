import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import "./../../sass/components/progress.scss";
 
const Progress = ({label, value}) => {
    const [percent, setPercent] = useState("");

    useEffect(() => {
        let round = Math.floor(value);
        setPercent(`${round}%`);
    }, [value]);
    return (
        <>
            <div className={fr.cx("fr-my-2v")}>
                <div className={fr.cx("fr-input-group")}>
                    { label && (
                        <label className={fr.cx("fr-label")}>{label}</label>
                    )}
                    <div className="progress">
                        <div className="progress-bar" style={{width: percent}}>{percent}</div>    
                    </div>
                </div>
            </div>
        </>
    );
};

Progress.propTypes = {
    label: PropTypes.string,
    value: PropTypes.number
};

export default Progress;