import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Table from "@codegouvfr/react-dsfr/Table";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { FC, Fragment, useMemo } from "react";

import { Pyramid, StoredDataTypeEnum, VectorDb } from "../../../../@types/app";
import ExtentMap from "../../../../components/Utils/ExtentMap";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { niceBytes } from "../../../../utils";
import api from "../../../api";
import ReportStatusBadge from "../ReportTab/ReportStatusBadge";
import ReportTab from "../ReportTab/ReportTab";

type PreviewTabProps = {
    datastoreId: string;
    reportQuery: UseQueryResult<ReportTab, CartesApiException>;
};
const PreviewTab: FC<PreviewTabProps> = ({ datastoreId, reportQuery }) => {
    const storedData = useMemo(() => reportQuery.data?.stored_data, [reportQuery.data?.stored_data]);

    const vectorDbQuery = useQuery<VectorDb, CartesApiException>({
        queryKey: RQKeys.datastore_stored_data(datastoreId, (storedData as Pyramid).tags.vectordb_id!),
        queryFn: ({ signal }) => api.storedData.get(datastoreId, (storedData as Pyramid).tags.vectordb_id!, { signal }),
        enabled: !!(storedData as Pyramid).tags.vectordb_id,
        staleTime: 3600000,
    });

    return (
        <>
            <Accordion titleAs="h2" label="Informations générales" defaultExpanded={true}>
                <ul className={fr.cx("fr-raw-list")}>
                    <li>
                        <strong>Nom :</strong> {storedData?.name}
                    </li>
                    <li>
                        <strong>Identifiant technique :</strong> {storedData?._id}
                    </li>
                    <li>
                        <strong>Projection :</strong> {storedData?.srs}
                    </li>
                    <li>
                        <strong>Statut :</strong> {storedData?.status && <ReportStatusBadge status={storedData?.status} />}
                    </li>
                    <li>
                        <strong>Taille :</strong> {storedData?.size && niceBytes(storedData?.size.toString())}
                    </li>
                    <li>
                        <strong>Type :</strong> {storedData?.type}
                    </li>

                    {storedData?.type === StoredDataTypeEnum.ROK4PYRAMIDVECTOR && (
                        <>
                            <li>
                                <strong>Echantillon :</strong> {storedData?.tags?.is_sample === "true" ? "Oui" : "Non"}
                            </li>

                            {storedData.type_infos?.levels && (
                                <li>
                                    <strong>Liste des niveaux :</strong>{" "}
                                    {storedData.type_infos?.levels
                                        .map((l) => parseInt(l))
                                        .sort((a, b) => a - b)
                                        .join(", ")}
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </Accordion>

            {(storedData?.type_infos?.relations ?? vectorDbQuery.data?.type_infos?.relations) && (
                <Accordion titleAs="h2" label="Structure" defaultExpanded={true}>
                    {(storedData?.type_infos?.relations ?? vectorDbQuery.data?.type_infos?.relations ?? [])
                        .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
                        .map((rel) => (
                            <Fragment key={rel.name}>
                                <Table
                                    caption={rel.name}
                                    noScroll
                                    bordered
                                    headers={["Attribut", "Type"]}
                                    data={Object.entries(rel.attributes)
                                        .sort((a, b) => (a[0] === b[0] ? 0 : a[0] < b[0] ? -1 : 1))
                                        .map(([attrName, attrType]) => [`${attrName}${attrName === rel.primary_key?.[0] ? " (clé primaire)" : ""}`, attrType])}
                                />
                            </Fragment>
                        ))}
                </Accordion>
            )}

            {(storedData?.extent ?? vectorDbQuery.data?.extent) && (
                <Accordion titleAs="h2" label="Emprise" defaultExpanded={true}>
                    <ExtentMap extents={storedData?.extent ?? vectorDbQuery.data?.extent} />
                </Accordion>
            )}
        </>
    );
};

export default PreviewTab;
