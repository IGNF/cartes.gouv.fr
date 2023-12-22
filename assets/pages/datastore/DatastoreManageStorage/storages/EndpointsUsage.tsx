import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { FC, Fragment, useMemo } from "react";

import api from "../../../../api";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Datastore } from "../../../../types/app";
import { OfferingDetailResponseDto } from "../../../../types/entrepot";

type EndpointsUsageProps = {
    datastore: Datastore;
};
const EndpointsUsage: FC<EndpointsUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const endpointsUsage = useMemo(() => {
        return datastore?.endpoints.sort((a, b) => {
            if (a.endpoint.technical_name.toLowerCase() < b.endpoint.technical_name.toLowerCase()) return -1;
            if (a.endpoint.technical_name.toLowerCase() > b.endpoint.technical_name.toLowerCase()) return 1;
            return 0;
        });
    }, [datastore]);

    const offeringsListQuery = useQuery<OfferingDetailResponseDto[], CartesApiException>({
        queryKey: RQKeys.datastore_offering_list(datastore._id),
        queryFn: ({ signal }) => api.service.getOfferingsDetailed(datastore._id, { signal }),
        staleTime: 60000,
    });

    return (
        <>
            <p>{t("storage.endpoints.explanation")}</p>

            {offeringsListQuery.isFetching && <LoadingText message={t("storage.endpoints.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {offeringsListQuery.error && (
                <Alert severity="error" title={offeringsListQuery.error.message} as="h2" closable onClose={offeringsListQuery.refetch} />
            )}

            {endpointsUsage ? (
                endpointsUsage.map(
                    (endpoint) =>
                        offeringsListQuery.data && (
                            <Fragment key={endpoint.endpoint._id}>
                                <h2>{endpoint.endpoint.name}</h2>
                                <Progress label={`${endpoint.use.toString()} / ${endpoint.quota.toString()}`} value={endpoint.use} max={endpoint.quota} />
                                <Table
                                    caption={`${endpoint.endpoint.name} - ${endpoint.use.toString()} / ${endpoint.quota.toString()}`}
                                    noCaption
                                    noScroll
                                    bordered
                                    className={fr.cx("fr-mt-4v")}
                                    data={offeringsListQuery.data
                                        .filter((offering) => offering.endpoint._id === endpoint.endpoint._id)
                                        .map((offering) => [
                                            offering.layer_name,
                                            offering.type,
                                            <Button
                                                key={offering._id}
                                                priority="tertiary no outline"
                                                iconId="fr-icon-delete-line"
                                                onClick={() => console.warn("Fonctionnalité non implémentée")}
                                            >
                                                {tCommon("unpublish")}
                                            </Button>,
                                        ])}
                                />
                            </Fragment>
                        )
                )
            ) : (
                <p>{t("storage.not_found")}</p>
            )}
        </>
    );
};

export default EndpointsUsage;
