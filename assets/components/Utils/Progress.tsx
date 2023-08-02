import { fr } from "@codegouvfr/react-dsfr";
import { FC, useEffect, useState } from "react";

import "./../../sass/components/progress.scss";

type ProgressProps = {
    label: string;
    value: number;
    max?: number;
};
const Progress: FC<ProgressProps> = ({ label, value, max = 100 }) => {
    const [percent, setPercent] = useState("");

    useEffect(() => {
        const percentage = Math.floor((value / max) * 100);
        setPercent(`${percentage}%`);
    }, [value, max]);

    return (
        <div className={fr.cx("fr-my-2v")}>
            <div className={fr.cx("fr-input-group")}>
                {label && <label className={fr.cx("fr-label")}>{label}</label>}
                <div className="progress">
                    <div className="progress-bar" style={{ width: percent }}>
                        {percent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
