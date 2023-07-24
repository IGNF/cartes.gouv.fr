import React from "react";
import PropTypes from "prop-types";

import DataNewIntegrationDialog from "./DataNewIntegrationDialog";
import AppLayout from "../../../../components/Layout/AppLayout";

const DataNewIntegration = ({ datastoreId, uploadId }) => {
    return (
        <AppLayout>
            <DataNewIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} />
        </AppLayout>
    );
};

DataNewIntegration.propTypes = {
    datastoreId: PropTypes.string,
    uploadId: PropTypes.string,
};

export default DataNewIntegration;
