import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import { tss } from "tss-react";

import { OfferingStatusEnum, type Service } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import OfferingStatusBadge from "@/components/Utils/Badges/OfferingStatusBadge";
import LoadingText from "@/components/Utils/LoadingText";
import { serviceQueryOptions } from "@/hooks/queries/serviceQueryOptions";
import useCommunityRights from "@/hooks/useCommunityRights";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import { editableOfferingTypes, formatDateFromISO, getServiceEditLink, getServiceTypeLabel, isOfferingUnavailable } from "@/utils";
import MetadataSection from "../forms/MetadataSection";
import MetadataSectionsContainer from "../forms/MetadataSectionsContainer";

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
        return <ServicePageContent datastoreId={datastoreId} datasheetName={datasheetName} service={serviceQuery.data} />;
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
};

function ServicePageContent({ datastoreId, datasheetName, service }: ServicePageContentProps) {
    const { t } = useTranslation("ServicePage");
    const { classes } = useStyles();

    const { userRights, isSupervisor } = useCommunityRights();
    const canBroadcast = isSupervisor || !!userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST);

    const unavailable = isOfferingUnavailable(service.status);
    const editLink = getServiceEditLink(datastoreId, datasheetName, service);
    // mêmes conditions que le menu « Modifier » de l’onglet Flux
    const showEdit = editableOfferingTypes.includes(service.type) && canBroadcast && !("to" in editLink && editLink.to === "/404");

    const { configuration } = service;
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

            <MetadataSectionsContainer>
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
