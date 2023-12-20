import { FC, useMemo } from "react";

import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import { Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";

type AnnexeUsageProps = {
    datastore: Datastore;
};
const AnnexeUsage: FC<AnnexeUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const annexeUsage = useMemo(() => {
        return datastore?.storages.annexe;
    }, [datastore]);

    return (
        <>
            <p>{t("storage.annexe.explanation")}</p>

            {annexeUsage ? (
                <Progress
                    label={`${niceBytes(annexeUsage.use.toString())} / ${niceBytes(annexeUsage.quota.toString())}`}
                    value={annexeUsage.use}
                    max={annexeUsage.quota}
                />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}
        </>
    );
};

export default AnnexeUsage;
