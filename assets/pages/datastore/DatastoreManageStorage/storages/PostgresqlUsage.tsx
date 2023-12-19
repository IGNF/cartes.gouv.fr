import { FC, useMemo } from "react";

import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import { Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type PostgresqlUsageProps = {
    datastore?: Datastore;
};
const PostgresqlUsage: FC<PostgresqlUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const pgUsage = useMemo(() => {
        return datastore?.storages.data.find((data) => data.storage.type === "POSTGRESQL");
    }, [datastore]);

    return (
        <>
            <p>{t("storage.postgresql.explanation")}</p>

            {pgUsage && (
                <Progress label={`${niceBytes(pgUsage.use.toString())} / ${niceBytes(pgUsage.quota.toString())}`} value={pgUsage.use} max={pgUsage.quota} />
            )}
        </>
    );
};

export default PostgresqlUsage;
