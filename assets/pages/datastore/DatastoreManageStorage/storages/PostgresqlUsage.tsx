import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { FC, memo, useMemo } from "react";

import api from "../../../../api";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Datastore, StoredData } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type PostgresqlUsageProps = {
    datastore: Datastore;
};
const PostgresqlUsage: FC<PostgresqlUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const pgUsage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "POSTGRESQL");
    }, [datastore]);

    const storedDataListQuery = useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastore._id),
        queryFn: ({ signal }) => api.storedData.getList<StoredData[]>(datastore._id, undefined, { signal }),
        staleTime: 60000,
    });

    const vectorDbList = useMemo(() => {
        return storedDataListQuery?.data?.filter((storedData) => storedData.type === "VECTOR-DB") ?? [];
    }, [storedDataListQuery?.data]);

    return (
        <>
            <p>{t("storage.postgresql.explanation")}</p>

            {pgUsage ? (
                <Progress label={`${niceBytes(pgUsage.use.toString())} / ${niceBytes(pgUsage.quota.toString())}`} value={pgUsage.use} max={pgUsage.quota} />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {storedDataListQuery.isFetching && (
                <LoadingText message={t("storage.postgresql.vectordb.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            )}

            {storedDataListQuery.error && (
                <Alert severity="error" title={storedDataListQuery.error.message} as="h2" closable onClose={storedDataListQuery.refetch} />
            )}

            {vectorDbList.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={vectorDbList.map((vectorDb) => [
                        vectorDb.name,
                        t("stored_data.type.title", { type: vectorDb.type }),
                        vectorDb.size ? niceBytes(vectorDb.size?.toString()) : t("data.size.unknown"),
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

export default memo(PostgresqlUsage);
