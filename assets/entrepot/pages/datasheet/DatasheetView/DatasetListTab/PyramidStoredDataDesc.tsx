import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { FC, memo, useMemo } from "react";

import type { PyramidRaster, PyramidVector, VectorDb } from "../../../../../@types/app";
import type { OfferingListResponseDto, ProcessingExecutionStoredDataDto } from "../../../../../@types/entrepot";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";
import Desc from "../Desc";

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

    return <Desc isFetching={dataUsesQuery.isFetching} databaseUsed={vectorDbUsedQuery.data?.name} publishedServices={dataUsesQuery.data?.offerings_list} />;
};

export default memo(PyramidStoredDataDesc);
