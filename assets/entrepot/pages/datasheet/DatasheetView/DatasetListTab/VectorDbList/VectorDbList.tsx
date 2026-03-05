import { fr } from "@codegouvfr/react-dsfr";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";

import type { DatasheetStoredDataItem, VectorDb } from "../../../../../../@types/app";
import VectorDbListItem from "./VectorDbListItem";

type VectorDbListProps = {
    datasheetName: string;
    datastoreId: string;
    vectorDbList: DatasheetStoredDataItem<VectorDb>[] | undefined;
};

const VectorDbList: FC<VectorDbListProps> = ({ datasheetName, datastoreId, vectorDbList }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={fr.cx("fr-icon-database-fill")} />
                    &nbsp;Bases de données vecteur ({vectorDbList?.length})
                </h5>
            </div>

            {vectorDbList?.map((vectorDb) => (
                <VectorDbListItem key={vectorDb._id} datasheetName={datasheetName} datastoreId={datastoreId} vectorDb={vectorDb} />
            ))}
        </>
    );
};

VectorDbList.displayName = symToStr({ VectorDbList });

export default memo(VectorDbList);
