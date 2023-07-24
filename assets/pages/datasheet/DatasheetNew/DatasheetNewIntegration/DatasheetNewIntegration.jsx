import React from "react";
import PropTypes from "prop-types";

import DatasheetNewIntegrationDialog from "./DatasheetNewIntegrationDialog";
import AppLayout from "../../../../components/Layout/AppLayout";

const DatasheetNewIntegration = ({ datastoreId, uploadId }) => {
    return (
        <AppLayout>
            <DatasheetNewIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} />
        </AppLayout>
    );
};

DatasheetNewIntegration.propTypes = {
    datastoreId: PropTypes.string,
    uploadId: PropTypes.string,
};

export default DatasheetNewIntegration;
