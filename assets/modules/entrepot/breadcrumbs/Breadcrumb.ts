import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Route } from "type-route";

import { Datastore } from "../../../@types/app";
import { getTranslation } from "../../../i18n/i18n";
import { routes } from "../../../router/router";

const { t } = getTranslation("Breadcrumb");

const getBreadcrumb = (route: Route<typeof routes>, datastore?: Datastore): BreadcrumbProps | undefined => {
    const defaultProps: BreadcrumbProps = {
        homeLinkProps: routes.home().link,
        segments: [],
        currentPageLabel: null,
    };

    switch (route.name) {
        case "dashboard_pro":
        case "about":
        case "contact":
        case "faq":
        case "sitemap":
        case "accessibility":
        case "legal_notice":
        case "personal_data":
        case "offer":
        case "join":
        case "terms_of_service":
        case "service_status":
            return { ...defaultProps, currentPageLabel: t(route.name) };

        case "contact_confirmation":
            defaultProps.segments.push({ label: t("contact"), linkProps: routes.contact().link });
            return { ...defaultProps, currentPageLabel: t(route.name) };
        case "news_list":
            return { ...defaultProps, currentPageLabel: t("news") };
        case "news_article":
            // géré dans le composant NewsArticle
            return { ...defaultProps, currentPageLabel: t("news") };

        // case "accesses_request":
        case "my_account":
            defaultProps.segments.push({ label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link });
            return { ...defaultProps, currentPageLabel: t("my_account") };
        case "my_access_keys":
            defaultProps.segments.push({ label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link });
            return { ...defaultProps, currentPageLabel: t("my_access_keys") };
        case "my_permissions":
            defaultProps.segments.push({ label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link });
            return { ...defaultProps, currentPageLabel: t("my_permissions") };

        case "user_key_add":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: t("my_access_keys"), linkProps: routes.my_access_keys().link },
                ],
            ];
            return { ...defaultProps, currentPageLabel: t(route.name) };
        case "user_key_edit":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: t("my_access_keys"), linkProps: routes.my_access_keys().link },
                ],
            ];
            return { ...defaultProps, currentPageLabel: t(route.name) };

        case "datastore_create_request":
            defaultProps.segments.push({ label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link });
            return { ...defaultProps, currentPageLabel: t(route.name) };
        case "datastore_create_request_confirm":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: t("datastore_create_request"), linkProps: routes.datastore_create_request().link },
                ],
            ];
            return { ...defaultProps, currentPageLabel: t(route.name) };

        case "join_community":
            defaultProps.segments.push({ label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link });
            return { ...defaultProps, currentPageLabel: t(route.name) };
        case "members_list":
            // géré dans le composant CommunityMembers
            return { ...defaultProps, currentPageLabel: t(route.name) };

        case "datastore_manage_storage":
        case "datastore_manage_permissions":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
                ],
            ];
            return { ...defaultProps, currentPageLabel: t(route.name) };
        case "datastore_add_permission":
        case "datastore_edit_permission":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
                    {
                        label: t("datastore_manage_permissions"),
                        linkProps: routes.datastore_manage_permissions({ datastoreId: route.params.datastoreId }).link,
                    },
                ],
            ];
            return { ...defaultProps, currentPageLabel: t(route.name) };
        case "datasheet_list":
            defaultProps.segments = [...defaultProps.segments, ...[{ label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link }]];
            return { ...defaultProps, currentPageLabel: datastore?.name };
        case "datastore_datasheet_upload":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
                ],
            ];
            if ("datasheetName" in route.params && route.params.datasheetName) {
                defaultProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
                });
                defaultProps["currentPageLabel"] = t("upload");
            } else {
                defaultProps["currentPageLabel"] = t("datastore_create_datasheet");
            }
            return defaultProps;
        case "datastore_datasheet_upload_integration":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
                ],
            ];
            if ("datasheetName" in route.params && route.params.datasheetName) {
                defaultProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
                });
            }
            return { ...defaultProps, currentPageLabel: t("datastore_datasheet_upload_integration") };
        case "datastore_datasheet_view":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
                ],
            ];
            return { ...defaultProps, currentPageLabel: route.params.datasheetName };
        case "datastore_stored_data_details":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
                ],
            ];
            if ("datasheetName" in route.params && route.params.datasheetName) {
                defaultProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
                });
            }
            return { ...defaultProps, currentPageLabel: t("datastore_stored_data_details") };
        case "datastore_upload_details":
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
                ],
            ];
            if ("datasheetName" in route.params && route.params.datasheetName) {
                defaultProps.segments.push({
                    label: route.params.datasheetName,
                    linkProps: routes.datastore_datasheet_view({ datastoreId: route.params.datastoreId, datasheetName: route.params.datasheetName }).link,
                });
            }
            return { ...defaultProps, currentPageLabel: t("datastore_upload_details") };

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
            defaultProps.segments = [
                ...defaultProps.segments,
                ...[
                    { label: t("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: route.params.datastoreId }).link },
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
            return { ...defaultProps, currentPageLabel: t(route.name) };

        case "home":
        default:
            return undefined;
    }
};

export default getBreadcrumb;
