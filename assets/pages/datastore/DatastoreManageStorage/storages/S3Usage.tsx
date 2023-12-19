import { FC, useMemo } from "react";

import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import { Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type S3UsageProps = {
    datastore?: Datastore;
};
const S3Usage: FC<S3UsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const s3Usage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "S3");
    }, [datastore]);

    return (
        <>
            <p>{t("storage.s3.explanation")}</p>

            {s3Usage && (
                <Progress label={`${niceBytes(s3Usage.use.toString())} / ${niceBytes(s3Usage.quota.toString())}`} value={s3Usage.use} max={s3Usage.quota} />
            )}
        </>
    );
};

export default S3Usage;
