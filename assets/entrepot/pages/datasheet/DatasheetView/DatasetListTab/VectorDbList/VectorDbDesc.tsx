import { UseQueryResult } from "@tanstack/react-query";
import { FC, memo, useMemo } from "react";

import { Offering, StoredDataStatusEnum, StoredDataTypeEnum } from "../../../../../../@types/app";
import { ProcessingExecutionStoredDataDto } from "../../../../../../@types/entrepot";
import Desc from "../../Desc";

type VectorDbDescProps = {
    dataUsesQuery: UseQueryResult<
        {
            stored_data_list: ProcessingExecutionStoredDataDto[];
            offerings_list: Offering[];
        },
        Error
    >;
};

const VectorDbDesc: FC<VectorDbDescProps> = ({ dataUsesQuery }) => {
    const pyramidVectorList = useMemo(
        () =>
            dataUsesQuery.data?.stored_data_list.filter(
                (sd) => sd.type === StoredDataTypeEnum.ROK4PYRAMIDVECTOR.valueOf() && sd.status !== StoredDataStatusEnum.DELETED.valueOf()
            ),
        [dataUsesQuery.data?.stored_data_list]
    );

    return (
        <Desc
            isFetching={dataUsesQuery.isFetching}
            databaseNotUsed={pyramidVectorList?.length === 0 && dataUsesQuery.data?.offerings_list.length === 0}
            publishedServices={dataUsesQuery.data?.offerings_list}
            pyramidCreated={pyramidVectorList}
        />
    );
};

export default memo(VectorDbDesc);
