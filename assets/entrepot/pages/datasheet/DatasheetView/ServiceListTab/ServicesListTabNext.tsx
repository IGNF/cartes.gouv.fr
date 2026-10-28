import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useStyles } from "tss-react";

import { type DatastorePermission, OfferingTypeEnum, StoredDataTypeEnum, type Service } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import OfferingStatusBadge from "@/components/Utils/Badges/OfferingStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import MenuList from "@/components/Utils/MenuList";
import { TextCopyToClipboardDialog, TextCopyToClipboardModal } from "@/components/Utils/TextCopyToClipboardDialog";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import useUnpublishServiceMutation from "@/hooks/queries/useUnpublishServiceMutation";
import useCommunityRights from "@/hooks/useCommunityRights";
import { usePagination } from "@/hooks/usePagination";
import placeholder1x1 from "@/img/placeholder.1x1.png";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { exploreMapsLayerUrl, externalLinkToUrl, externalUrls } from "@/router/externalUrls";
import { routes } from "@/router/router";
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
import ServiceInfoBanner from "./ServiceInfoBanner";
import ServiceShareUrlCell from "./ServiceShareUrlCell";

const LIMIT = 10;

const deleteServiceConfirmModal = createModal({
    id: "services-tab-next-delete-service-confirm-modal",
    isOpenedByDefault: false,
});

type ServiceTypeFilter = "all" | "wfs" | "wms" | "wmts" | "tms";

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
};

export default function ServicesListTabNext({ datastoreId, datasheetName }: ServicesListTabNextProps) {
    const [typeFilter, setTypeFilter] = useState<ServiceTypeFilter>("all");
    const [page, setPage] = useState(1);
    const [targetService, setTargetService] = useState<Service>();

    const { userRights, isSupervisor } = useCommunityRights();
    const canBroadcast = isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST);

    // Récupération des services, dédupliquée par React Query avec la query identique du composant parent
    const serviceListQuery = useQuery<Service[], CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    // permissions de l’entrepôt, pour repérer les flux privés visibles sur cartes.gouv.fr
    const permissionsQuery = useQuery<DatastorePermission[], CartesApiException>({
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

    const typeFilterSegment = (filter: ServiceTypeFilter, label: string) => ({
        label,
        nativeInputProps: {
            checked: typeFilter === filter,
            onChange: () => {
                setTypeFilter(filter);
                setPage(1);
            },
        },
    });

    const { paginatedItems: pageServices, totalPages: pageCount } = usePagination(filteredServices, page, LIMIT);

    const { css, cx } = useStyles();

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
            const visibleOnCartesGouv = isPrivateServiceVisibleOnCartesGouv(service, permissions, api.alerts.communityId, now);
            const exploreMapsAvailability = getExploreMapsAvailability({ service, services: sortedServices, visibleOnCartesGouv, now });
            const exploreMapsLayerParam = getExploreMapsLayerParam(service);
            const exploreMapsLink =
                exploreMapsAvailability === "available" && exploreMapsLayerParam !== undefined
                    ? externalLinkToUrl(exploreMapsLayerUrl(exploreMapsLayerParam), "Voir dans Explorer les cartes")
                    : undefined;

            return [
                <span key={`name-${service._id}`} className={css({ display: "flex", alignItems: "center", gap: fr.spacing("2v") })}>
                    <img
                        src={getServiceThumbnailUrl(service) ?? placeholder1x1}
                        alt=""
                        className={css({ width: 40, height: 40, objectFit: "cover", borderRadius: 4, display: "block", flexShrink: 0 })}
                    />
                    <span className={css({ display: "block", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                        <span className={fr.cx("fr-text--bold")} title={service.configuration.name}>
                            {service.configuration.name}
                        </span>
                        <br />
                        <span className={fr.cx("fr-text--xs", "fr-m-0")} title={service.layer_name}>
                            {getServiceTypeLabel(service)} - {service.layer_name}
                        </span>
                    </span>
                </span>,
                service.update ? formatDateFromISO(service.update) : "",
                <OfferingStatusBadge key={`status-${service._id}`} status={service.status} />,
                <ServiceAccessBadge key={`access-${service._id}`} service={service} visibleOnCartesGouv={visibleOnCartesGouv} />,
                <ServiceShareUrlCell
                    key={`url-${service._id}`}
                    shareUrl={offeringUnavailable ? undefined : service.share_url}
                    onCopy={() => openCopyUrlDialog(service)}
                />,
                <ServiceExploreMapsCell key={`explore-${service._id}`} availability={exploreMapsAvailability} layerParam={exploreMapsLayerParam} />,
                <Button
                    key={`consult-${service._id}`}
                    priority="secondary"
                    size="small"
                    {...(offeringUnavailable
                        ? { disabled: true }
                        : { linkProps: routes.datastore_service_view({ datastoreId, offeringId: service._id, datasheetName }).link })}
                >
                    Consulter
                </Button>,
                <MenuList
                    key={`menu-${service._id}`}
                    menuOpenButtonProps={{
                        iconId: "ri-more-2-line",
                        priority: "tertiary no outline",
                        title: "Autres actions",
                        size: "small",
                    }}
                    items={[
                        {
                            text: "Copier l’URL",
                            iconId: "ri-file-copy-line",
                            disabled: offeringUnavailable || !service.share_url,
                            onClick: () => openCopyUrlDialog(service),
                        },
                        exploreMapsLink
                            ? {
                                  text: "Voir dans Explorer les cartes",
                                  iconId: "ri-external-link-line",
                                  linkProps: exploreMapsLink,
                              }
                            : {
                                  text: "Voir dans Explorer les cartes",
                                  iconId: "ri-external-link-line",
                                  disabled: true,
                                  onClick: () => {},
                              },
                        editableOfferingTypes.includes(service.type) &&
                            canBroadcast && {
                                text: "Mettre à jour",
                                iconId: "ri-edit-box-line",
                                disabled: offeringUnavailable,
                                linkProps: getServiceEditLink(datastoreId, datasheetName, service),
                            },
                        canBroadcast && {
                            text: "Supprimer",
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
    }, [pageServices, sortedServices, permissionsQuery.data, now, canBroadcast, datastoreId, datasheetName, css]);

    if (serviceListQuery.isLoading) {
        return <LoadingText withSpinnerIcon={true} as="p" />;
    }

    if (serviceListQuery.isError) {
        return <Alert severity="error" title="Erreur lors du chargement des flux" description={serviceListQuery.error.message} closable={false} />;
    }

    const createServiceLink = routes.datastore_service_add_next({ datastoreId, datasheetName }).link;

    return (
        <>
            <DatasheetViewTab>
                <h2 className={fr.cx("fr-h5", "fr-mb-4w")}>Flux</h2>

                <ServiceInfoBanner
                    title="Chaque type de flux est adapté à un besoin particulier. Renseignez-vous avant de publier."
                    linkHref={externalUrls.helpProducerGuideChooseServiceType}
                />

                {sortedServices.length === 0 ? (
                    <div
                        className={cx(
                            fr.cx("fr-mt-4w", "fr-py-8w"),
                            css({
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: fr.spacing("2w"),
                                border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                            })
                        )}
                    >
                        {canBroadcast ? (
                            <>
                                <Button linkProps={createServiceLink}>Créer un flux</Button>
                                <span>OU</span>
                                {/* TODO : référencement d’un flux existant à brancher (refonte) */}
                                <Button priority="secondary" disabled>
                                    Référencer un flux existant
                                </Button>
                            </>
                        ) : (
                            <p className={fr.cx("fr-m-0")}>Aucun flux</p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters", "fr-mt-2w")}>
                            <div className={cx(fr.cx("fr-col-12", "fr-col-md-7"), css({ overflowX: "auto" }))}>
                                <SegmentedControl
                                    hideLegend
                                    legend="Filtrer par type de flux"
                                    name="service-type-filter"
                                    segments={[
                                        typeFilterSegment("all", "Tous"),
                                        typeFilterSegment("wfs", "WFS"),
                                        typeFilterSegment("wms", "WMS"),
                                        typeFilterSegment("tms", "TMS"),
                                        typeFilterSegment("wmts", "WMTS"),
                                    ]}
                                />
                            </div>
                            {canBroadcast && (
                                <div
                                    className={cx(
                                        fr.cx("fr-col-12", "fr-col-md-5"),
                                        css({ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: fr.spacing("2v") })
                                    )}
                                >
                                    {/* TODO : référencement d’un flux existant à brancher (refonte) */}
                                    <Button priority="secondary" disabled>
                                        Référencer un flux existant
                                    </Button>
                                    <Button linkProps={createServiceLink}>Créer un flux</Button>
                                </div>
                            )}
                        </div>

                        <div className={cx(fr.cx("fr-mt-3w", "fr-mb-1w"), css({ display: "flex", justifyContent: "space-between" }))}>
                            <p className={fr.cx("fr-text--sm", "fr-m-0")}>
                                {filteredServices.length} résultat{filteredServices.length > 1 ? "s" : ""}
                            </p>
                            <p className={fr.cx("fr-text--sm", "fr-m-0")}>{LIMIT} résultats par page</p>
                        </div>

                        <Table
                            className={css({ "& table": { width: "100%" } })}
                            caption="Flux"
                            noCaption
                            headers={["Flux", "Date de modification", "Statut", "Accès", "URL", "Explorer les cartes", "Consulter", ""]}
                            data={rows}
                        />

                        {pageCount > 1 && (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-4w")}>
                                <Pagination
                                    count={pageCount}
                                    defaultPage={page}
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

            {/* Modale : Supprimer un flux (offre puis configuration) */}
            {createPortal(
                <deleteServiceConfirmModal.Component
                    title={`Êtes-vous sûr de vouloir supprimer le flux ${targetService?.configuration.name ?? ""} ?`}
                    buttons={[
                        {
                            children: "Non, annuler",
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: "Oui, supprimer",
                            onClick: () => targetService && deleteServiceMutation.mutate(targetService),
                            doClosesModal: true,
                            priority: "primary",
                        },
                    ]}
                >
                    <strong>Les éléments suivants seront supprimés :</strong>
                    <ul>
                        <li>1 offre ({targetService?._id})</li>
                        <li>1 configuration ({targetService?.configuration._id})</li>
                    </ul>
                </deleteServiceConfirmModal.Component>,
                document.body
            )}

            {deleteServiceMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message="Suppression en cours" withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}

            {deleteServiceMutation.error && <Alert severity="error" closable title={deleteServiceMutation.error.message} />}

            <TextCopyToClipboardDialog title="Copier l’URL" label="URL de diffusion" text={targetService?.share_url ?? ""} />
        </>
    );
}
