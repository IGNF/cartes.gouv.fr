import { FC, useMemo } from "react";

import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import { Datastore } from "../../../../types/app";

type EndpointsUsageProps = {
    datastore: Datastore;
};
const EndpointsUsage: FC<EndpointsUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const endpointsUsage = useMemo(() => {
        return datastore?.endpoints;
    }, [datastore]);

    return (
        <>
            <p>{t("storage.endpoints.explanation")}</p>

            {endpointsUsage ? (
                endpointsUsage.map((endpoint) => (
                    <Progress
                        key={endpoint.endpoint._id}
                        label={`${endpoint.endpoint.name} - ${endpoint.use.toString()} / ${endpoint.quota.toString()}`}
                        value={endpoint.use}
                        max={endpoint.quota}
                    />
                ))
            ) : (
                <p>{t("storage.not_found")}</p>
            )}
        </>
    );
};

export default EndpointsUsage;
