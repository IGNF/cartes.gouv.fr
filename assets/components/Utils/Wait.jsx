import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React from "react";

const Wait = ({ children, show }) => {
    return (
        show && (
            <div
                style={{
                    position: "fixed",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    zIndex: 1000,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "white",
                    }}
                >
                    <div className={fr.cx("fr-container", "fr-p-2w")}>{children}</div>
                </div>
            </div>
        )
    );
};

Wait.propTypes = {
    children: PropTypes.node,
    show: PropTypes.bool,
};

export default Wait;
