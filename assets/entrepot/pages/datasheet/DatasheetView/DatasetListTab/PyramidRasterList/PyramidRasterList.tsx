import { fr } from "@codegouvfr/react-dsfr";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";

import { PyramidRaster } from "../../../../../../@types/app";
import PyramidRasterListItem from "./PyramidRasterListItem";

type PyramidRasterListProps = {
    datasheetName: string;
    datastoreId: string;
    pyramidList: PyramidRaster[] | undefined;
};

const PyramidRasterList: FC<PyramidRasterListProps> = ({ datasheetName, datastoreId, pyramidList }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={"ri-stack-line"} />
                    &nbsp;Pyramides de tuiles raster ({pyramidList?.length})
                </h5>
            </div>
            {pyramidList?.map((pyramid) => (
                <PyramidRasterListItem key={pyramid._id} datasheetName={datasheetName} datastoreId={datastoreId} pyramid={pyramid} />
            ))}
        </>
    );
};

PyramidRasterList.displayName = symToStr({ PyramidRasterList });

export default memo(PyramidRasterList);
