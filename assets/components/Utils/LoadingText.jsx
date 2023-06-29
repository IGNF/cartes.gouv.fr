import React from "react";
import PropTypes from "prop-types";

const LoadingText = ({ message }) => {
    return (
        <>
            <h2>{message ? message : "Chargement..."}</h2>
        </>
    );
};

LoadingText.propTypes = {
    message: PropTypes.string,
};

export default LoadingText;
