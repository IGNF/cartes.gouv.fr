import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, useMemo } from "react";
import { symToStr } from "tsafe/symToStr";

import { type DatasheetDetailed } from "../../../../types/app";
import PyramidList from "./PyramidList";
import UnfinishedUploadList from "./UnfinishedUploadList";
import VectorDbList from "./VectorDbList";

type DataListTabProps = {
    datastoreId: string;
    datasheet?: DatasheetDetailed;
};

const DatasetListTab: FC<DataListTabProps> = ({ datastoreId, datasheet }) => {
    // TODO : il y en aura d'autres types de données aussi (pyramid vector, raster, etc)

    // liste des uploads/livraisons dont l'intégration en base de données n'a pas réussi ou n'a pas terminé
    const unfinishedUploads = useMemo(() => {
        return datasheet?.upload_list?.filter((upload) => upload.tags.integration_current_step !== "3");
    }, [datasheet?.upload_list]);

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                <Button iconId="fr-icon-add-line">Ajouter un fichier de données</Button>
            </div>
            {unfinishedUploads && unfinishedUploads.length > 0 && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col")}>
                        <UnfinishedUploadList datastoreId={datastoreId} uploadList={unfinishedUploads} title="Livraisons non terminées" />
                    </div>
                </div>
            )}
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle", "fr-mt-4w")}>
                <div className={fr.cx("fr-col")}>
                    <VectorDbList datastoreId={datastoreId} vectorDbList={datasheet?.vector_db_list} />
                </div>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle", "fr-mt-4w")}>
                <div className={fr.cx("fr-col")}>
                    <PyramidList datastoreId={datastoreId} pyramidList={datasheet?.pyramid_list} />
                </div>
            </div>
        </>
    );
};

DatasetListTab.displayName = symToStr({ DatasetListTab });

export default DatasetListTab;
