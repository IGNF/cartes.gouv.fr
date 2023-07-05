import { fr } from "@codegouvfr/react-dsfr";
import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";

import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/src/tagify.scss";
import "./../../sass/components/tagify.scss";
import { symToStr } from "tsafe/symToStr";

const TagifyComponent = forwardRef((props, ref) => {
    const { name, label, hintText, whiteList, enforceWhitelist = false, defaultValue = [], errorMessage = "", onChange } = props;

    const settings = {
        //maxTags: maxTags,
        enforceWhitelist: enforceWhitelist,
        autoComplete: {
            enabled: true,
        },
        dropdown: {
            enabled: 1,
            position: "text",
            closeOnSelect: false,
            highlightFirst: true,
        },
    };

    const tagifyRef = useRef();

    const [state, setState] = useState("default");
    const [values, setValues] = useState([]);

    useImperativeHandle(ref, () => ({
        checkValidity() {
            const b = values.length ? true : false;
            setState(b ? "default" : "error");
            return b;
        },
        getName() {
            return tagifyRef.current.DOM.originalInput.name;
        },
        getValues() {
            return values;
        },
    }));

    const handleOnChange = () => {
        let v = tagifyRef.current.value.map((item) => item.value);
        setValues(v);
        onChange?.(v);
        if (v.length) setState("default");
    };

    return (
        <div
            ref={ref}
            className={fr.cx(
                "fr-input-group",
                (() => {
                    switch (state) {
                        case "error":
                            return "fr-input-group--error";
                        /*case "success":
                                return "fr-input-group--valid"; */
                        case "default":
                            return undefined;
                    }
                })()
            )}
        >
            <label className="fr-label">
                {label}
                <span className="fr-hint-text">{hintText}</span>
            </label>
            <Tags
                tagifyRef={tagifyRef}
                name={name}
                onChange={handleOnChange}
                whitelist={whiteList}
                defaultValue={defaultValue}
                settings={settings}
                autoFocus={true}
            />
            {state !== "default" && errorMessage && (
                <p
                    className={fr.cx(
                        (() => {
                            switch (state) {
                                case "error":
                                    return "fr-error-text";
                                case "success":
                                    return "fr-valid-text";
                            }
                        })()
                    )}
                >
                    {errorMessage}
                </p>
            )}
        </div>
    );
});

TagifyComponent.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string.isRequired,
    hintText: PropTypes.string.isRequired,
    whiteList: PropTypes.arrayOf(PropTypes.string).isRequired,
    enforceWhitelist: PropTypes.bool,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    errorMessage: PropTypes.string,
    onChange: PropTypes.func,
};

TagifyComponent.displayName = symToStr({ TagifyComponent });

export default TagifyComponent;
