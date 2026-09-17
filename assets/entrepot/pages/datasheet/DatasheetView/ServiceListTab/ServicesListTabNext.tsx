import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useStyles } from "tss-react";

import { OfferingTypeEnum, StoredDataTypeEnum, type Service } from "@/@types/app";
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
import { externalUrls } from "@/router/externalUrls";
import { routes } from "@/router/router";
import { useSnackbarStore } from "@/stores/SnackbarStore";
import { editableOfferingTypes, formatDateFromISO, getServiceEditLink } from "@/utils";
import DatasheetViewTab from "../../DatasheetViewTab";
import ServiceInfoBanner from "./ServiceInfoBanner";

const LIMIT = 10;

const unpublishServiceConfirmModal = createModal({
    id: "services-tab-next-unpublish-service-confirm-modal",
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

    const setMessage = useSnackbarStore((state) => state.setMessage);
    const { userRights, isSupervisor } = useCommunityRights();
    const canBroadcast = isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST);

    // Récupération des services — dédupliquée par React Query avec la query identique du composant parent
    const serviceListQuery = useQuery<Service[], CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    const unpublishServiceMutation = useUnpublishServiceMutation(datastoreId, datasheetName);

    // du plus récent au plus ancien
    const sortedServices = useMemo(
        () => [...(serviceListQuery.data ?? [])].sort((a, b) => (b.configuration.last_event?.date ?? "").localeCompare(a.configuration.last_event?.date ?? "")),
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

    // lignes mémorisées : références stables pour que memo(MenuList) évite de re-rendre les menus de chaque ligne
    const rows = useMemo(
        () =>
            pageServices.map((service) => [
                <img
                    key={`thumbnail-${service._id}`}
                    src={placeholder1x1}
                    alt=""
                    className={css({ width: 40, height: 40, objectFit: "cover", borderRadius: 4, display: "block" })}
                />,
                service.layer_name,
                service.configuration.last_event?.date ? formatDateFromISO(service.configuration.last_event.date) : "",
                <Badge key={`access-${service._id}`} small noIcon className={fr.cx(service.open ? "fr-badge--blue-cumulus" : "fr-badge--purple-glycine")}>
                    {service.open ? "Public" : "Privé"}
                </Badge>,
                <OfferingStatusBadge key={`status-${service._id}`} status={service.status} />,
                <Button
                    key={`consult-${service._id}`}
                    priority="secondary"
                    size="small"
                    linkProps={routes.datastore_service_view({ datastoreId, offeringId: service._id, datasheetName }).link}
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
                            onClick: () => {
                                if (!service.share_url) {
                                    setMessage("URL de diffusion indisponible");
                                } else {
                                    setTargetService(service);
                                    TextCopyToClipboardModal.open();
                                }
                            },
                        },
                        {
                            text: "Voir dans cartes.gouv.fr",
                            iconId: "ri-external-link-line",
                            disabled: true,
                            onClick: () => {},
                        },
                        editableOfferingTypes.includes(service.type) &&
                            canBroadcast && {
                                text: "Mettre à jour",
                                iconId: "ri-edit-box-line",
                                linkProps: getServiceEditLink(datastoreId, datasheetName, service),
                            },
                        canBroadcast && {
                            text: "Dépublier",
                            iconId: "ri-arrow-go-back-line",
                            onClick: () => {
                                setTargetService(service);
                                unpublishServiceConfirmModal.open();
                            },
                        },
                        {
                            text: "Supprimer",
                            iconId: "ri-delete-bin-line",
                            disabled: true,
                            onClick: () => {},
                        },
                    ]}
                />,
            ]),
        [pageServices, canBroadcast, datastoreId, datasheetName, css, setMessage]
    );

    if (serviceListQuery.isLoading) {
        return <LoadingText withSpinnerIcon={true} as="p" />;
    }

    if (serviceListQuery.isError) {
        return <Alert severity="error" title="Erreur lors du chargement des services" description={serviceListQuery.error.message} closable={false} />;
    }

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
                                justifyContent: "center",
                                border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                            })
                        )}
                    >
                        <Button linkProps={routes.datastore_service_add_next({ datastoreId, datasheetName }).link}>Créer un flux</Button>
                    </div>
                ) : (
                    <>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-4w")}>
                            <div className={fr.cx("fr-col")}>
                                <SegmentedControl
                                    hideLegend
                                    legend="Filtrer par type de flux"
                                    name="service-type-filter"
                                    segments={[
                                        typeFilterSegment("all", "Tous"),
                                        typeFilterSegment("wfs", "WFS"),
                                        typeFilterSegment("wms", "WMS"),
                                        typeFilterSegment("wmts", "WMTS"),
                                        typeFilterSegment("tms", "TMS"),
                                    ]}
                                />
                            </div>
                            <div className={css({ marginLeft: "auto", display: "flex", gap: fr.spacing("2v") })}>
                                {/* TODO : parcours de génération de flux à brancher (refonte) */}
                                <Button priority="secondary" disabled>
                                    Ajouter un flux existant
                                </Button>
                                <Button linkProps={routes.datastore_service_add_next({ datastoreId, datasheetName }).link}>Créer un flux</Button>
                            </div>
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
                            headers={["", "Flux", "Date de publication", "Accès", "Statut", "Action", ""]}
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

            {/* Modale : Dépublier un service */}
            {createPortal(
                <unpublishServiceConfirmModal.Component
                    title={`Êtes-vous sûr de dépublier le service ${targetService?.type ?? ""} ?`}
                    buttons={[
                        {
                            children: "Non, annuler",
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: "Oui, dépublier",
                            onClick: () => targetService && unpublishServiceMutation.mutate(targetService),
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
                </unpublishServiceConfirmModal.Component>,
                document.body
            )}

            {unpublishServiceMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message="En cours de dépublication" withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}

            {unpublishServiceMutation.error && <Alert severity="error" closable title={unpublishServiceMutation.error.message} />}

            <TextCopyToClipboardDialog title="Copier l’URL" label="URL de diffusion" text={targetService?.share_url ?? ""} />
        </>
    );
}
