import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import VectorDbList from "./VectorDbList";

type DataListTabProps = {
    datastoreId: string;
    dataName: string;
};

const DatasetListTab: FC<DataListTabProps> = ({ datastoreId, dataName }) => {
    // TODO : données fictives
    const vectorDbList = [
        {
            _id: "e82d5499-c0c5-4930-a703-f11d9cc7cd7e",
            name: "Contraintes naviforest",
            date: "17 mars 2023 - 17h27",
        },
    ];

    // TODO : dataName sera utilisé pour filtrer les stored_data liés à cette fiche de donnée, mais pour le moment l'API ne gère pas les filtres

    // TODO : il y en aura d'autres types de données aussi (pyramid vector, raster, etc)

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle")}>
            <div className={fr.cx("fr-col")}>
                <VectorDbList datastoreId={datastoreId} vectorDbList={vectorDbList} />
            </div>
        </div>
    );
};

export default DatasetListTab;
