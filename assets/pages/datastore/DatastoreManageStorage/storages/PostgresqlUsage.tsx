import Button from "@codegouvfr/react-dsfr/Button";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import api from "../../../../api";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Datastore, VectorDb } from "../../../../types/app";
import { niceBytes } from "../../../../utils";
import { fr } from "@codegouvfr/react-dsfr";

type PostgresqlUsageProps = {
    datastore: Datastore;
};
const PostgresqlUsage: FC<PostgresqlUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const pgUsage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "POSTGRESQL");
    }, [datastore]);

    const vectorDbListQuery = useQuery<VectorDb[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list_with_type(datastore._id, "VECTOR-DB"),
        queryFn: ({ signal }) => api.storedData.getList<VectorDb[]>(datastore._id, "VECTOR-DB", { signal }),
        staleTime: 60000,
    });

    return (
        <>
            <p>{t("storage.postgresql.explanation")}</p>

            {pgUsage ? (
                <Progress label={`${niceBytes(pgUsage.use.toString())} / ${niceBytes(pgUsage.quota.toString())}`} value={pgUsage.use} max={pgUsage.quota} />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {vectorDbListQuery.isFetching && (
                <LoadingText message={t("storage.postgresql.vectordb.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            )}

            {vectorDbListQuery.data && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={vectorDbListQuery.data.map((vectorDb) => [
                        vectorDb.name,
                        vectorDb.type,
                        vectorDb.size ? niceBytes(vectorDb.size?.toString()) : t("stored_data.size.unknown"),
                        <Button
                            key={vectorDb._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => console.warn("Fonctionnalité non implémentée")}
                        >
                            {tCommon("delete")}
                        </Button>,
                    ])}
                />
            )}
        </>
    );
};

export default PostgresqlUsage;
