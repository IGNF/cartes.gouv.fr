import { BreadcrumbProps, addBreadcrumbTranslations } from "@codegouvfr/react-dsfr/Breadcrumb";

import { Community, Datastore } from "../../../@types/app";
import { getTranslation } from "../../../i18n/i18n";

const { t } = getTranslation("Breadcrumb");
const { t: tCommon } = getTranslation("Common");

const P = "/_private";
const D = "/_private/tableau-de-bord/entrepots/$datastoreId";

// nom historique de la page (aussi clé de traduction du fil d’Ariane) par id de route
const breadcrumbNameByRouteId = {
    [`${P}/mon-compte`]: "my_account",
    [`${P}/mes-cles/`]: "my_access_keys",
    [`${P}/mes-permissions`]: "my_permissions",
    [`${P}/mes-cles/ajout`]: "user_key_add",
    [`${P}/mes-cles/$keyId/modification`]: "user_key_edit",
    [`${P}/_panneau/tableau-de-bord/entrepots/`]: "datastore_selection",
    [`${P}/_panneau/tableau-de-bord/entrepots/demande-de-creation`]: "datastore_create_request",
    [`${P}/_panneau/rejoindre-des-communautes`]: "join_community",
    [`${P}/demande-acces/$fileIdentifier`]: "accesses_request",
    [`${P}/tableau-de-bord/statistiques-de-consommation`]: "stats_scope_selection",
    [`${P}/tableau-de-bord/communaute/$communityId/_onglets/`]: "community_info",
    [`${P}/tableau-de-bord/communaute/$communityId/_onglets/membres`]: "members_list",
    [`${D}/_onglets/info`]: "community_info",
    [`${D}/_onglets/membres`]: "members_list",
    [`${D}/_onglets/consommation`]: "datastore_manage_storage",
    [`${D}/_onglets/permissions/`]: "datastore_manage_permissions",
    [`${D}/permissions/ajout`]: "datastore_add_permission",
    [`${D}/permissions/$permissionId/modification`]: "datastore_edit_permission",
    [`${D}/_onglets/donnees/`]: "datasheet_list",
    [`${D}/donnees/televersement`]: "datastore_datasheet_upload",
    [`${D}/donnees/integration`]: "datastore_datasheet_upload_integration",
    [`${D}/donnees/$datasheetName`]: "datastore_datasheet_view",
    [`${D}/donnees/$storedDataId/details`]: "datastore_stored_data_details",
    [`${D}/livraisons/$uploadId/rapport`]: "datastore_upload_details",
    [`${D}/service/wfs/ajout`]: "datastore_wfs_service_new",
    [`${D}/service/wfs/$offeringId/modification`]: "datastore_wfs_service_edit",
    [`${D}/service/wms-vecteur/ajout`]: "datastore_wms_vector_service_new",
    [`${D}/service/wms-vecteur/$offeringId/modification`]: "datastore_wms_vector_service_edit",
    [`${D}/pyramide-vecteur/ajout`]: "datastore_pyramid_vector_generate",
    [`${D}/service/tms/ajout`]: "datastore_pyramid_vector_tms_service_new",
    [`${D}/service/tms/$offeringId/modification`]: "datastore_pyramid_vector_tms_service_edit",
    [`${D}/pyramide-raster/ajout`]: "datastore_pyramid_raster_generate",
    [`${D}/service/wms-raster/ajout`]: "datastore_pyramid_raster_wms_raster_service_new",
    [`${D}/service/wms-raster/$offeringId/modification`]: "datastore_pyramid_raster_wms_raster_service_edit",
    [`${D}/service/wmts/ajout`]: "datastore_pyramid_raster_wmts_service_new",
    [`${D}/service/wmts/$offeringId/modification`]: "datastore_pyramid_raster_wmts_service_edit",
    [`${D}/service/$offeringId/visualisation`]: "datastore_service_view",
    [`${D}/service/$offeringId/style/ajout`]: "datastore_service_style_add",
    [`${D}/service/$offeringId/style/$styleTechnicalName/modification`]: "datastore_service_style_edit",
    [`${P}/espace-collaboratif/`]: "espaceco_community_list",
    [`${P}/espace-collaboratif/$communityId/creer-un-guichet`]: "espaceco_create_community",
    [`${P}/espace-collaboratif/$communityId/gerer-le-guichet`]: "espaceco_manage_community",
    [`${P}/espace-collaboratif/$communityId/invitation`]: "espaceco_member_invitation",
} as const;

/** paramètres de chemin et de recherche fusionnés par l’appelant */
export type BreadcrumbRouteParams = {
    datastoreId?: string;
    communityId?: string;
    datasheetName?: string;
    offeringId?: string;
};

/** Flags sandbox dérivés côté hook (appartenance + env) : le module pur ne peut pas les calculer lui-même */
export type BreadcrumbSandboxFlags = {
    datastoreIsSandbox: boolean;
    communityIsSandbox: boolean;
};

const getBreadcrumb = (
    routeId: string | undefined,
    params: BreadcrumbRouteParams,
    datastore: Datastore | undefined,
    community: Community | null | undefined,
    { datastoreIsSandbox, communityIsSandbox }: BreadcrumbSandboxFlags
): BreadcrumbProps | undefined => {
    addBreadcrumbTranslations({
        lang: "fr",
        messages: { home: t("dashboard") },
    });

    const name = breadcrumbNameByRouteId[routeId as keyof typeof breadcrumbNameByRouteId] as
        (typeof breadcrumbNameByRouteId)[keyof typeof breadcrumbNameByRouteId] | undefined;
    const { datastoreId, datasheetName, offeringId } = params;
    const datasheetLink = (activeTab?: "dataset" | "services") => ({
        to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName" as const,
        params: { datastoreId: datastoreId ?? "", datasheetName: datasheetName ?? "" },
        search: activeTab ? { activeTab } : {},
    });

    const dashboardProps: BreadcrumbProps = {
        homeLinkProps: { to: "/tableau-de-bord" },
        segments: [],
        currentPageLabel: t("dashboard"),
    };

    const publishProps: BreadcrumbProps = {
        ...dashboardProps,
        segments: [{ label: t("discover_publish"), linkProps: { to: "/publier-une-donnee" } }],
        currentPageLabel: t("dashboard"),
    };

    const datastoreBaseProps: BreadcrumbProps = {
        ...publishProps,
        segments: [
            ...publishProps.segments,
            { label: t("datastore_selection"), linkProps: { to: "/tableau-de-bord/entrepots" } },
            datastoreId !== undefined && {
                label: tCommon("datastore_name", { name: datastore?.name, isSandbox: datastoreIsSandbox }),
                linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } },
            },
        ].filter(Boolean) as BreadcrumbProps["segments"],
        currentPageLabel: tCommon("datastore_name", { name: datastore?.name, isSandbox: datastoreIsSandbox }) || "",
    };

    const espacecoBaseProps: BreadcrumbProps = {
        ...publishProps,
        segments: [...publishProps.segments, { label: t("espaceco_community_list"), linkProps: { to: "/espace-collaboratif" } }],
    };

    switch (name) {
        case "my_account":
        case "my_access_keys":
        case "my_permissions":
            return { ...dashboardProps, currentPageLabel: t(name) };

        case "datastore_selection":
        case "datastore_create_request":
        case "join_community":
        case "accesses_request":
        case "stats_scope_selection":
            return { ...publishProps, currentPageLabel: t(name) };

        case "user_key_add":
        case "user_key_edit":
            return {
                ...publishProps,
                segments: [...publishProps.segments, { label: t("my_access_keys"), linkProps: { to: "/mes-cles" } }],
                currentPageLabel: t(name),
            };

        case "community_info":
        case "members_list":
            return {
                ...publishProps,
                segments: [
                    ...publishProps.segments,
                    { label: t("datastore_selection"), linkProps: { to: "/tableau-de-bord/entrepots" } },
                    // communauté sans entrepôt : pas de segment plutôt qu’un lien mort
                    datastore !== undefined && {
                        label: community
                            ? tCommon("datastore_name", { name: community.name, isSandbox: communityIsSandbox })
                            : tCommon("datastore_name", { name: datastore.name, isSandbox: datastoreIsSandbox }),
                        linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId: datastore._id } },
                    },
                ].filter(Boolean) as BreadcrumbProps["segments"],
                currentPageLabel: t(name),
            };

        case "datastore_manage_storage":
        case "datastore_manage_permissions":
            return {
                ...datastoreBaseProps,
                currentPageLabel: t(name),
            };

        case "datastore_add_permission":
        case "datastore_edit_permission":
            return {
                ...datastoreBaseProps,
                segments: [
                    ...datastoreBaseProps.segments,
                    {
                        label: t("datastore_manage_permissions"),
                        linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/permissions", params: { datastoreId: datastoreId ?? "" } },
                    },
                ],
                currentPageLabel: t(name),
            };

        case "datasheet_list":
            return {
                ...publishProps,
                segments: [...publishProps.segments, { label: t("datastore_selection"), linkProps: { to: "/tableau-de-bord/entrepots" } }],
                currentPageLabel: tCommon("datastore_name", { name: datastore?.name, isSandbox: datastoreIsSandbox }),
            };

        case "datastore_datasheet_upload": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };

            if (datasheetName) {
                breadcrumbProps.segments.push({ label: datasheetName, linkProps: datasheetLink() });
                breadcrumbProps["currentPageLabel"] = t("upload");
            } else {
                breadcrumbProps["currentPageLabel"] = t("datastore_create_datasheet");
            }
            return breadcrumbProps;
        }
        case "datastore_datasheet_upload_integration": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };

            if (datasheetName) {
                breadcrumbProps.segments.push({ label: datasheetName, linkProps: datasheetLink() });
            }
            return { ...breadcrumbProps, currentPageLabel: t("datastore_datasheet_upload_integration") };
        }
        case "datastore_datasheet_view":
            return { ...datastoreBaseProps, currentPageLabel: datasheetName };
        case "datastore_stored_data_details": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };
            if (datasheetName) {
                breadcrumbProps.segments.push({ label: datasheetName, linkProps: datasheetLink() });
            }
            return { ...breadcrumbProps, currentPageLabel: t("datastore_stored_data_details") };
        }
        case "datastore_upload_details": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };
            if (datasheetName) {
                breadcrumbProps.segments.push({ label: datasheetName, linkProps: datasheetLink() });
            }
            return { ...breadcrumbProps, currentPageLabel: t("datastore_upload_details") };
        }

        case "datastore_wfs_service_new":
        case "datastore_wfs_service_edit":
        case "datastore_wms_vector_service_new":
        case "datastore_wms_vector_service_edit":
        case "datastore_pyramid_vector_generate":
        case "datastore_pyramid_vector_tms_service_new":
        case "datastore_pyramid_vector_tms_service_edit":
        case "datastore_pyramid_raster_generate":
        case "datastore_pyramid_raster_wms_raster_service_new":
        case "datastore_pyramid_raster_wms_raster_service_edit":
        case "datastore_pyramid_raster_wmts_service_new":
        case "datastore_pyramid_raster_wmts_service_edit":
        case "datastore_service_view":
            datastoreBaseProps.segments = [
                ...datastoreBaseProps.segments,
                { label: datasheetName, linkProps: datasheetLink(offeringId !== undefined ? "services" : "dataset") },
            ];
            return { ...datastoreBaseProps, currentPageLabel: t(name) };

        case "datastore_service_style_add":
        case "datastore_service_style_edit":
            datastoreBaseProps.segments = [
                ...datastoreBaseProps.segments,
                { label: datasheetName, linkProps: datasheetLink("services") },
                {
                    label: t("datastore_service_view"),
                    linkProps: {
                        to: "/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation",
                        params: { datastoreId: datastoreId ?? "", offeringId: offeringId ?? "" },
                        search: { datasheetName: datasheetName ?? "" },
                    },
                },
            ];
            return { ...datastoreBaseProps, currentPageLabel: t(name) };

        // espaceco
        case "espaceco_community_list":
            return { ...publishProps, currentPageLabel: t(name) };
        case "espaceco_create_community":
        case "espaceco_manage_community":
        case "espaceco_member_invitation":
            return { ...espacecoBaseProps, currentPageLabel: t(name) };

        default:
            return undefined;
    }
};

export default getBreadcrumb;
