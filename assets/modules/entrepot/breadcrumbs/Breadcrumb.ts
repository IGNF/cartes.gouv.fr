import { BreadcrumbProps, addBreadcrumbTranslations } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Route } from "type-route";

import { Community, Datastore } from "../../../@types/app";
import { getTranslation } from "../../../i18n/i18n";
import { routes } from "../../../router/router";

const { t } = getTranslation("Breadcrumb");
const { t: tCommon } = getTranslation("Common");

const getBreadcrumb = (route: Route<typeof routes>, datastore?: Datastore, community?: Community | null): BreadcrumbProps | undefined => {
    addBreadcrumbTranslations({
        lang: "fr",
        messages: { home: t("dashboard") },
    });

    const dashboardProps: BreadcrumbProps = {
        homeLinkProps: routes.dashboard().link,
        segments: [],
        currentPageLabel: t("dashboard"),
    };

    const publishProps: BreadcrumbProps = {
        ...dashboardProps,
        segments: [{ label: t("discover_publish"), linkProps: routes.discover_publish().link }],
        currentPageLabel: t("dashboard"),
    };

    const datastoreBaseProps: BreadcrumbProps = {
        ...publishProps,
        segments: [
            ...publishProps.segments,
            { label: t("datastore_selection"), linkProps: routes.datastore_selection().link },
            "datastoreId" in route.params && {
                label: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name,
                linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link,
            },
        ].filter(Boolean) as BreadcrumbProps["segments"],
        currentPageLabel: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name || "",
    };

    const espacecoBaseProps: BreadcrumbProps = {
        ...publishProps,
        segments: [...publishProps.segments, { label: t("espaceco_community_list"), linkProps: routes.espaceco_community_list().link }],
    };

    switch (route.name) {
        case "sitemap":
        case "accessibility":
        case "legal_notice":
        case "personal_data":
        case "offers":
        case "join_cartesgouvfr_community":
        case "terms_of_service":
        case "service_status":
        case "news_list":
        case "news_list_by_tag":
            addBreadcrumbTranslations({
                lang: "fr",
                messages: { home: "Accueil" },
            });
            return { homeLinkProps: routes.discover().link, segments: [], currentPageLabel: t(route.name) };
        // case "news_article":
        //     // géré dans le composant NewsArticle
        // case "service_status":
        //     return { ...defaultProps, currentPageLabel: t(route.name) };

        // case "news_list":
        // case "news_list_by_tag":
        //     return { ...defaultProps, currentPageLabel: t("news") };
        // case "news_article":
        //     // géré dans le composant NewsArticle
        //     return { ...defaultProps, currentPageLabel: t("news") };

        // case "dashboard":
        //     return { ...dashboardProps, segments: [], currentPageLabel: t(route.name) };

        // case "accesses_request":
        case "my_account":
        case "my_access_keys":
        case "my_permissions":
            return { ...dashboardProps, currentPageLabel: t(route.name) };

        case "datastore_selection":
        case "datastore_create_request":
        case "join_community":
        case "accesses_request":
            return { ...publishProps, currentPageLabel: t(route.name) };

        case "user_key_add":
        case "user_key_edit":
            return {
                ...publishProps,
                segments: [...publishProps.segments, { label: t("my_access_keys"), linkProps: routes.my_access_keys().link }],
                currentPageLabel: t(route.name),
            };

        case "community_info":
        case "members_list":
            return {
                ...publishProps,
                segments: [
                    ...publishProps.segments,
                    { label: t("datastore_selection"), linkProps: routes.datastore_selection().link },
                    "communityId" in route.params &&
                        community !== undefined && {
                            label: community?.is_sandbox === true ? tCommon("sandbox") : community?.name,
                            linkProps: routes.datasheet_list({ datastoreId: datastore?._id ?? "XXXX" }).link,
                        },
                ].filter(Boolean) as BreadcrumbProps["segments"],
                currentPageLabel: t(route.name),
            };

        case "datastore_manage_storage":
        case "datastore_manage_permissions":
            return {
                ...datastoreBaseProps,
                currentPageLabel: t(route.name),
            };

        case "datastore_add_permission":
        case "datastore_edit_permission":
            return {
                ...datastoreBaseProps,
                segments: [
                    ...datastoreBaseProps.segments,
                    {
                        label: t("datastore_manage_permissions"),
                        linkProps: routes.datastore_manage_permissions({ datastoreId: route.params.datastoreId }).link,
                    },
                ],
                currentPageLabel: t(route.name),
            };

        case "datasheet_list":
            return {
                ...publishProps,
                segments: [...publishProps.segments, { label: t("datastore_selection"), linkProps: routes.datastore_selection().link }],
                currentPageLabel: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name,
            };

        case "datastore_datasheet_upload": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };

            if ("datasheetName" in route.params && route.params.datasheetName) {
                breadcrumbProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
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

            if ("datasheetName" in route.params && route.params.datasheetName) {
                breadcrumbProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
                });
            }
            return { ...breadcrumbProps, currentPageLabel: t("datastore_datasheet_upload_integration") };
        }
        case "datastore_datasheet_view":
            return { ...datastoreBaseProps, currentPageLabel: route.params.datasheetName };
        case "datastore_stored_data_details": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };
            if ("datasheetName" in route.params && route.params.datasheetName) {
                breadcrumbProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
                });
            }
            return { ...breadcrumbProps, currentPageLabel: t("datastore_stored_data_details") };
        }
        case "datastore_upload_details": {
            const breadcrumbProps: BreadcrumbProps = {
                ...datastoreBaseProps,
            };
            if ("datasheetName" in route.params && route.params.datasheetName) {
                breadcrumbProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
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
                        label: route.params.datasheetName,
                        linkProps: routes.datastore_datasheet_view({
                            datastoreId: route.params.datastoreId,
                            datasheetName: route.params.datasheetName,
                            activeTab: "offeringId" in route.params ? "services" : "dataset",
                        }).link,
                    },
                ],
            ];
            return { ...datastoreBaseProps, currentPageLabel: t(route.name) };

        case "datastore_service_style_add":
        case "datastore_service_style_edit":
            datastoreBaseProps.segments = [
                ...datastoreBaseProps.segments,
                ...[
                    {
                        label: route.params.datasheetName,
                        linkProps: routes.datastore_datasheet_view({
                            datastoreId: route.params.datastoreId,
                            datasheetName: route.params.datasheetName,
                            activeTab: "offeringId" in route.params ? "services" : "dataset",
                        }).link,
                    },
                    {
                        label: t("datastore_service_view"),
                        linkProps: routes.datastore_service_view({
                            datastoreId: route.params.datastoreId,
                            datasheetName: route.params.datasheetName,
                            offeringId: route.params.offeringId,
                        }).link,
                    },
                ],
            ];
            return { ...datastoreBaseProps, currentPageLabel: t(route.name) };

        // espaceco
        case "espaceco_community_list":
            return { ...publishProps, currentPageLabel: t(route.name) };
        case "espaceco_create_community":
        case "espaceco_manage_community":
        case "espaceco_member_invitation":
            return { ...espacecoBaseProps, currentPageLabel: t(route.name) };

        default:
            return undefined;
    }
};

export default getBreadcrumb;
