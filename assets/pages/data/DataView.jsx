import PropTypes from "prop-types";
import React from "react";

const DataView = ({ dataName }) => {
    return (
        <div>
            <h2>{dataName}</h2>
        </div>
    );
};

DataView.propTypes = {
    dataName: PropTypes.string.isRequired,
};

export default DataView;
