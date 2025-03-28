import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Extent } from "ol/extent";
import { FC } from "react";
import { useTranslation } from "../../../../../i18n";

type DisplayExtentProps = {
    extent: Extent;
    onRemove: () => void;
};

const DisplayExtent: FC<DisplayExtentProps> = ({ extent, onRemove }) => {
    const { t: tCommon } = useTranslation("Common");
    if (!extent.length) {
        return <div />;
    }

    return (
        <div className={fr.cx("fr-grid-row", "fr-my-2v")}>
            <div className={fr.cx("fr-col-5")}>
                <div>
                    <span className={fr.cx("fr-mr-1v")}>
                        <strong>Xmin : </strong>
                        {extent[0].toFixed(2)}
                    </span>
                </div>
                <div>
                    <span className={fr.cx("fr-mr-1v")}>
                        <strong>Ymin : </strong>
                        {extent[1].toFixed(2)}
                    </span>
                </div>
            </div>
            <div className={fr.cx("fr-col-5")}>
                <div>
                    <span className={fr.cx("fr-mr-1v")}>
                        <strong>Xmax : </strong>
                        {extent[2].toFixed(2)}
                    </span>
                </div>
                <div>
                    <span className={fr.cx("fr-mr-1v")}>
                        <strong>Ymax : </strong>
                        {extent[3].toFixed(2)}
                    </span>
                </div>
            </div>
            <div className={fr.cx("fr-col-2")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button title={tCommon("delete")} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={onRemove} />
                </div>
            </div>
        </div>
    );
};

export default DisplayExtent;
