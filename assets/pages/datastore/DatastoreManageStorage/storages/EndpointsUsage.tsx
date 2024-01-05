import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, Fragment, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import api from "../../../../api";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Datastore, Offering, OfferingTypesEnum } from "../../../../types/app";

const confirmDialogModal = createModal({
    id: "confirm-unpublish-offering-modal",
    isOpenedByDefault: false,
});

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

    const offeringsListQuery = useQuery<Offering[], CartesApiException>({
        queryKey: RQKeys.datastore_offering_list(datastore._id),
        queryFn: ({ signal }) => api.service.getOfferingsDetailed(datastore._id, { signal }),
        staleTime: 60000,
    });

    const queryClient = useQueryClient();

    const [currentOffering, setCurrentOffering] = useState<Offering | undefined>();

    const unpublishOfferingMutation = useMutation({
        mutationFn: (offering: Offering) => {
            switch (offering.type) {
                case OfferingTypesEnum.WFS:
                    return api.service.unpublishWfs(datastore._id, offering._id);
                case OfferingTypesEnum.WMSVECTOR:
                    return api.service.unpublishWmsVector(datastore._id, offering._id);
                case OfferingTypesEnum.WMTSTMS:
                    return api.service.unpublishTms(datastore._id, offering._id);

                default:
                    console.warn(`Dépublication de service ${offering.type} n'a pas encore été implémentée`);
                    return Promise.reject(`Dépublication de service ${offering.type} n'a pas encore été implémentée`);
            }
        },
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_offering_list(datastore._id), (offeringsList: Offering[]) => {
                return offeringsList.filter((offering) => offering._id !== currentOffering?._id);
            });

            setCurrentOffering(undefined);
        },
        onError() {
            setCurrentOffering(undefined);
        },
    });

    return (
        <>
            <p>{t("storage.endpoints.explanation")}</p>

            {offeringsListQuery.isFetching && <LoadingText message={t("storage.endpoints.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {offeringsListQuery.error && (
                <Alert severity="error" title={offeringsListQuery.error.message} as="h2" closable onClose={offeringsListQuery.refetch} />
            )}

            {unpublishOfferingMutation.error && (
                <Alert severity="error" title={unpublishOfferingMutation.error.message} as="h2" closable onClose={offeringsListQuery.refetch} />
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
                                                onClick={() => {
                                                    setCurrentOffering(offering);
                                                    confirmDialogModal.open();
                                                }}
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

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.endpoints.deletion.confirmation", { offeringName: currentOffering?.layer_name, offeringId: currentOffering?._id })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentOffering?._id !== undefined) {
                                    unpublishOfferingMutation.mutate(currentOffering);
                                }
                            },
                            priority: "primary",
                        },
                    ]}
                >
                    <div />
                </confirmDialogModal.Component>,
                document.body
            )}

            {unpublishOfferingMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.endpoints.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default EndpointsUsage;
