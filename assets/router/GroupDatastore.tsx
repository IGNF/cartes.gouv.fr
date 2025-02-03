import { lazy, useMemo } from "react";
import { Route } from "type-route";

import { groups } from "./router";
import DatastoreLayout, { DatastoreLayoutProps } from "../components/Layout/DatastoreLayout";
import PageNotFoundWithLayout from "../pages/error/PageNotFoundWithLayout";

const DatastoreManageStorage = lazy(() => import("../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage"));
const DatastoreManagePermissions = lazy(() => import("../entrepot/pages/datastore/ManagePermissions/DatastoreManagePermissions"));
const AddPermissionForm = lazy(() => import("../entrepot/pages/datastore/ManagePermissions/AddPermissionForm"));
const EditPermissionForm = lazy(() => import("../entrepot/pages/datastore/ManagePermissions/EditPermissionForm"));
const DatasheetList = lazy(() => import("../entrepot/pages/datasheet/DatasheetList/DatasheetList"));
const DatasheetUploadForm = lazy(() => import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm/DatasheetUploadForm"));
const DatasheetUploadIntegrationPage = lazy(() => import("../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadIntegration/DatasheetUploadIntegrationPage"));
const DatasheetView = lazy(() => import("../entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView"));
const StoredDataDetails = lazy(() => import("../entrepot/pages/data_details/StoredDataDetails"));
const UploadDetails = lazy(() => import("../entrepot/pages/data_details/UploadDetails"));
const WfsServiceForm = lazy(() => import("../entrepot/pages/service/wfs/WfsServiceForm"));
const WmsVectorServiceForm = lazy(() => import("../entrepot/pages/service/wms-vector/WmsVectorServiceForm"));
const PyramidVectorGenerateForm = lazy(() => import("../entrepot/pages/service/tms/PyramidVectorGenerateForm/PyramidVectorGenerateForm"));
const PyramidVectorTmsServiceForm = lazy(() => import("../entrepot/pages/service/tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm"));
const PyramidRasterGenerateForm = lazy(() => import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterGenerateForm/PyramidRasterGenerateForm"));
const PyramidRasterWmsRasterServiceForm = lazy(
    () => import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmsRasterServiceForm/PyramidRasterWmsRasterServiceForm")
);
const PyramidRasterWmtsServiceForm = lazy(() => import("../entrepot/pages/service/wms-raster-wmts/PyramidRasterWmtsServiceForm/PyramidRasterWmtsServiceForm"));
const ServiceView = lazy(() => import("../entrepot/pages/service/view/ServiceView"));

interface IGroupDatastoreProps {
    route: Route<typeof groups.datastore>;
}

function GroupDatastore(props: IGroupDatastoreProps) {
    const { route } = props;

    const content: { render: JSX.Element; layoutProps?: Omit<DatastoreLayoutProps, "datastoreId"> } = useMemo(() => {
        switch (route.name) {
            case "datastore_manage_storage":
                return {
                    render: <DatastoreManageStorage />,
                };
            case "datastore_manage_permissions":
                return {
                    render: <DatastoreManagePermissions datastoreId={route.params.datastoreId} />,
                };
            case "datastore_add_permission":
                return { render: <AddPermissionForm datastoreId={route.params.datastoreId} /> };
            case "datastore_edit_permission":
                return {
                    render: <EditPermissionForm datastoreId={route.params.datastoreId} permissionId={route.params.permissionId} />,
                };
            case "datasheet_list":
                return {
                    render: <DatasheetList datastoreId={route.params.datastoreId} />,
                };
            case "datastore_datasheet_upload":
                return {
                    render: <DatasheetUploadForm datastoreId={route.params.datastoreId} />,
                };
            case "datastore_datasheet_upload_integration":
                return {
                    render: (
                        <DatasheetUploadIntegrationPage
                            datastoreId={route.params.datastoreId}
                            uploadId={route.params.uploadId}
                            datasheetName={route.params.datasheetName}
                        />
                    ),
                };
            case "datastore_datasheet_view":
                return {
                    render: <DatasheetView datastoreId={route.params.datastoreId} datasheetName={route.params.datasheetName} />,
                };
            case "datastore_stored_data_details":
                return {
                    render: <StoredDataDetails datastoreId={route.params.datastoreId} storedDataId={route.params.storedDataId} />,
                };
            case "datastore_upload_details":
                return {
                    render: <UploadDetails datastoreId={route.params.datastoreId} uploadId={route.params.uploadId} />,
                };
            case "datastore_wfs_service_new":
                return {
                    render: <WfsServiceForm datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />,
                };
            case "datastore_wfs_service_edit":
                return {
                    render: <WfsServiceForm datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} offeringId={route.params.offeringId} />,
                };
            case "datastore_wms_vector_service_new":
                return {
                    render: <WmsVectorServiceForm datastoreId={route.params.datastoreId} vectorDbId={route.params.vectorDbId} />,
                };
            case "datastore_wms_vector_service_edit":
                return {
                    render: (
                        <WmsVectorServiceForm
                            datastoreId={route.params.datastoreId}
                            vectorDbId={route.params.vectorDbId}
                            offeringId={route.params.offeringId}
                        />
                    ),
                };
            case "datastore_pyramid_vector_generate":
                return {
                    render: (
                        <PyramidVectorGenerateForm
                            datastoreId={route.params.datastoreId}
                            vectorDbId={route.params.vectorDbId}
                            technicalName={route.params.technicalName}
                        />
                    ),
                };
            case "datastore_pyramid_vector_tms_service_new":
                return {
                    render: <PyramidVectorTmsServiceForm datastoreId={route.params.datastoreId} pyramidId={route.params.pyramidId} />,
                };
            case "datastore_pyramid_vector_tms_service_edit":
                return {
                    render: (
                        <PyramidVectorTmsServiceForm
                            datastoreId={route.params.datastoreId}
                            pyramidId={route.params.pyramidId}
                            offeringId={route.params.offeringId}
                        />
                    ),
                };
            case "datastore_pyramid_raster_generate":
                return {
                    render: (
                        <PyramidRasterGenerateForm
                            datastoreId={route.params.datastoreId}
                            offeringId={route.params.offeringId}
                            datasheetName={route.params.datasheetName}
                        />
                    ),
                };
            case "datastore_pyramid_raster_wms_raster_service_new":
                return {
                    render: (
                        <PyramidRasterWmsRasterServiceForm
                            datastoreId={route.params.datastoreId}
                            pyramidId={route.params.pyramidId}
                            datasheetName={route.params.datasheetName}
                        />
                    ),
                };
            case "datastore_pyramid_raster_wms_raster_service_edit":
                return {
                    render: (
                        <PyramidRasterWmsRasterServiceForm
                            datastoreId={route.params.datastoreId}
                            pyramidId={route.params.pyramidId}
                            datasheetName={route.params.datasheetName}
                            offeringId={route.params.offeringId}
                        />
                    ),
                };
            case "datastore_pyramid_raster_wmts_service_new":
                return {
                    render: (
                        <PyramidRasterWmtsServiceForm
                            datastoreId={route.params.datastoreId}
                            pyramidId={route.params.pyramidId}
                            datasheetName={route.params.datasheetName}
                        />
                    ),
                };
            case "datastore_pyramid_raster_wmts_service_edit":
                return {
                    render: (
                        <PyramidRasterWmtsServiceForm
                            datastoreId={route.params.datastoreId}
                            pyramidId={route.params.pyramidId}
                            datasheetName={route.params.datasheetName}
                            offeringId={route.params.offeringId}
                        />
                    ),
                };
            case "datastore_service_view":
                return {
                    render: (
                        <ServiceView datastoreId={route.params.datastoreId} offeringId={route.params.offeringId} datasheetName={route.params.datasheetName} />
                    ),
                };
        }
    }, [route]);

    if (!content) {
        return <PageNotFoundWithLayout />;
    }

    return (
        <DatastoreLayout datastoreId={route.params.datastoreId} {...content?.layoutProps}>
            {content.render}
        </DatastoreLayout>
    );
}

export default GroupDatastore;
