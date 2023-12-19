import { FC, useMemo } from "react";

import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import { Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type FilesystemUsageProps = {
    datastore?: Datastore;
};
const FilesystemUsage: FC<FilesystemUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const filesystemUsage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "FILESYSTEM");
    }, [datastore?.storages.data]);

    return (
        <>
            <p>{t("storage.filesystem.explanation")}</p>

            {filesystemUsage && (
                <Progress
                    label={`${niceBytes(filesystemUsage.use.toString())} / ${niceBytes(filesystemUsage.quota.toString())}`}
                    value={filesystemUsage.use}
                    max={filesystemUsage.quota}
                />
            )}
        </>
    );
};

export default FilesystemUsage;
