import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Datastore, EndpointTypeEnum, Metadata, Offering, OfferingTypeEnum } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { routes } from "../../../../../router/router";
import api from "../../../../api";
import DataCard from "../DataCard";

const confirmUnpublishOfferingModal = createModal({
    id: "confirm-unpublish-offering-modal",
    isOpenedByDefault: false,
});

const confirmDeleteMetadataModal = createModal({
    id: "confirm-delete-metadata-modal",
    isOpenedByDefault: false,
});

type EndpointsUsageProps = {
    datastore: Datastore;
};
const EndpointsUsage: FC<EndpointsUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const endpointsUsage = useMemo(() => {
        return (
            datastore?.endpoints?.sort((a, b) => {
                if (a.endpoint.technical_name.toLowerCase() < b.endpoint.technical_name.toLowerCase()) return -1;
                if (a.endpoint.technical_name.toLowerCase() > b.endpoint.technical_name.toLowerCase()) return 1;
                return 0;
            }) ?? []
        );
    }, [datastore]);

    const metadataEndpoints = useMemo(() => endpointsUsage.filter((endpoint) => endpoint.endpoint.type === EndpointTypeEnum.METADATA), [endpointsUsage]);

    const offeringsListQuery = useQuery<Offering[], CartesApiException>({
        queryKey: RQKeys.datastore_offering_list(datastore._id),
        queryFn: ({ signal }) => api.service.getOfferingsDetailed(datastore._id, { signal }),
        staleTime: 60000,
    });

    const metadataListQuery = useQuery({
        queryKey: RQKeys.datastore_metadata_list(datastore._id),
        queryFn: ({ signal }) => api.metadata.getList(datastore._id, {}, { signal }),
        staleTime: 60000,
    });

    const queryClient = useQueryClient();

    const [currentOffering, setCurrentOffering] = useState<Offering | undefined>();
    const [currentMetadata, setCurrentMetadata] = useState<Metadata>();

    const unpublishOfferingMutation = useMutation({
        mutationFn: (offering: Offering) => {
            if (![OfferingTypeEnum.WFS, OfferingTypeEnum.WMSVECTOR, OfferingTypeEnum.WMTSTMS].includes(offering.type)) {
                console.warn(`Dépublication de service ${offering.type} n'a pas encore été implémentée`);
                return Promise.reject(`Dépublication de service ${offering.type} n'a pas encore été implémentée`);
            }

            return api.service.unpublishService(datastore._id, offering._id);
        },
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_offering_list(datastore._id), (offeringsList: Offering[]) => {
                return offeringsList.filter((offering) => offering._id !== currentOffering?._id);
            });

            queryClient.refetchQueries({ queryKey: RQKeys.datastore(datastore._id) });

            setCurrentOffering(undefined);
        },
        onError() {
            setCurrentOffering(undefined);
        },
    });

    const deleteMetadataMutation = useMutation({
        mutationFn: (metadata: Metadata) => api.metadata.remove(datastore._id, metadata._id),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_metadata_list(datastore._id), (metadataList: Metadata[]) => {
                return metadataList.filter((metadata) => metadata._id !== currentMetadata?._id);
            });

            queryClient.refetchQueries({ queryKey: RQKeys.datastore_metadata_list(datastore._id) });

            setCurrentMetadata(undefined);
        },
        onError() {
            setCurrentMetadata(undefined);
        },
    });

    return (
        <>
            <p className={fr.cx("fr-text--xs")}>{t("storage.endpoints.explanation")}</p>

            {(offeringsListQuery.isFetching || metadataListQuery.isFetching) && (
                <LoadingText message={t("storage.endpoints.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />
            )}

            {offeringsListQuery.error && (
                <Alert severity="error" title={offeringsListQuery.error.message} as="h2" closable onClose={offeringsListQuery.refetch} />
            )}

            {metadataListQuery.error && <Alert severity="error" title={metadataListQuery.error.message} as="h2" closable onClose={metadataListQuery.refetch} />}

            {unpublishOfferingMutation.error && (
                <Alert severity="error" title={unpublishOfferingMutation.error.message} as="h2" closable onClose={offeringsListQuery.refetch} />
            )}

            {endpointsUsage &&
                endpointsUsage
                    .filter((endpoint) => endpoint.endpoint.type !== EndpointTypeEnum.METADATA)
                    .map(
                        (endpoint) =>
                            offeringsListQuery.data && (
                                <section key={endpoint.endpoint._id}>
                                    <h2>{endpoint.endpoint.name}</h2>

                                    <div className={fr.cx("fr-grid-row")}>
                                        <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                                            <Progress
                                                label={
                                                    <>
                                                        {endpoint.use.toString()} / <strong>{endpoint.quota.toString()}</strong>
                                                    </>
                                                }
                                                value={endpoint.use}
                                                max={endpoint.quota}
                                            />
                                        </div>
                                    </div>

                                    {offeringsListQuery.data
                                        .filter((offering) => offering?.endpoint?._id === endpoint.endpoint._id)
                                        .map((offering) => (
                                            <DataCard
                                                key={offering._id}
                                                name={offering.layer_name}
                                                type={offering.type}
                                                buttons={[
                                                    {
                                                        iconId: "fr-icon-delete-line",
                                                        priority: "tertiary no outline",
                                                        onClick: () => {
                                                            setCurrentOffering(offering);
                                                            confirmUnpublishOfferingModal.open();
                                                        },
                                                        children: tCommon("unpublish"),
                                                        nativeButtonProps: confirmUnpublishOfferingModal.buttonProps,
                                                    },
                                                ]}
                                            />
                                        ))}
                                </section>
                            )
                    )}

            {metadataListQuery.data &&
                metadataEndpoints.map((endpoint) => (
                    <section key={endpoint.endpoint._id}>
                        <h2>{endpoint.endpoint.name}</h2>
                        <div className={fr.cx("fr-grid-row")}>
                            <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                                <Progress
                                    label={
                                        <>
                                            {endpoint.use.toString()} / <strong>{endpoint.quota.toString()}</strong>
                                        </>
                                    }
                                    value={endpoint.use}
                                    max={endpoint.quota}
                                />
                            </div>
                        </div>

                        {metadataListQuery.data
                            .filter((metadata) => metadata.endpoints?.[0]?._id === endpoint.endpoint._id)
                            .map((metadata) => (
                                <DataCard
                                    key={metadata._id}
                                    name={metadata.file_identifier}
                                    type={metadata.type}
                                    buttons={[
                                        {
                                            iconId: "fr-icon-delete-line",
                                            priority: "tertiary no outline",
                                            onClick: () => {
                                                setCurrentMetadata(metadata);
                                                confirmDeleteMetadataModal.open();
                                            },
                                            children: tCommon("delete"),
                                        },
                                        metadata.tags.datasheet_name !== undefined && {
                                            iconId: "fr-icon-arrow-right-s-line",
                                            priority: "tertiary no outline",
                                            linkProps: routes.datastore_datasheet_view({
                                                datastoreId: datastore._id,
                                                datasheetName: metadata.tags.datasheet_name,
                                            }).link,
                                            children: tCommon("see_2"),
                                        },
                                    ]}
                                />
                            ))}
                    </section>
                ))}

            {createPortal(
                <confirmUnpublishOfferingModal.Component
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
                </confirmUnpublishOfferingModal.Component>,
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

            {createPortal(
                <confirmDeleteMetadataModal.Component
                    title={t("storage.endpoints.metadata.deletion.confirmation", {
                        metadataIdentifier: currentMetadata?.file_identifier,
                        metadataId: currentMetadata?._id,
                    })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentMetadata?._id !== undefined) {
                                    deleteMetadataMutation.mutate(currentMetadata);
                                }
                            },
                            priority: "primary",
                        },
                    ]}
                >
                    <div />
                </confirmDeleteMetadataModal.Component>,
                document.body
            )}

            {deleteMetadataMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.endpoints.metadata.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default EndpointsUsage;
