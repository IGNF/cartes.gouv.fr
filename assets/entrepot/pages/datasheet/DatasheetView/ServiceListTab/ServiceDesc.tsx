import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import type { PyramidRaster, PyramidVector, Service, VectorDb } from "../../../../../@types/app";
import { ConfigurationTypeEnum } from "../../../../../@types/app";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";
import Desc from "../Desc";

type ServiceDescProps = {
    service: Service;
    datastoreId: string;
};
const ServiceDesc: FC<ServiceDescProps> = ({ service, datastoreId }) => {
    /**
     * - si le service est du type ConfigurationTypeEnum.WMTSTMS ou ConfigurationTypeEnum.WMSRASTER, service.configuration.type_infos.used_data?.[0].stored_data est pyramidUsedId. Il faut donc faire une autre requête pour récupérer les infos de vectorDb
     * - si le service est du type ConfigurationTypeEnum.WFS ou ConfigurationTypeEnum.WMSVECTOR, service.configuration.type_infos.used_data?.[0].stored_data est vectorDbUsedId
     * - il y aura peut-être d'autres cas à gérer
     */

    const pyramidUsedId = useMemo(() => {
        if ([ConfigurationTypeEnum.WMTSTMS, ConfigurationTypeEnum.WMSRASTER].includes(service.configuration.type)) {
            return service.configuration.type_infos.used_data?.[0].stored_data;
        }
    }, [service]);

    const pyramidUsedQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, pyramidUsedId ?? "XXXX"),
        queryFn: ({ signal }) => {
            if (pyramidUsedId === undefined) {
                return Promise.reject();
            }
            return api.storedData.get<PyramidVector | PyramidRaster>(datastoreId, pyramidUsedId, { signal });
        },
        staleTime: 600000,
        enabled: !!pyramidUsedId,
    });

    const vectorDbUsedId = useMemo(() => {
        if ([ConfigurationTypeEnum.WMTSTMS, ConfigurationTypeEnum.WMSRASTER].includes(service.configuration.type)) {
            return pyramidUsedQuery.data?.tags.vectordb_id;
        } else if ([ConfigurationTypeEnum.WFS, ConfigurationTypeEnum.WMSVECTOR].includes(service.configuration.type)) {
            return service.configuration.type_infos.used_data?.[0].stored_data;
        }
    }, [service, pyramidUsedQuery.data]);

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
        <>
            <Desc
                isFetching={pyramidUsedQuery.isFetching || vectorDbUsedQuery.isFetching}
                databaseUsed={vectorDbUsedQuery.data?.name}
                pyramidUsed={pyramidUsedQuery.data}
            />
            <pre
                style={{
                    whiteSpace: "pre-wrap",
                }}
            >
                <code>{JSON.stringify(service.configuration.metadata, null, 4)}</code>
            </pre>
        </>
    );
};

export default ServiceDesc;
