import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";

import { FC, useMemo } from "react";
import api from "../../../../api";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Datastore, StoredData } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type S3UsageProps = {
    datastore: Datastore;
};
const S3Usage: FC<S3UsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const s3Usage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "S3");
    }, [datastore]);

    const storedDataListQuery = useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastore._id),
        queryFn: ({ signal }) => api.storedData.getList<StoredData[]>(datastore._id, undefined, { signal }),
        staleTime: 60000,
    });

    const storedDataListInS3 = useMemo(() => {
        return storedDataListQuery?.data?.filter((storedData) => storedData.storage.type === "S3") ?? [];
    }, [storedDataListQuery?.data]);

    return (
        <>
            <p>{t("storage.s3.explanation")}</p>

            {s3Usage ? (
                <Progress label={`${niceBytes(s3Usage.use.toString())} / ${niceBytes(s3Usage.quota.toString())}`} value={s3Usage.use} max={s3Usage.quota} />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {storedDataListQuery.isFetching && (
                <LoadingText message={t("storage.s3.stored_data_list.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            )}

            {storedDataListQuery.error && (
                <Alert severity="error" title={storedDataListQuery.error.message} as="h2" closable onClose={storedDataListQuery.refetch} />
            )}

            {storedDataListInS3.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={storedDataListInS3.map((storedData) => [
                        storedData.name,
                        t("stored_data.type.title", { type: storedData.type }),
                        storedData.size ? niceBytes(storedData.size?.toString()) : t("data.size.unknown"),
                        <Button
                            key={storedData._id}
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

export default S3Usage;
