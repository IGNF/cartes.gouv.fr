import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, memo, useMemo } from "react";
import { symToStr } from "tsafe/symToStr";
import { useQuery } from "@tanstack/react-query";

import api from "../../../../api";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { Upload } from "../../../../../@types/app";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { type DatasheetDetailed } from "../../../../../@types/app";
import { routes } from "../../../../../router/router";
import PyramidVectorList from "./PyramidVectorList/PyramidVectorList";
import UnfinishedUploadList from "./UnfinishedUploadList";
import VectorDbList from "./VectorDbList/VectorDbList";
import PyramidRasterList from "./PyramidRasterList/PyramidRasterList";

type DataListTabProps = {
    datastoreId: string;
    datasheet: DatasheetDetailed;
};

const DatasetListTab: FC<DataListTabProps> = ({ datastoreId, datasheet }) => {
    // TODO : il y en aura d'autres types de données aussi (pyramid vector, raster, etc)
    const uploadListQuery = useQuery<Upload[], CartesApiException>({
        queryKey: RQKeys.datastore_upload_list(datastoreId),
        queryFn: ({ signal }) => api.upload.getList(datastoreId, undefined, { signal }),
        staleTime: 60000,
    });
    // liste des uploads/livraisons dont l'intégration en base de données n'a pas réussi ou n'a pas terminé
    const unfinishedUploads = useMemo(() => {
        return uploadListQuery.data?.filter((upload) => {
            if (upload.tags.datasheet_name !== datasheet.name) {
                return false;
            }
            if (upload.tags.integration_progress === undefined) {
                return true;
            }
            const integrationProgress = JSON.parse(upload.tags.integration_progress);
            return ["waiting"].includes(Object.values(integrationProgress)?.[2] as string);
        });
    }, [uploadListQuery.data, datasheet.name]);

    const nbPublications =
        (datasheet.vector_db_list?.length || 0) + (datasheet.pyramid_vector_list?.length || 0) + (datasheet.pyramid_raster_list?.length || 0);

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                <Button iconId="fr-icon-add-line" linkProps={routes.datastore_datasheet_upload({ datastoreId, datasheetName: datasheet.name }).link}>
                    Ajouter un fichier de données
                </Button>
            </div>
            {unfinishedUploads && unfinishedUploads.length > 0 && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle")}>
                    <div className={fr.cx("fr-col")}>
                        <UnfinishedUploadList datastoreId={datastoreId} uploadList={unfinishedUploads} nbPublications={nbPublications} />
                    </div>
                </div>
            )}
            <div
                className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle", unfinishedUploads && unfinishedUploads.length > 0 && "fr-mt-4w")}
            >
                <div className={fr.cx("fr-col")}>
                    <VectorDbList datastoreId={datastoreId} datasheetName={datasheet.name} vectorDbList={datasheet.vector_db_list} />
                </div>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle", "fr-mt-4w")}>
                <div className={fr.cx("fr-col")}>
                    <PyramidVectorList datastoreId={datastoreId} datasheetName={datasheet.name} pyramidList={datasheet.pyramid_vector_list} />
                </div>
            </div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-grid-row--middle", "fr-mt-4w")}>
                <div className={fr.cx("fr-col")}>
                    <PyramidRasterList datastoreId={datastoreId} datasheetName={datasheet.name} pyramidList={datasheet.pyramid_raster_list} />
                </div>
            </div>
        </>
    );
};

DatasetListTab.displayName = symToStr({ DatasetListTab });

export default memo(DatasetListTab);
