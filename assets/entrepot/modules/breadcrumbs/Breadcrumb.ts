import { BreadcrumbProps, addBreadcrumbTranslations } from "@codegouvfr/react-dsfr/Breadcrumb";

import { Community, Datastore } from "@/@types/app";
import { getTranslation } from "@/i18n/i18n";

const { t } = getTranslation("Breadcrumb");
const { t: tCommon } = getTranslation("Common");

// Nom historique de la route (= clé i18n du fil d'Ariane), dérivé de l'id de route TanStack
const breadcrumbNameByRouteId = {
    "/_private/mon-compte": "my_account",
    "/_private/mes-cles/": "my_access_keys",
    "/_private/mes-permissions": "my_permissions",
    "/_private/mes-cles/ajout": "user_key_add",
    "/_private/mes-cles/$keyId/modification": "user_key_edit",
    "/_private/tableau-de-bord/entrepots/": "datastore_selection",
    "/_private/tableau-de-bord/entrepots/demande-de-creation": "datastore_create_request",
    "/_private/rejoindre-des-communautes": "join_community",
    "/_private/demande-acces/$fileIdentifier": "accesses_request",
    "/_private/tableau-de-bord/communaute/$communityId/": "community_info",
    "/_private/tableau-de-bord/communaute/$communityId/membres": "members_list",
    "/_private/tableau-de-bord/entrepots/$datastoreId/consommation": "datastore_manage_storage",
    "/_private/tableau-de-bord/entrepots/$datastoreId/permissions/": "datastore_manage_permissions",
    "/_private/tableau-de-bord/entrepots/$datastoreId/permissions/ajout": "datastore_add_permission",
    "/_private/tableau-de-bord/entrepots/$datastoreId/permissions/$permissionId/modification": "datastore_edit_permission",
    "/_private/tableau-de-bord/entrepots/$datastoreId/donnees/": "datasheet_list",
    "/_private/tableau-de-bord/entrepots/$datastoreId/donnees/televersement": "datastore_datasheet_upload",
    "/_private/tableau-de-bord/entrepots/$datastoreId/donnees/integration": "datastore_datasheet_upload_integration",
    "/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName": "datastore_datasheet_view",
    "/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$storedDataId/details": "datastore_stored_data_details",
    "/_private/tableau-de-bord/entrepots/$datastoreId/livraisons/$uploadId/rapport": "datastore_upload_details",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wfs/ajout": "datastore_wfs_service_new",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wfs/$offeringId/modification": "datastore_wfs_service_edit",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-vecteur/ajout": "datastore_wms_vector_service_new",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-vecteur/$offeringId/modification": "datastore_wms_vector_service_edit",
    "/_private/tableau-de-bord/entrepots/$datastoreId/pyramide-vecteur/ajout": "datastore_pyramid_vector_generate",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/tms/ajout": "datastore_pyramid_vector_tms_service_new",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/tms/$offeringId/modification": "datastore_pyramid_vector_tms_service_edit",
    "/_private/tableau-de-bord/entrepots/$datastoreId/pyramide-raster/ajout": "datastore_pyramid_raster_generate",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-raster/ajout": "datastore_pyramid_raster_wms_raster_service_new",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wms-raster/$offeringId/modification": "datastore_pyramid_raster_wms_raster_service_edit",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wmts/ajout": "datastore_pyramid_raster_wmts_service_new",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/wmts/$offeringId/modification": "datastore_pyramid_raster_wmts_service_edit",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation": "datastore_service_view",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/style/ajout": "datastore_service_style_add",
    "/_private/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/style/$styleTechnicalName/modification": "datastore_service_style_edit",
    "/_private/espace-collaboratif/": "espaceco_community_list",
    "/_private/espace-collaboratif/$communityId/creer-un-guichet": "espaceco_create_community",
    "/_private/espace-collaboratif/$communityId/gerer-le-guichet": "espaceco_manage_community",
    "/_private/espace-collaboratif/$communityId/invitation": "espaceco_member_invitation",
} as const;

type BreadcrumbRouteName = (typeof breadcrumbNameByRouteId)[keyof typeof breadcrumbNameByRouteId];

// Params path et search fusionnés par l'appelant (le fil d'Ariane lit les deux, comme type-route fusionnait params et query)
export type BreadcrumbRouteParams = {
    datastoreId?: string;
    communityId?: string;
    datasheetName?: string;
    offeringId?: string;
};

const getBreadcrumb = (
    routeId: string | undefined,
    params: BreadcrumbRouteParams,
    datastore?: Datastore,
    community?: Community | null
): BreadcrumbProps | undefined => {
    addBreadcrumbTranslations({
        lang: "fr",
        messages: { home: t("dashboard") },
    });

    const name: BreadcrumbRouteName | undefined = routeId !== undefined ? breadcrumbNameByRouteId[routeId as keyof typeof breadcrumbNameByRouteId] : undefined;
    const { datastoreId, datasheetName, offeringId } = params;

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
                label: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name,
                linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } },
            },
        ].filter(Boolean) as BreadcrumbProps["segments"],
        currentPageLabel: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name || "",
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
                    // communauté sans entrepôt : pas de segment plutôt qu'un lien mort vers un datastore fictif
                    params.communityId !== undefined &&
                        community !== undefined &&
                        datastore !== undefined && {
                            label: community?.is_sandbox === true ? tCommon("sandbox") : community?.name,
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
                        linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/permissions", params: { datastoreId: datastoreId ?? "XXXX" } },
                    },
                ],
                currentPageLabel: t(name),
            };

        case "datasheet_list":
            return {
                ...publishProps,
                segments: [...publishProps.segments, { label: t("datastore_selection"), linkProps: { to: "/tableau-de-bord/entrepots" } }],
                currentPageLabel: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name,
            };

        case "datastore_datasheet_upload": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };

            if (datastoreId !== undefined && datasheetName) {
                breadcrumbProps.segments.push({
                    label: datasheetName,
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName", params: { datastoreId, datasheetName } },
                });
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

            if (datastoreId !== undefined && datasheetName) {
                breadcrumbProps.segments.push({
                    label: datasheetName,
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName", params: { datastoreId, datasheetName } },
                });
            }
            return { ...breadcrumbProps, currentPageLabel: t("datastore_datasheet_upload_integration") };
        }
        case "datastore_datasheet_view":
            return { ...datastoreBaseProps, currentPageLabel: datasheetName };
        case "datastore_stored_data_details": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };
            if (datastoreId !== undefined && datasheetName) {
                breadcrumbProps.segments.push({
                    label: datasheetName,
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName", params: { datastoreId, datasheetName } },
                });
            }
            return { ...breadcrumbProps, currentPageLabel: t("datastore_stored_data_details") };
        }
        case "datastore_upload_details": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };
            if (datastoreId !== undefined && datasheetName) {
                breadcrumbProps.segments.push({
                    label: datasheetName,
                    linkProps: { to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName", params: { datastoreId, datasheetName } },
                });
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
                ...[
                    {
                        label: datasheetName,
                        linkProps: {
                            to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName" as const,
                            params: { datastoreId: datastoreId ?? "XXXX", datasheetName: datasheetName ?? "XXXX" },
                            search: { activeTab: offeringId !== undefined ? "services" : "dataset" },
                        },
                    },
                ],
            ];
            return { ...datastoreBaseProps, currentPageLabel: t(name) };

        case "datastore_service_style_add":
        case "datastore_service_style_edit":
            datastoreBaseProps.segments = [
                ...datastoreBaseProps.segments,
                ...[
                    {
                        label: datasheetName,
                        linkProps: {
                            to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName" as const,
                            params: { datastoreId: datastoreId ?? "XXXX", datasheetName: datasheetName ?? "XXXX" },
                            search: { activeTab: "services" },
                        },
                    },
                    {
                        label: t("datastore_service_view"),
                        linkProps: {
                            to: "/tableau-de-bord/entrepots/$datastoreId/service/$offeringId/visualisation" as const,
                            params: { datastoreId: datastoreId ?? "XXXX", offeringId: offeringId ?? "XXXX" },
                            search: { datasheetName: datasheetName ?? "XXXX" },
                        },
                    },
                ],
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
