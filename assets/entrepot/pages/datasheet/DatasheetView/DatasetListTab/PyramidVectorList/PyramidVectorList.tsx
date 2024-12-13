import { fr } from "@codegouvfr/react-dsfr";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";

import { PyramidVector } from "../../../../../../@types/app";
import PyramidVectorListItem from "./PyramidVectorListItem";

type PyramidVectorListProps = {
    datasheetName: string;
    datastoreId: string;
    pyramidList: PyramidVector[] | undefined;
};

const PyramidVectorList: FC<PyramidVectorListProps> = ({ datasheetName, datastoreId, pyramidList }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={"ri-stack-line"} />
                    &nbsp;Pyramides de tuiles vectorielles ({pyramidList?.length})
                </h5>
            </div>
            {pyramidList?.map((pyramid) => (
                <PyramidVectorListItem key={pyramid._id} datasheetName={datasheetName} datastoreId={datastoreId} pyramid={pyramid} />
            ))}
        </>
    );
};

PyramidVectorList.displayName = symToStr({ PyramidVectorList });

export default memo(PyramidVectorList);
