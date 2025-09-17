import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, Fragment, ReactNode, memo, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import useDataUsesQuery from "@/hooks/queries/useDataUsesQuery";
import { DatastoreEndpoint, StoredDataStatusEnum, VectorDb } from "../../../../../../@types/app";
import { EndpointDetailResponseDtoTypeEnum } from "../../../../../../@types/entrepot";
import StoredDataStatusBadge from "../../../../../../components/Utils/Badges/StoredDataStatusBadge";
import useToggle from "../../../../../../hooks/useToggle";
import { getTranslation, useTranslation } from "../../../../../../i18n/i18n";
import { ComponentKey } from "../../../../../../i18n/types";
import RQKeys from "../../../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../../../router/router";
import api from "../../../../../api";
import ListItem from "../../ListItem";
import StoredDataDeleteConfirmDialog from "../StoredDataDeleteConfirmDialog";
import VectorDbDesc from "./VectorDbDesc";

type ServiceTypes = "tms" | "wfs" | "wms-vector" | "pre-paquet";

type VectorDbListItemProps = {
    datasheetName: string;
    datastoreId: string;
    vectorDb: VectorDb;
};

const { t: tCommon } = getTranslation("Common");

type QuotaType = {
    name: string;
    quota: number;
    use: number;
    available: number;
};

const getHintText = (
    quotas: Record<string, QuotaType[]>,
    type: EndpointDetailResponseDtoTypeEnum,
    t: TranslationFunction<"VectorDbList", ComponentKey>
): JSX.Element => {
    const parts: {
        reactNode: ReactNode;
        id: string;
    }[] = [];

    switch (type) {
        case EndpointDetailResponseDtoTypeEnum.WFS:
            parts.push({
                reactNode: <li>{t("wfs_hint_text")}</li>,
                id: "endpoint-hint-text",
            });
            break;
        case EndpointDetailResponseDtoTypeEnum.WMTSTMS:
            parts.push({
                reactNode: <li>{t("tms_hint_text")}</li>,
                id: "endpoint-hint-text",
            });
            break;
        case EndpointDetailResponseDtoTypeEnum.WMSVECTOR:
            parts.push({
                reactNode: <li>{t("wmsv_hint_text")}</li>,
                id: "endpoint-hint-text",
            });
            break;
        default:
            break;
    }

    if (type in quotas) {
        const availables = quotas[type].reduce((accumulator, v) => accumulator + v.available, 0);
        const style = availables ? {} : { color: fr.colors.decisions.text.default.warning.default };
        quotas[type].forEach((q) =>
            parts.push({
                reactNode: <li style={style}>{`${q.available} publications possibles sur ${q.name}`}</li>,
                id: q.name,
            })
        );
    }

    return (
        <ul className={fr.cx("fr-raw-list")}>
            {parts.map((part) => (
                <Fragment key={part.id}>{part.reactNode}</Fragment>
            ))}
        </ul>
    );
};

const VectorDbListItem: FC<VectorDbListItemProps> = ({ datasheetName, datastoreId, vectorDb }) => {
    const { t } = useTranslation("VectorDbList");

    // création d'un service
    const [serviceType, setServiceType] = useState<ServiceTypes>();

    const [technicalName, setTechnicalName] = useState<string>(vectorDb.name);
    const [technicalNameError, setTechnicalNameError] = useState<string>();

    // description de vectordb
    const [showDescription, toggleShowDescription] = useToggle(false);

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        retry: false,
        staleTime: 3600000,
    });

    const confirmRemoveVectorDbModal = useMemo(
        () =>
            createModal({
                id: `confirm-delete-vectordb-${vectorDb._id}`,
                isOpenedByDefault: false,
            }),
        [vectorDb._id]
    );

    const isOpenConfirmRemoveVectorDbModal = useIsModalOpen(confirmRemoveVectorDbModal);
    const dataUsesQuery = useDataUsesQuery(datastoreId, vectorDb._id, {
        enabled: showDescription || isOpenConfirmRemoveVectorDbModal,
    });

    const { wfsEndpoints, wmsVectorEndpoints, tmsEndpoints } = useMemo(() => {
        const wfsEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WFS")
            : [];
        const wmsVectorEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WMS-VECTOR")
            : [];
        const tmsEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WMTS-TMS")
            : [];

        return { wfsEndpoints, wmsVectorEndpoints, tmsEndpoints };
    }, [endpointsQuery.data]);

    const quotas = useMemo<Record<string, QuotaType[]>>(() => {
        const endpoints = endpointsQuery?.data ?? [];
        const result = {};
        endpoints.forEach((e) => {
            const endpoint = e.endpoint;

            const def = { name: endpoint.name, quota: e.quota, use: e.use, available: e.quota - e.use };
            if (!(endpoint.type in result)) {
                result[endpoint.type] = [def];
            } else result[endpoint.type].push(def);
        });
        return result;
    }, [endpointsQuery.data]);

    const isAvailable = useCallback(
        (type: string) => {
            if (!(type in quotas)) {
                return true;
            }
            const availables = quotas[type].reduce((accumulator, v) => accumulator + v.available, 0);
            return availables !== 0;
        },
        [quotas]
    );

    const handleCreateService = () => {
        switch (serviceType) {
            case "wfs":
                routes.datastore_wfs_service_new({ datastoreId, vectorDbId: vectorDb._id, datasheetName }).push();
                break;

            case "wms-vector":
                routes.datastore_wms_vector_service_new({ datastoreId, vectorDbId: vectorDb._id, datasheetName }).push();
                break;

            case "tms":
                if (!technicalName) {
                    return;
                }
                routes.datastore_pyramid_vector_generate({ datastoreId, vectorDbId: vectorDb._id, technicalName, datasheetName }).push();
                break;

            default:
                console.warn("Action non implémentée");
                break;
        }
    };

    const serviceTypeChoiceModal = useMemo(
        () =>
            createModal({
                id: `service-type-choice-modal-vectordb-${vectorDb._id}`,
                isOpenedByDefault: false,
            }),
        [vectorDb._id]
    );

    return (
        <>
            <ListItem
                actionButton={
                    <Button
                        onClick={() => {
                            serviceTypeChoiceModal.open();
                        }}
                        className={fr.cx("fr-mr-2v")}
                        priority="secondary"
                        disabled={vectorDb.status !== StoredDataStatusEnum.GENERATED}
                    >
                        {t("create_service")}
                    </Button>
                }
                badge={<StoredDataStatusBadge status={vectorDb.status} />}
                buttonTitle={t("show_linked_datas")}
                date={vectorDb?.last_event?.date}
                menuListItems={[
                    // NOTE : reporté cf. issue #249
                    // {
                    //     text: t("replace_datas"),
                    //     iconId: "fr-icon-refresh-line",
                    //     onClick: () => console.warn("Action non implémentée"),
                    //     disabled: vectorDb.status !== StoredDataStatusEnum.GENERATED,
                    // },
                    {
                        text: t("show_details"),
                        iconId: "fr-icon-file-text-fill",
                        linkProps: routes.datastore_stored_data_details({ datastoreId, datasheetName, storedDataId: vectorDb._id }).link,
                    },
                    {
                        text: tCommon("delete"),
                        iconId: "fr-icon-delete-line",
                        onClick: () => confirmRemoveVectorDbModal.open(),
                    },
                ]}
                name={vectorDb.name}
                showDescription={showDescription}
                toggleShowDescription={toggleShowDescription}
            >
                <VectorDbDesc dataUsesQuery={dataUsesQuery} />
            </ListItem>

            <StoredDataDeleteConfirmDialog datastoreId={datastoreId} storedData={vectorDb} datasheetName={datasheetName} modal={confirmRemoveVectorDbModal} />

            {createPortal(
                <serviceTypeChoiceModal.Component
                    title={t("define_service")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: tCommon("continue"),
                            onClick: handleCreateService,
                            doClosesModal: true,
                            priority: "primary",
                            disabled: serviceType === undefined,
                        },
                    ]}
                    concealingBackdrop={false}
                >
                    <RadioButtons
                        options={[
                            {
                                label: t("tms_label"),
                                hintText: getHintText(quotas, EndpointDetailResponseDtoTypeEnum.WMTSTMS, t),
                                nativeInputProps: {
                                    checked: serviceType === "tms",
                                    onChange: () => setServiceType("tms"),
                                    disabled: tmsEndpoints?.length === 0 || !isAvailable("WMTS-TMS"),
                                },
                            },
                            {
                                label: t("wfs_label"),
                                hintText: getHintText(quotas, EndpointDetailResponseDtoTypeEnum.WFS, t),
                                nativeInputProps: {
                                    checked: serviceType === "wfs",
                                    onChange: () => setServiceType("wfs"),
                                    disabled: wfsEndpoints?.length === 0 || !isAvailable("WFS"),
                                },
                            },
                            {
                                label: t("wmsv_label"),
                                hintText: getHintText(quotas, EndpointDetailResponseDtoTypeEnum.WMSVECTOR, t),
                                nativeInputProps: {
                                    checked: serviceType === "wms-vector",
                                    onChange: () => setServiceType("wms-vector"),
                                    disabled: wmsVectorEndpoints?.length === 0 || !isAvailable("WMS-VECTOR"),
                                },
                            },
                        ]}
                    />
                    {serviceType && serviceType === "tms" && (
                        <Input
                            label={t("tile_technical_name")}
                            hintText={t("tile_technical_name_hint_text")}
                            nativeInputProps={{
                                defaultValue: technicalName,
                                onChange: (e) => {
                                    setTechnicalName(e.currentTarget.value ?? undefined);
                                    setTechnicalNameError(e.currentTarget.value ? undefined : t("technical_name_is_mandatory"));
                                },
                            }}
                            state={technicalNameError ? "error" : "default"}
                            stateRelatedMessage={technicalNameError ?? undefined}
                        />
                    )}
                </serviceTypeChoiceModal.Component>,
                document.body
            )}

            {/* {createPortal(
                <confirmRemoveVectorDbModal.Component
                    title={t("confirm_delete_modal.title", { dbname: vectorDb.name })}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("delete"),
                            onClick: () => deleteVectorDbMutation.mutate(),
                            priority: "primary",
                            disabled: dataUsesQuery.isFetching || processingExecutionsQuery.isFetching,
                        },
                    ]}
                >
                    {(dataUsesQuery.isFetching || processingExecutionsQuery.isFetching) && <LoadingText withSpinnerIcon={true} as="p" />}

                    {processingExecutionsQuery?.data && processingExecutionsQuery?.data?.length > 0 && (
                        <div className={fr.cx("fr-grid-row")}>
                            <p>{t("processing_in_progress_deletion_warning")}</p>
                        </div>
                    )}

                    {dataUsesQuery.data?.offerings_list && dataUsesQuery.data?.offerings_list?.length > 0 && (
                        <div className={fr.cx("fr-grid-row")}>
                            <p className={fr.cx("fr-mb-1v")}>{t("following_services_deleted")}</p>

                            <ul className={fr.cx("fr-text--sm")}>
                                {dataUsesQuery.data?.offerings_list.map((offering) => (
                                    <li key={offering._id}>
                                        {offering.layer_name}
                                        <Badge>{offeringTypeDisplayName(offering.type)}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </confirmRemoveVectorDbModal.Component>,
                document.body
            )} */}
        </>
    );
};

VectorDbListItem.displayName = symToStr({ VectorDbListItem });

export default memo(VectorDbListItem);
