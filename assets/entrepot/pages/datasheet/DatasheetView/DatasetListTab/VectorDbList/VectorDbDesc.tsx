import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { UseQueryResult } from "@tanstack/react-query";
import { FC, memo, useMemo } from "react";

import { StoredDataStatusEnum, StoredDataTypeEnum } from "../../../../../../@types/app";
import { OfferingListResponseDto, ProcessingExecutionStoredDataDto } from "../../../../../../@types/entrepot";
import LoadingText from "../../../../../../components/Utils/LoadingText";
import { offeringTypeDisplayName } from "../../../../../../utils";

type VectorDbDescProps = {
    dataUsesQuery: UseQueryResult<
        {
            stored_data_list: ProcessingExecutionStoredDataDto[];
            offerings_list: OfferingListResponseDto[];
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
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v", "fr-ml-10v")}>
            <div className={fr.cx("fr-col")}>
                {dataUsesQuery.isFetching && <LoadingText as="p" withSpinnerIcon={true} />}

                {pyramidVectorList?.length === 0 && dataUsesQuery.data?.offerings_list.length === 0 && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <p className={fr.cx("fr-p-0", "fr-m-0")}>{"La base de données n'a pas encore été utilisée"}</p>
                    </div>
                )}

                {pyramidVectorList && pyramidVectorList.length > 0 && (
                    <div
                        className={fr.cx("fr-grid-row", "fr-mt-2v", "fr-p-2v")}
                        style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}
                    >
                        <div className={fr.cx("fr-col", "fr-col-md-4")}>
                            <span className={fr.cx("ri-stack-line")} /> Pyramides créés ({pyramidVectorList.length})
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <ul className={fr.cx("fr-raw-list")}>
                                {pyramidVectorList.map((pyramidVector, i) => (
                                    <li key={pyramidVector._id} className={fr.cx(i + 1 !== pyramidVectorList.length && "fr-mb-2v")}>
                                        {pyramidVector.name}
                                    </li>
                                ))}
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

export default memo(VectorDbDesc);
