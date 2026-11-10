import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { tss } from "tss-react";

import { type DatastorePermission, OfferingTypeEnum, StoredDataTypeEnum, type Service } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import OfferingStatusBadge from "@/components/Utils/Badges/OfferingStatusBadge";
import CardRowsTable from "@/components/Utils/CardRowsTable";
import LoadingText from "@/components/Utils/LoadingText";
import MenuList from "@/components/Utils/MenuList";
import { TextCopyToClipboardDialog, TextCopyToClipboardModal } from "@/components/Utils/TextCopyToClipboardDialog";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import useUnpublishServiceMutation from "@/hooks/queries/useUnpublishServiceMutation";
import useCommunityRights from "@/hooks/useCommunityRights";
import { usePagination } from "@/hooks/usePagination";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { externalLinkToUrl, externalUrls } from "@/router/externalUrls";
import {
    editableOfferingTypes,
    formatDateFromISO,
    getExploreMapsAvailability,
    getExploreMapsLayerParam,
    getNextExploreMapsPendingEnd,
    getServiceEditLink,
    getServiceThumbnailUrl,
    getServiceTypeLabel,
    isOfferingUnavailable,
    isPrivateServiceVisibleOnCartesGouv,
} from "@/utils";
import DatasheetViewTab from "../../DatasheetViewTab";
import ServiceAccessBadge from "./ServiceAccessBadge";
import ServiceExploreMapsCell from "./ServiceExploreMapsCell";
import ServiceShareUrlCell from "./ServiceShareUrlCell";

import placeholder1x1 from "@/img/placeholder.1x1.png";

const LIMIT = 10;

// Flux, Accès, URL, Explorer, Date de modification, Statut, Action, menu
const COLUMN_WIDTHS = [undefined, "6.5rem", "7.5rem", "6.5rem", "14.5rem", "7.5rem", "8.25rem", "4rem"];

const deleteServiceConfirmModal = createModal({
    id: "services-tab-next-delete-service-confirm-modal",
    isOpenedByDefault: false,
});

type ServiceTypeFilter = "all" | "wfs" | "wms" | "tms" | "wmts";

const FILTERS = [
    { value: "all", label: undefined },
    { value: "wfs", label: "WFS" },
    { value: "wms", label: "WMS" },
    { value: "tms", label: "TMS" },
    { value: "wmts", label: "WMTS" },
] as const satisfies { value: ServiceTypeFilter; label: string | undefined }[];

// un WMTS-TMS dont le type de pyramide est inconnu apparaît sous WMTS et TMS
function matchesTypeFilter(service: Service, filter: ServiceTypeFilter): boolean {
    switch (filter) {
        case "all":
            return true;
        case "wfs":
            return service.type === OfferingTypeEnum.WFS;
        case "wms":
            return service.type === OfferingTypeEnum.WMSVECTOR || service.type === OfferingTypeEnum.WMSRASTER;
        case "wmts":
            return service.type === OfferingTypeEnum.WMTSTMS && service.configuration.pyramid?.type !== StoredDataTypeEnum.ROK4PYRAMIDVECTOR;
        case "tms":
            return service.type === OfferingTypeEnum.WMTSTMS && service.configuration.pyramid?.type !== StoredDataTypeEnum.ROK4PYRAMIDRASTER;
    }
}

type ServicesListTabNextProps = {
    datastoreId: string;
    datasheetName: string;
    serviceListQuery: UseQueryResult<Service[], ApiError>;
};

export default function ServicesListTabNext({ datastoreId, datasheetName, serviceListQuery }: ServicesListTabNextProps) {
    const { t } = useTranslation("ServicesListTabNext");
    const { classes, cx } = useStyles();
    const [typeFilter, setTypeFilter] = useState<ServiceTypeFilter>("all");
    const [page, setPage] = useState(1);
    const [targetService, setTargetService] = useState<Service>();

    const { userRights, isSupervisor } = useCommunityRights();
    const canBroadcast = isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST);
    // la page « Créer un flux » dépose vignette et logo en annexes
    const canCreate = canBroadcast && (isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.ANNEX));

    // permissions de l’entrepôt, pour repérer les flux privés visibles sur cartes.gouv.fr ; en cas d’échec, ces flux s’affichent « Privé »
    const permissionsQuery = useQuery<DatastorePermission[], ApiError>({
        queryKey: RQKeys.datastore_permissions(datastoreId),
        queryFn: ({ signal }) => api.datastore.getPermissions(datastoreId, {}, { signal }),
        staleTime: 60000,
        retry: false,
    });

    const deleteServiceMutation = useUnpublishServiceMutation(datastoreId, datasheetName);

    // du plus récent au plus ancien
    const sortedServices = useMemo(
        () => [...(serviceListQuery.data ?? [])].sort((a, b) => (b.update ?? "").localeCompare(a.update ?? "")),
        [serviceListQuery.data]
    );

    const filteredServices = useMemo(() => sortedServices.filter((service) => matchesTypeFilter(service, typeFilter)), [sortedServices, typeFilter]);

    const { paginatedItems: pageServices, totalPages: pageCount, page: currentPage } = usePagination(filteredServices, page, LIMIT);

    const segment = ({ value, label }: (typeof FILTERS)[number]) => ({
        label: label ?? t("filter.all"),
        nativeInputProps: {
            checked: typeFilter === value,
            onChange: () => {
                setTypeFilter(value);
                setPage(1);
            },
        },
    });

    const openCopyUrlDialog = (service: Service) => {
        setTargetService(service);
        TextCopyToClipboardModal.open();
    };

    // instant de référence du délai « En cours » : dernière lecture de la liste, ou dernier réveil du minuteur ci-dessous
    const [clockTick, setClockTick] = useState(0);
    const now = Math.max(serviceListQuery.dataUpdatedAt, clockTick);

    // réveil à la sortie du délai du prochain flux « En cours », pour ne pas attendre une relecture
    useEffect(() => {
        const nextPendingEnd = getNextExploreMapsPendingEnd(sortedServices, now);
        if (nextPendingEnd === undefined) {
            return;
        }
        const timer = window.setTimeout(() => setClockTick(Date.now()), nextPendingEnd - now + 1000);
        return () => window.clearTimeout(timer);
    }, [sortedServices, now]);

    // lignes mémorisées : références stables pour que memo(MenuList) évite de re-rendre les menus de chaque ligne
    const rows = useMemo(() => {
        const permissions = permissionsQuery.data;

        return pageServices.map((service) => {
            const offeringUnavailable = isOfferingUnavailable(service.status);
            const editable = editableOfferingTypes.includes(service.type);
            const visibleOnCartesGouv = isPrivateServiceVisibleOnCartesGouv(service, permissions, api.alerts.communityId, now);
            const exploreMapsAvailability = getExploreMapsAvailability({ service, services: sortedServices, visibleOnCartesGouv, now });
            const exploreMapsLayerParam = getExploreMapsLayerParam(service);

            return [
                <span key={`name-${service._id}`} className={classes.name}>
                    <img src={getServiceThumbnailUrl(service) ?? placeholder1x1} alt="" className={classes.thumbnail} />
                    <span className={classes.nameText}>
                        <span className={fr.cx("fr-text--bold")} title={service.configuration.name}>
                            {service.configuration.name}
                        </span>
                        <br />
                        <span className={fr.cx("fr-text--xs")} title={service.layer_name}>
                            {getServiceTypeLabel(service)} - {service.layer_name}
                        </span>
                    </span>
                </span>,
                <ServiceAccessBadge key={`access-${service._id}`} service={service} visibleOnCartesGouv={visibleOnCartesGouv} />,
                <ServiceShareUrlCell
                    key={`url-${service._id}`}
                    shareUrl={offeringUnavailable ? undefined : service.share_url}
                    onCopy={() => openCopyUrlDialog(service)}
                />,
                <ServiceExploreMapsCell key={`explore-${service._id}`} availability={exploreMapsAvailability} layerParam={exploreMapsLayerParam} />,
                service.update ? formatDateFromISO(service.update) : "",
                <OfferingStatusBadge key={`status-${service._id}`} status={service.status} />,
                <Button
                    key={`view-${service._id}`}
                    priority="tertiary"
                    size="small"
                    {...(offeringUnavailable
                        ? { disabled: true }
                        : {
                              linkProps: {
                                  to: "/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation",
                                  params: { datastoreId, offeringId: service._id },
                                  search: { datasheetName },
                              },
                          })}
                >
                    {t("view")}
                </Button>,
                <MenuList
                    key={`menu-${service._id}`}
                    menuOpenButtonProps={{
                        iconId: "ri-more-2-line",
                        priority: "tertiary no outline",
                        title: t("menu.open"),
                        size: "small",
                    }}
                    items={[
                        {
                            text: t("menu.copy_url"),
                            iconId: "ri-file-copy-line",
                            disabled: offeringUnavailable || !service.share_url,
                            onClick: () => openCopyUrlDialog(service),
                        },
                        editable &&
                            canBroadcast && {
                                text: t("menu.edit"),
                                iconId: "ri-edit-box-line",
                                disabled: offeringUnavailable,
                                linkProps: getServiceEditLink(datastoreId, datasheetName, service),
                            },
                        editable &&
                            canBroadcast && {
                                text: t("menu.delete"),
                                iconId: "ri-delete-bin-line",
                                onClick: () => {
                                    setTargetService(service);
                                    deleteServiceConfirmModal.open();
                                },
                            },
                    ]}
                />,
            ];
        });
    }, [pageServices, sortedServices, permissionsQuery.data, now, canBroadcast, datastoreId, datasheetName, classes, t]);

    if (serviceListQuery.isPending) {
        return <LoadingText withSpinnerIcon={true} as="p" />;
    }

    if (serviceListQuery.isError) {
        return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(serviceListQuery.error)} small />;
    }

    const createButton = (
        <Button
            iconId="fr-icon-add-line"
            linkProps={{ to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/flux/ajout", params: { datastoreId, datasheetName } }}
        >
            {t("create")}
        </Button>
    );
    // référencement d’un flux existant : hors périmètre (notes du 28/10/2026)
    const referenceButton = (
        <Button priority="secondary" disabled>
            {t("reference_existing")}
        </Button>
    );

    return (
        <>
            <DatasheetViewTab>
                <h2 className={fr.cx("fr-h5", "fr-mb-4w")}>{t("title")}</h2>

                <Notice
                    severity="info"
                    title={t("banner.title")}
                    link={{ text: t("banner.link"), linkProps: externalLinkToUrl(externalUrls.helpProducerGuideChooseServiceType, t("banner.link")) }}
                />

                {deleteServiceMutation.isError && (
                    <Alert
                        className={fr.cx("fr-mt-2w")}
                        severity="error"
                        title={t("delete_error")}
                        description={getApiErrorMessage(deleteServiceMutation.error)}
                        small
                    />
                )}

                {sortedServices.length === 0 ? (
                    <div className={classes.empty}>
                        {canCreate ? (
                            <>
                                {createButton}
                                <span className={classes.separator}>{t("or")}</span>
                                {referenceButton}
                            </>
                        ) : (
                            <p className={fr.cx("fr-m-0")}>{t("no_service")}</p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={cx(fr.cx("fr-mt-4w"), classes.toolbar)}>
                            <SegmentedControl
                                hideLegend
                                legend={t("filter_legend")}
                                name="service-type-filter"
                                segments={[segment(FILTERS[0]), segment(FILTERS[1]), segment(FILTERS[2]), segment(FILTERS[3]), segment(FILTERS[4])]}
                            />
                            {canCreate && (
                                <div className={classes.actions}>
                                    {referenceButton}
                                    {createButton}
                                </div>
                            )}
                        </div>

                        <div className={cx(fr.cx("fr-mt-3w", "fr-mb-1w"), classes.results)}>
                            <p className={fr.cx("fr-text--xs", "fr-m-0")}>{t("results", { count: filteredServices.length })}</p>
                            <p className={fr.cx("fr-text--xs", "fr-m-0")}>{t("per_page", { count: LIMIT })}</p>
                        </div>

                        <CardRowsTable
                            caption={t("caption")}
                            noCaption
                            columnWidths={COLUMN_WIDTHS}
                            headers={[
                                t("column.name"),
                                t("column.access"),
                                t("column.url"),
                                t("column.explore"),
                                t("column.update"),
                                t("column.status"),
                                t("column.action"),
                                <span key="menu" className={fr.cx("fr-sr-only")}>
                                    {t("column.menu")}
                                </span>,
                            ]}
                            data={rows}
                        />

                        {pageCount > 1 && (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-4w")}>
                                <Pagination
                                    count={pageCount}
                                    defaultPage={currentPage}
                                    showFirstLast
                                    getPageLinkProps={(pageNumber) => ({
                                        href: "#",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            setPage(pageNumber);
                                        },
                                    })}
                                />
                            </div>
                        )}
                    </>
                )}
            </DatasheetViewTab>

            {createPortal(
                <deleteServiceConfirmModal.Component
                    title={t("delete_modal.title", { name: targetService?.configuration.name ?? "" })}
                    buttons={[
                        { children: t("delete_modal.cancel"), doClosesModal: true, priority: "secondary" },
                        {
                            children: t("delete_modal.confirm"),
                            onClick: () => targetService && deleteServiceMutation.mutate(targetService),
                            doClosesModal: true,
                            priority: "primary",
                        },
                    ]}
                >
                    <strong>{t("delete_modal.items")}</strong>
                    <ul>
                        <li>{t("delete_modal.offering", { id: targetService?._id ?? "" })}</li>
                        <li>{t("delete_modal.configuration", { id: targetService?.configuration._id ?? "" })}</li>
                    </ul>
                </deleteServiceConfirmModal.Component>,
                document.body
            )}

            {deleteServiceMutation.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("deleting")} withSpinnerIcon={true} />
                </Wait>
            )}

            <TextCopyToClipboardDialog title={t("copy_dialog.title")} label={t("copy_dialog.label")} text={targetService?.share_url ?? ""} />
        </>
    );
}

const useStyles = tss.withName({ ServicesListTabNext }).create({
    toolbar: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: fr.spacing("2w"),
    },
    actions: {
        display: "flex",
        flexWrap: "wrap",
        gap: fr.spacing("2w"),
    },
    results: {
        display: "flex",
        justifyContent: "space-between",
        color: fr.colors.decisions.text.mention.grey.default,
    },
    name: {
        display: "flex",
        alignItems: "center",
        gap: fr.spacing("2w"),
    },
    thumbnail: {
        width: "1.5rem",
        height: "1.5rem",
        objectFit: "cover",
        borderRadius: "0.25rem",
        flexShrink: 0,
    },
    // la cellule est une boîte flexible : la troncature de CardRowsTable ne s’applique qu’au texte
    nameText: {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    empty: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: fr.spacing("2w"),
        marginTop: fr.spacing("4w"),
        padding: `${fr.spacing("8w")} 0`,
        border: `1px dashed ${fr.colors.decisions.border.default.grey.default}`,
    },
    // « ou » entre deux traits, comme la maquette
    separator: {
        display: "flex",
        alignItems: "center",
        gap: fr.spacing("2w"),
        width: "50%",
        "&::before, &::after": {
            content: '""',
            flex: 1,
            borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        },
    },
});
