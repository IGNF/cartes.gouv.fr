import { fr } from "@codegouvfr/react-dsfr";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import type { PyramidRaster, PyramidVector, Service, VectorDb } from "../../../../../@types/app";
import { ConfigurationTypeEnum, StoredDataTypeEnum } from "../../../../../@types/app";
import LoadingText from "../../../../../components/Utils/LoadingText";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import api from "../../../../api";

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
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v", "fr-ml-10v")}>
            <div className={fr.cx("fr-col")}>
                {(pyramidUsedQuery.isFetching || vectorDbUsedQuery.isFetching) && <LoadingText as="p" withSpinnerIcon={true} />}

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

                {pyramidUsedQuery.data && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={fr.cx("fr-col", "fr-col-md-4")}>
                            <span className={fr.cx("ri-stack-line")} />{" "}
                            {(() => {
                                switch (pyramidUsedQuery.data.type) {
                                    case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
                                        return "Pyramide de tuiles vectorielles utilisée";
                                    case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
                                        return "Pyramide de tuiles raster utilisée";
                                }
                            })()}
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                <li>{pyramidUsedQuery.data.name}</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceDesc;
