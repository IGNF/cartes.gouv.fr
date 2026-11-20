import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notFound, useBlocker, useNavigate } from "@tanstack/react-router";
import { Fragment, type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FormProvider, useForm } from "react-hook-form";
import { tss } from "tss-react";

import { OfferingStatusEnum, OfferingTypeEnum, type Service } from "@/@types/app";
import { CommunityMemberDtoRightsEnum, ConfigurationStatus } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import OfferingStatusBadge from "@/components/Utils/Badges/OfferingStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import TextCopyToClipboard from "@/components/Utils/TextCopyToClipboard";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { datasheetQueryOptions } from "@/hooks/queries/datasheetQueryOptions";
import { datasheetServiceListQueryOptions } from "@/hooks/queries/datasheetServiceListQueryOptions";
import { datastoreEndpointsQueryOptions } from "@/hooks/queries/datastoreEndpointsQueryOptions";
import { serviceQueryOptions } from "@/hooks/queries/serviceQueryOptions";
import { vectorDbQueryOptions } from "@/hooks/queries/vectorDbQueryOptions";
import useCommunityRights from "@/hooks/useCommunityRights";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage, isApiError } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { setApiFormErrors } from "@/modules/setApiFormErrors";
import AppLink from "@/router/AppLink";
import { useSnackbarStore } from "@/stores/SnackbarStore";
import {
    editableOfferingTypes,
    formatDateFromISO,
    getExploreMapsAvailability,
    getExploreMapsLayerParam,
    getNextExploreMapsPendingEnd,
    getServiceThumbnailUrl,
    getServiceType,
    getServiceTypeLabel,
    isOfferingUnavailable,
} from "@/utils";
import ServiceExploreMapsCell from "../DatasheetView/ServiceListTab/ServiceExploreMapsCell";
import MetadataSection from "../forms/MetadataSection";
import MetadataSectionsContainer from "../forms/MetadataSectionsContainer";
import { buildServiceEditFormData, mapServiceViolationPaths } from "../ServiceForm/buildServiceFormData";
import AccessSection from "../ServiceForm/sections/AccessSection";
import ServiceDescriptionSection from "../ServiceForm/sections/ServiceDescriptionSection";
import StylesSection from "../ServiceForm/sections/StylesSection";
import TablesSection from "../ServiceForm/sections/TablesSection";
import {
    availableServiceAccesses,
    buildServiceEditFormSchema,
    SERVICE_ACCESSES,
    type ServiceEditFormOutput,
    type ServiceEditFormValues,
    type ServiceFormValues,
} from "../ServiceForm/serviceFormSchema";
import { serviceToFormValues } from "../ServiceForm/serviceToFormValues";
import ServicePreviewSection from "./ServicePreviewSection";

// flux sur une base vecteur : tables à choisir
const TABLE_TYPES = new Set<OfferingTypeEnum>([OfferingTypeEnum.WFS, OfferingTypeEnum.WMSVECTOR]);

type ServicePageProps = {
    datastoreId: string;
    datasheetName: string;
    offeringId: string;
};

export default function ServicePage({ datastoreId, datasheetName, offeringId }: ServicePageProps) {
    const { t } = useTranslation("ServicePage");
    const serviceQuery = useQuery(serviceQueryOptions(datastoreId, offeringId));
    const service = serviceQuery.data;

    const renderContent = () => {
        if (serviceQuery.isPending) {
            return <LoadingText as="p" message={t("loading")} withSpinnerIcon />;
        }
        if (serviceQuery.isError && serviceQuery.error.status === 404) throw notFound();
        // échec d’une relecture en arrière-plan : le flux déjà lu reste affiché, avec le formulaire en cours
        if (serviceQuery.data === undefined) {
            return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(serviceQuery.error)} small />;
        }
        if (serviceQuery.data.configuration.tags.datasheet_name !== datasheetName) throw notFound();
        return <ServicePageContent datastoreId={datastoreId} datasheetName={datasheetName} service={serviceQuery.data} readAt={serviceQuery.dataUpdatedAt} />;
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
    readAt: number;
};

/** décide si la page est modifiable et monte le formulaire une fois ses valeurs initiales sûres */
function ServicePageContent(props: ServicePageContentProps) {
    const { t } = useTranslation("ServicePage");
    const { datastoreId, service } = props;
    const { configuration } = service;
    const storedDataId = configuration.type_infos.used_data[0]?.stored_data ?? "";
    const withTables = TABLE_TYPES.has(service.type);

    const { userRights, isSupervisor } = useCommunityRights();
    const hasRight = (right: CommunityMemberDtoRightsEnum) => isSupervisor || !!userRights?.includes(right);
    // mêmes droits que la création : publication et dépôt des images en annexe
    const canSave =
        editableOfferingTypes.includes(service.type) && hasRight(CommunityMemberDtoRightsEnum.BROADCAST) && hasRight(CommunityMemberDtoRightsEnum.ANNEX);
    // même règle que le serveur : une offre en cours de publication peut le rester longtemps
    const published = service.status === OfferingStatusEnum.PUBLISHED && configuration.status === ConfigurationStatus.PUBLISHED;

    const vectorDbQuery = useQuery(vectorDbQueryOptions(datastoreId, canSave && withTables ? storedDataId : ""));

    // accès inconnu quand le serveur n’a pas pu lire les permissions
    const accessKnown = service.access !== null && service.access !== undefined;
    const tablesReady = !withTables || vectorDbQuery.data !== undefined;
    const editable = canSave && published && accessKnown && tablesReady;

    let lockReason: string | undefined;
    if (canSave && !published && !isOfferingUnavailable(service.status) && service.status !== OfferingStatusEnum.UNSTABLE) {
        lockReason = t("edit.busy");
    } else if (canSave && published && !accessKnown) {
        lockReason = t("edit.permissions_error");
    } else if (canSave && published && !tablesReady && vectorDbQuery.isError) {
        lockReason = t("edit.tables_error");
    }

    const values = useMemo(() => serviceToFormValues(service, vectorDbQuery.data), [service, vectorDbQuery.data]);

    return (
        <>
            {lockReason && <Alert className={fr.cx("fr-mt-2w")} severity="info" title={t("edit.locked")} description={lockReason} small />}
            <ServiceSheet key={editable ? "edit" : "view"} {...props} values={values} editable={editable} canSave={canSave} />
        </>
    );
}

type ServiceSheetProps = ServicePageContentProps & {
    values: ServiceFormValues;
    /** formulaire initialisé une fois depuis `values` ; sinon lecture seule, qui suit le flux relu */
    editable: boolean;
    /** bouton « Enregistrer » affiché (droits et type), actif seulement quand la page est modifiable */
    canSave: boolean;
};

function ServiceSheet({ datastoreId, datasheetName, service, readAt, values, editable, canSave }: ServiceSheetProps) {
    const { t } = useTranslation("ServicePage");
    const { t: tForm } = useTranslation("ServiceForm");
    const { classes, cx } = useStyles();
    const formId = useId();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    // message global : il reste affiché quand l’enregistrement mène à la nouvelle offre
    const setSnackbarMessage = useSnackbarStore((state) => state.setMessage);

    const services = useQuery(datasheetServiceListQueryOptions(datastoreId, datasheetName)).data?.services;
    const { data: datasheet } = useQuery(datasheetQueryOptions(datastoreId, datasheetName));
    const endpointsQuery = useQuery({ ...datastoreEndpointsQueryOptions(datastoreId), enabled: editable });

    const unavailable = isOfferingUnavailable(service.status);

    const { configuration } = service;
    const isWfs = service.type === OfferingTypeEnum.WFS;
    const isWmsVector = service.type === OfferingTypeEnum.WMSVECTOR;
    // offre hors formulaire (téléchargement...) : lecture seule, le type ne sert pas
    const formType = getServiceType(service) ?? "wmts";
    const rasterPyramid = service.type === OfferingTypeEnum.WMSRASTER;
    const pyramid = service.type === OfferingTypeEnum.WMTSTMS;
    const storedDataId = configuration.type_infos.used_data[0]?.stored_data;
    const storedDataName = [...(datasheet?.vector_db_list ?? []), ...(datasheet?.pyramid_vector_list ?? []), ...(datasheet?.pyramid_raster_list ?? [])].find(
        (storedData) => storedData._id === storedDataId
    )?.name;

    // comme l’onglet Flux : réveil à la sortie du délai « En cours » d’Explorer les cartes
    const [clockTick, setClockTick] = useState(0);
    const now = Math.max(readAt, clockTick);
    useEffect(() => {
        const pendingEnd = getNextExploreMapsPendingEnd([service], now);
        if (pendingEnd === undefined) return;
        const timer = window.setTimeout(() => setClockTick(Date.now()), pendingEnd - now + 1000);
        return () => window.clearTimeout(timer);
    }, [service, now]);

    // `values` suit le flux relu : noms enregistrés au dernier enregistrement
    const savedTablePublicNames = useMemo(
        () => Object.fromEntries(values.tables.filter((table) => table.selected).map((table) => [table.native_name, table.public_name])),
        [values.tables]
    );
    // style WFS rattaché au nom servi par l’Entrepôt : nom technique, sinon nom de la table
    const styledTables = useMemo(() => {
        const layerNames = new Set((configuration.styles ?? []).flatMap((style) => style.layers.map((layer) => layer.name)));
        return new Set(
            values.tables.filter((table) => table.selected && layerNames.has(table.public_name || table.native_name)).map((table) => table.native_name)
        );
    }, [configuration.styles, values.tables]);

    const schema = useMemo(
        () =>
            buildServiceEditFormSchema({
                t: tForm,
                type: formType,
                rasterPyramid,
                availableAccesses: availableServiceAccesses(endpointsQuery.data, configuration.type),
                savedTablePublicNames,
            }),
        [tForm, formType, rasterPyramid, endpointsQuery.data, configuration.type, savedTablePublicNames]
    );
    const form = useForm<ServiceEditFormValues, unknown, ServiceEditFormOutput>(
        editable ? { resolver: zodResolver(schema), mode: "onSubmit", reValidateMode: "onBlur", defaultValues: values } : { values, disabled: true }
    );

    const serviceKey = RQKeys.datastore_service(datastoreId, service._id);
    const editMutation = useMutation<Service, ApiError, ServiceEditFormOutput>({
        mutationFn: (formValues) => api.service.edit(datastoreId, service._id, buildServiceEditFormData(formType, formValues, rasterPyramid)),
        onSuccess: async (offering, formValues) => {
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });

            // la page de gestion des permissions les relira
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_permissions(datastoreId) });

            if (offering._id !== service._id) {
                await navigate({
                    to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/flux/$offeringId",
                    params: { datastoreId, datasheetName, offeringId: offering._id },
                    replace: true,
                    ignoreBlocker: true,
                });
                // après la navigation, seulement si plus rien ne l’observe : une requête encore observée serait relue en 404
                queryClient.removeQueries({ queryKey: serviceKey, type: "inactive" });
                setSnackbarMessage(t("edit.success"));
                return;
            }

            // la réponse n’a ni `share_url`, ni `styles`, ni `pyramid`, ni `access` : le flux est relu
            await queryClient.invalidateQueries({ queryKey: serviceKey });
            const fresh = queryClient.getQueryData<Service>(serviceKey);
            // relecture en échec : le cache est celui d’avant l’enregistrement, les valeurs envoyées deviennent la référence
            if (queryClient.getQueryState(serviceKey)?.status === "error" || !fresh) {
                form.reset(form.getValues());
            } else {
                // accès enregistré : la relecture peut garder l’ancien quand les permissions n’ont pas pu être lues
                form.reset(
                    serviceToFormValues(
                        { ...fresh, access: formValues.access },
                        storedDataId ? queryClient.getQueryData(RQKeys.datastore_stored_data(datastoreId, storedDataId)) : undefined
                    )
                );
            }
            setSnackbarMessage(t("edit.success"));
        },
    });

    // modifications non enregistrées : confirmation avant de quitter la page (navigation dans l’application ou fermeture de l’onglet)
    const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const leaveModal = useMemo(() => createModal({ id: `service-leave-${reactId}`, isOpenedByDefault: false }), [reactId]);
    const blocker = useBlocker({
        shouldBlockFn: () => true,
        enableBeforeUnload: true,
        disabled: !editable || !form.formState.isDirty || editMutation.isPending,
        withResolver: true,
    });
    useEffect(() => {
        if (blocker.status === "blocked") leaveModal.open();
    }, [blocker.status, leaveModal]);
    // fermeture de la modale sans quitter : la navigation bloquée est abandonnée
    useIsModalOpen(leaveModal, { onConceal: () => blocker.reset?.() });

    const submit = form.handleSubmit(async (formValues) => {
        try {
            await editMutation.mutateAsync(formValues);
        } catch (error) {
            if (isApiError(error)) setApiFormErrors(mapServiceViolationPaths(error, formValues.tables), form.setError);
        }
    });

    const visibleOnCartesGouv = service.access === "restricted_visible";
    // sans la liste des flux de la fiche, le WMTS jumeau d’un WMS reste inconnu
    const exploreMapsAvailability = services === undefined ? "unavailable" : getExploreMapsAvailability({ service, services, visibleOnCartesGouv, now });

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
            {editMutation.isError && (
                <Alert className={fr.cx("fr-mt-2w")} severity="error" title={t("edit.error")} description={getApiErrorMessage(editMutation.error)} small />
            )}

            {/* champs hors du formulaire HTML : seul le bouton « Enregistrer » le soumet, pas la touche Entrée ni les boutons des autres sections */}
            <form id={formId} onSubmit={(e) => void submit(e)} noValidate />
            <FormProvider {...form}>
                <MetadataSectionsContainer>
                    <div className={cx(fr.cx("fr-col-12"), classes.header)}>
                        <div className={classes.title}>
                            <h1 className={fr.cx("fr-h6", "fr-mb-0")}>{configuration.name}</h1>
                            <div className={classes.tags}>
                                <Tag small>{t("type_tag", { type: getServiceTypeLabel(service) })}</Tag>
                                <OfferingStatusBadge status={service.status} />
                            </div>
                        </div>
                        {canSave && (
                            <Button type="submit" nativeButtonProps={{ form: formId }} disabled={!editable || editMutation.isPending}>
                                {t("save")}
                            </Button>
                        )}
                    </div>
                    <MetadataSection title={tForm("section.description")}>
                        <fieldset disabled={!editable} className={classes.fieldset}>
                            <ServiceDescriptionSection
                                storedDataLabel={tForm(pyramid ? "stored_data.label_pyramid" : "stored_data.label")}
                                storedDataName={storedDataName}
                                withDataKind={false}
                                withDescription={!isWfs}
                                thumbnailUrl={getServiceThumbnailUrl(service)}
                                technicalName={configuration.layer_name}
                            />
                        </fieldset>
                        {/* hors du fieldset : son bouton « Copier » resterait désactivé */}
                        {!unavailable && service.share_url && <TextCopyToClipboard label={t("share_url")} text={service.share_url} />}
                        <p className={fr.cx("fr-label", "fr-mb-1v")}>{t("explore_maps")}</p>
                        <ServiceExploreMapsCell availability={exploreMapsAvailability} layerParam={getExploreMapsLayerParam(service)} />
                    </MetadataSection>

                    {editable && (isWfs || isWmsVector) && (
                        <MetadataSection title={tForm("section.tables")}>
                            <TablesSection
                                status="success"
                                noGeometricTable={values.tables.length === 0}
                                detailed={isWfs}
                                styledTables={isWfs ? styledTables : undefined}
                            />
                        </MetadataSection>
                    )}

                    {editable && isWmsVector && (
                        <MetadataSection title={tForm("section.styles")}>
                            <StylesSection datastoreId={datastoreId} />
                        </MetadataSection>
                    )}

                    {!unavailable && (
                        <MetadataSection title={t("section.preview")}>
                            <ServicePreviewSection datastoreId={datastoreId} datasheetName={datasheetName} service={service} />
                        </MetadataSection>
                    )}

                    <MetadataSection title={tForm("section.access")}>
                        <fieldset disabled={!editable} className={classes.fieldset}>
                            <AccessSection
                                availableAccesses={editable ? availableServiceAccesses(endpointsQuery.data, configuration.type) : SERVICE_ACCESSES}
                                logoUrl={configuration.attribution?.logo?.url}
                                savedAccess={editable ? values.access : undefined}
                            />
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

            {createPortal(
                <leaveModal.Component
                    title={t("leave.title")}
                    buttons={[
                        { children: t("leave.stay"), priority: "secondary", doClosesModal: true },
                        {
                            children: t("leave.confirm"),
                            onClick: () => {
                                blocker.proceed?.();
                                leaveModal.close();
                            },
                            doClosesModal: false,
                        },
                    ]}
                >
                    {t("leave.description")}
                </leaveModal.Component>,
                document.body
            )}

            {editMutation.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("edit.saving")} withSpinnerIcon />
                </Wait>
            )}
        </>
    );
}

const useStyles = tss.withName({ ServiceSheet }).create({
    header: {
        display: "flex",
        alignItems: "flex-start",
        gap: fr.spacing("2w"),
        padding: `${fr.spacing("3w")} ${fr.spacing("6v")} !important`,
        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        [fr.breakpoints.up("md")]: {
            padding: `${fr.spacing("3w")} ${fr.spacing("10v")} !important`,
        },
    },
    title: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
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
        flexWrap: "wrap",
        alignItems: "center",
        gap: fr.spacing("3v"),
    },
    value: {
        marginLeft: 0,
        marginBottom: fr.spacing("2w"),
        overflowWrap: "anywhere",
    },
});
