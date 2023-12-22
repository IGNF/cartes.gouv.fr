import { fr } from "@codegouvfr/react-dsfr";
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

type FilesystemUsageProps = {
    datastore: Datastore;
};
const FilesystemUsage: FC<FilesystemUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const filesystemUsage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "FILESYSTEM");
    }, [datastore?.storages.data]);

    const storedDataListQuery = useQuery<StoredData[], CartesApiException>({
        queryKey: RQKeys.datastore_stored_data_list(datastore._id),
        queryFn: ({ signal }) => api.storedData.getList<StoredData[]>(datastore._id, undefined, { signal }),
        staleTime: 60000,
    });

    const storedDataListInFilesystem = useMemo(() => {
        return storedDataListQuery?.data?.filter((storedData) => storedData.storage.type === "FILESYSTEM") ?? [];
    }, [storedDataListQuery?.data]);

    return (
        <>
            <p>{t("storage.filesystem.explanation")}</p>

            {filesystemUsage ? (
                <Progress
                    label={`${niceBytes(filesystemUsage.use.toString())} / ${niceBytes(filesystemUsage.quota.toString())}`}
                    value={filesystemUsage.use}
                    max={filesystemUsage.quota}
                />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {storedDataListQuery.isFetching && (
                <LoadingText message={t("storage.filesystem.stored_data_list.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            )}

            {storedDataListInFilesystem.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={storedDataListInFilesystem.map((storedData) => [
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

export default FilesystemUsage;
