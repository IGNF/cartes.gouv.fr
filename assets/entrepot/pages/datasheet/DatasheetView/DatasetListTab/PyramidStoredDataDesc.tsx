import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { FC, memo, useMemo } from "react";

import type { PyramidRaster, PyramidVector, VectorDb } from "../../../../../@types/app";
import type { OfferingListResponseDto, ProcessingExecutionStoredDataDto } from "../../../../../@types/entrepot";
import LoadingText from "../../../../../components/Utils/LoadingText";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { offeringTypeDisplayName } from "../../../../../utils";
import api from "../../../../api";

type PyramidStoredDataDescProps = {
    datastoreId: string;
    pyramid: PyramidVector | PyramidRaster;
    dataUsesQuery: UseQueryResult<
        {
            stored_data_list: ProcessingExecutionStoredDataDto[];
            offerings_list: OfferingListResponseDto[];
        },
        Error
    >;
};

const PyramidStoredDataDesc: FC<PyramidStoredDataDescProps> = ({ datastoreId, pyramid, dataUsesQuery }) => {
    const vectorDbUsedId = useMemo(() => pyramid.tags.vectordb_id, [pyramid.tags.vectordb_id]);

    const vectorDbUsedQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbUsedId ?? "XXXX"),
        queryFn: ({ signal }) => {
            if (vectorDbUsedId === undefined) {
                return Promise.reject();
            }
            return api.storedData.get<VectorDb>(datastoreId, vectorDbUsedId, { signal });
        },
        staleTime: 600000,
        enabled: !!vectorDbUsedId,
    });

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v", "fr-ml-10v")}>
            <div className={fr.cx("fr-col")}>
                {(dataUsesQuery.isFetching || vectorDbUsedQuery.isFetching) && <LoadingText as="p" withSpinnerIcon={true} />}

                {vectorDbUsedQuery.data && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={fr.cx("fr-col", "fr-col-md-4")}>
                            <span className={fr.cx("fr-icon-database-fill")} /> Base de données utilisée
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                <li>{vectorDbUsedQuery.data.name}</li>
                            </ul>
                        </div>
                    </div>
                )}

                {dataUsesQuery.data?.offerings_list && dataUsesQuery.data?.offerings_list?.length > 0 && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={fr.cx("fr-col", "fr-col-md-4")}>
                            <span className={fr.cx("ri-image-line")} /> Services publiés ({dataUsesQuery.data?.offerings_list?.length})
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                {dataUsesQuery.data?.offerings_list.map((offering, i) => (
                                    <li key={offering._id} className={fr.cx(i + 1 !== dataUsesQuery.data?.offerings_list.length && "fr-mb-2v")}>
                                        {offering.layer_name} <Badge>{offeringTypeDisplayName(offering.type)}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(PyramidStoredDataDesc);
