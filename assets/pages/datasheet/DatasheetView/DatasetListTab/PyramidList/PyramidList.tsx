import { fr } from "@codegouvfr/react-dsfr";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";

import { Pyramid } from "../../../../../types/app";
import PyramidListItem from "./PyramidListItem";

type PyramidListProps = {
    datastoreId: string;
    pyramidList: Pyramid[] | undefined;
};

const PyramidList: FC<PyramidListProps> = ({ datastoreId, pyramidList }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={"ri-stack-line"} />
                    &nbsp;Pyramides de tuiles vectorielles ({pyramidList?.length})
                </h5>
            </div>
            {pyramidList?.map((pyramid) => <PyramidListItem key={pyramid._id} datastoreId={datastoreId} pyramid={pyramid} />)}
        </>
    );
};

PyramidList.displayName = symToStr({ PyramidList });

export default memo(PyramidList);
