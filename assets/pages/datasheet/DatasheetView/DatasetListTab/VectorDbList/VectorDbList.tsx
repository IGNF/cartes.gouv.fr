import { fr } from "@codegouvfr/react-dsfr";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";

import { type VectorDb } from "../../../../../types/app";
import VectorDbListItem from "./VectorDbListItem";

type VectorDbListProps = {
    datastoreId: string;
    vectorDbList: VectorDb[] | undefined;
};

const VectorDbList: FC<VectorDbListProps> = ({ datastoreId, vectorDbList }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={fr.cx("fr-icon-database-fill")} />
                    &nbsp;Bases de données vecteur ({vectorDbList?.length})
                </h5>
            </div>

            {vectorDbList?.map((vectorDb) => <VectorDbListItem key={vectorDb._id} datastoreId={datastoreId} vectorDb={vectorDb} />)}
        </>
    );
};

VectorDbList.displayName = symToStr({ VectorDbList });

export default memo(VectorDbList);
