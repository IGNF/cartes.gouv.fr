import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";

import { type DataDetailed } from "../../../../types/app";
import VectorDbList from "./VectorDbList";

type DataListTabProps = {
    datastoreId: string;
    data?: DataDetailed;
};

const DatasetListTab: FC<DataListTabProps> = ({ datastoreId, data }) => {
    // TODO : il y en aura d'autres types de données aussi (pyramid vector, raster, etc)

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                <Button iconId="fr-icon-add-line">Ajouter un fichier de données</Button>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle")}>
                <div className={fr.cx("fr-col")}>
                    <VectorDbList datastoreId={datastoreId} vectorDbList={data?.vector_db_list} />
                </div>
            </div>
        </>
    );
};

export default DatasetListTab;
