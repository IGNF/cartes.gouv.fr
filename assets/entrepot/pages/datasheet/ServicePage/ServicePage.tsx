import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { Fragment, type ReactNode, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { tss } from "tss-react";

import { type DatasheetDetailed, OfferingStatusEnum, OfferingTypeEnum, type Service } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import OfferingStatusBadge from "@/components/Utils/Badges/OfferingStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import TextCopyToClipboard from "@/components/Utils/TextCopyToClipboard";
import api from "@/entrepot/api";
import { datasheetServiceListQueryOptions } from "@/hooks/queries/datasheetServiceListQueryOptions";
import { datastorePermissionsQueryOptions } from "@/hooks/queries/datastorePermissionsQueryOptions";
import { serviceQueryOptions } from "@/hooks/queries/serviceQueryOptions";
import useCommunityRights from "@/hooks/useCommunityRights";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import AppLink from "@/router/AppLink";
import {
    delta,
    editableOfferingTypes,
    formatDateFromISO,
    getExploreMapsAvailability,
    getExploreMapsLayerParam,
    getServiceEditLink,
    getServiceThumbnailUrl,
    getServiceTypeLabel,
    isOfferingUnavailable,
    isPrivateServiceVisibleOnCartesGouv,
} from "@/utils";
import ServiceExploreMapsCell from "../DatasheetView/ServiceListTab/ServiceExploreMapsCell";
import MetadataSection from "../forms/MetadataSection";
import MetadataSectionsContainer from "../forms/MetadataSectionsContainer";
import AccessSection from "../ServiceForm/sections/AccessSection";
import ServiceDescriptionSection from "../ServiceForm/sections/ServiceDescriptionSection";
import { SERVICE_ACCESSES, type ServiceFormValues } from "../ServiceForm/serviceFormSchema";
import { serviceToFormValues } from "../ServiceForm/serviceToFormValues";

type ServicePageProps = {
    datastoreId: string;
    datasheetName: string;
    offeringId: string;
};

/** page d’un flux publié : formulaire du flux en lecture seule et rapport de génération */
export default function ServicePage({ datastoreId, datasheetName, offeringId }: ServicePageProps) {
    const { t } = useTranslation("ServicePage");
    const serviceQuery = useQuery(serviceQueryOptions(datastoreId, offeringId));
    const service = serviceQuery.data;

    const renderContent = () => {
        if (serviceQuery.isPending) {
            return <LoadingText as="p" message={t("loading")} withSpinnerIcon />;
        }
        if (serviceQuery.isError) {
            if (serviceQuery.error.status === 404) throw notFound();
            return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(serviceQuery.error)} small />;
        }
        // flux d’une autre fiche : introuvable sous cette fiche
        if (serviceQuery.data.configuration.tags.datasheet_name !== datasheetName) throw notFound();
        return <ServicePageContent datastoreId={datastoreId} datasheetName={datasheetName} service={serviceQuery.data} now={serviceQuery.dataUpdatedAt} />;
    };

    return (
        <Main title={service ? `${service.configuration.name} - ${datasheetName}` : datasheetName} breadcrumbSeparator>
            {renderContent()}
        </Main>
    );
}

type ServicePageContentProps = {
    datastoreId: string;
    datasheetName: string;
    service: Service;
    /** instant de lecture du flux : référence des expirations de permission et du délai d’Explorer les cartes */
    now: number;
};

function ServicePageContent({ datastoreId, datasheetName, service, now }: ServicePageContentProps) {
    const { t } = useTranslation("ServicePage");
    const { t: tForm } = useTranslation("ServiceForm");
    const { classes } = useStyles();

    // permissions illisibles ou en chargement : aucun accès coché, flux privé absent d’Explorer les cartes
    const { data: permissions } = useQuery(datastorePermissionsQueryOptions(datastoreId));
    const { data: services } = useQuery(datasheetServiceListQueryOptions(datastoreId, datasheetName));
    const { data: datasheet } = useQuery<DatasheetDetailed, ApiError>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: delta.minutes(1),
        retry: false,
    });

    const { userRights, isSupervisor } = useCommunityRights();
    const canBroadcast = isSupervisor || !!userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST);

    const unavailable = isOfferingUnavailable(service.status);
    const editLink = getServiceEditLink(datastoreId, datasheetName, service);
    // mêmes conditions que le menu « Modifier » de l’onglet Flux
    const showEdit = editableOfferingTypes.includes(service.type) && canBroadcast && !("to" in editLink && editLink.to === "/404");

    const { configuration } = service;
    const pyramid = service.type === OfferingTypeEnum.WMTSTMS;
    const storedDataId = configuration.type_infos.used_data[0]?.stored_data;
    const storedDataName = [...(datasheet?.vector_db_list ?? []), ...(datasheet?.pyramid_vector_list ?? []), ...(datasheet?.pyramid_raster_list ?? [])].find(
        (storedData) => storedData._id === storedDataId
    )?.name;

    const values = useMemo(() => serviceToFormValues(service, permissions, api.alerts.communityId, now), [service, permissions, now]);
    // sans résolveur ni envoi : un accès absent laisse simplement les boutons radio décochés
    const form = useForm<ServiceFormValues>({ values: values as ServiceFormValues });

    const visibleOnCartesGouv = isPrivateServiceVisibleOnCartesGouv(service, permissions, api.alerts.communityId, now);
    const exploreMapsAvailability = getExploreMapsAvailability({ service, services: services ?? [service], visibleOnCartesGouv, now });

    const reportColumns: { title: string; rows: [string, ReactNode][] }[] = [
        {
            title: t("report.configuration"),
            rows: [
                [t("report.id"), configuration._id],
                [t("report.name"), configuration.name],
                [t("report.status"), t("report.configuration_status", { status: configuration.status })],
                [t("report.creation"), formatDateFromISO(configuration.creation)],
                [t("report.update"), formatDateFromISO(configuration.update)],
            ],
        },
        {
            title: t("report.offering"),
            rows: [
                [t("report.id"), service._id],
                [t("report.name"), service.layer_name],
                [t("report.status"), <OfferingStatusBadge key="status" status={service.status} />],
                [t("report.creation"), formatDateFromISO(service.creation)],
                [t("report.update"), formatDateFromISO(service.update)],
            ],
        },
    ];

    return (
        <>
            <Button
                iconId="fr-icon-arrow-left-line"
                priority="tertiary no outline"
                size="small"
                className={fr.cx("fr-mb-2w")}
                linkProps={{
                    to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue",
                    params: { datastoreId, datasheetName },
                    search: { activeTab: "services" },
                }}
            >
                {t("back")}
            </Button>

            <div className={classes.header}>
                <div>
                    <h1 className={fr.cx("fr-mb-1w")}>{configuration.name}</h1>
                    <div className={classes.tags}>
                        <Tag small>{getServiceTypeLabel(service)}</Tag>
                        <OfferingStatusBadge status={service.status} />
                    </div>
                </div>
                {showEdit && (
                    <Button iconId="fr-icon-edit-line" {...(unavailable ? { disabled: true } : { linkProps: editLink })}>
                        {t("edit")}
                    </Button>
                )}
            </div>
            {showEdit && <p className={fr.cx("fr-text--sm", "fr-mt-2w")}>{t("edit_notice")}</p>}

            {unavailable && (
                <Alert
                    className={fr.cx("fr-mt-2w")}
                    severity="info"
                    title={t(service.status === OfferingStatusEnum.UNPUBLISHED ? "unpublished.title" : "unpublishing.title")}
                    description={t("unavailable.description")}
                />
            )}
            {service.status === OfferingStatusEnum.UNSTABLE && (
                <Alert className={fr.cx("fr-mt-2w")} severity="info" title={t("unstable.title")} description={t("unstable.description")} />
            )}

            <FormProvider {...form}>
                <MetadataSectionsContainer>
                    <MetadataSection title={tForm("section.description")}>
                        <fieldset disabled className={classes.fieldset}>
                            <ServiceDescriptionSection
                                storedDataLabel={tForm(pyramid ? "stored_data.label_pyramid" : "stored_data.label")}
                                storedDataName={storedDataName}
                                withDataKind={false}
                                withDescription={service.type !== OfferingTypeEnum.WFS}
                                thumbnailUrl={getServiceThumbnailUrl(service)}
                            />
                        </fieldset>
                        {/* hors du fieldset : son bouton « Copier » resterait désactivé */}
                        {!unavailable && service.share_url && <TextCopyToClipboard label={t("share_url")} text={service.share_url} />}
                        <p className={fr.cx("fr-label", "fr-mb-1v")}>{t("explore_maps")}</p>
                        <ServiceExploreMapsCell availability={exploreMapsAvailability} layerParam={getExploreMapsLayerParam(service)} />
                    </MetadataSection>

                    <MetadataSection title={tForm("section.access")}>
                        {values.access === undefined && <p className={fr.cx("fr-text--sm")}>{t("access.unknown")}</p>}
                        <fieldset disabled className={classes.fieldset}>
                            <AccessSection availableAccesses={SERVICE_ACCESSES} logoUrl={configuration.attribution?.logo?.url} />
                        </fieldset>
                        {!service.open && !unavailable && (
                            <>
                                <h3 className={fr.cx("fr-h6", "fr-mt-4w")}>{t("permissions.title")}</h3>
                                <AppLink to="/tableau-de-bord/entrepots/$datastoreId/permissions" params={{ datastoreId }}>
                                    {t("permissions.manage")}
                                </AppLink>
                            </>
                        )}
                    </MetadataSection>

                    <MetadataSection title={t("section.report")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            {reportColumns.map(({ title, rows }) => (
                                <div key={title} className={fr.cx("fr-col-12", "fr-col-md-6")}>
                                    <h3 className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-2w")}>{title}</h3>
                                    <dl className={fr.cx("fr-m-0")}>
                                        {rows.map(([label, value]) => (
                                            <Fragment key={label}>
                                                <dt className={fr.cx("fr-text--sm", "fr-mb-0")}>{label}</dt>
                                                <dd className={classes.value}>{value}</dd>
                                            </Fragment>
                                        ))}
                                    </dl>
                                </div>
                            ))}
                        </div>
                    </MetadataSection>
                </MetadataSectionsContainer>
            </FormProvider>
        </>
    );
}

const useStyles = tss.withName({ ServicePageContent }).create({
    header: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: fr.spacing("2w"),
    },
    fieldset: {
        border: 0,
        margin: 0,
        padding: 0,
        minWidth: 0,
    },
    tags: {
        display: "flex",
        alignItems: "center",
        gap: fr.spacing("1w"),
    },
    value: {
        marginLeft: 0,
        marginBottom: fr.spacing("2w"),
        overflowWrap: "anywhere",
    },
});
