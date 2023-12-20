import { FC, useMemo } from "react";

import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import { Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type UploadUsageProps = {
    datastore: Datastore;
};
const UploadUsage: FC<UploadUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const uploadUsage = useMemo(() => {
        return datastore?.storages.upload;
    }, [datastore]);

    return (
        <>
            <p>{t("storage.upload.explanation")}</p>

            {uploadUsage ? (
                <Progress
                    label={`${niceBytes(uploadUsage.use.toString())} / ${niceBytes(uploadUsage.quota.toString())}`}
                    value={uploadUsage.use}
                    max={uploadUsage.quota}
                />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}
        </>
    );
};

export default UploadUsage;
