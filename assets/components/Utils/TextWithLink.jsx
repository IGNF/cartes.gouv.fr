import React from "react";
import PropTypes from "prop-types";

const TextWithLink = ({ text, linkText, linkRef }) => {
    return (
        <>
            {text}&nbsp;
            <a href={linkRef} target="_blank" title={linkText + " - ouvre une nouvelle fenêtre"} rel="noreferrer">
                {linkText}
            </a>
        </>
    );
};

TextWithLink.propTypes = {
    text: PropTypes.string.isRequired,
    linkText: PropTypes.string.isRequired,
    linkRef: PropTypes.string.isRequired,
};

export default TextWithLink;
