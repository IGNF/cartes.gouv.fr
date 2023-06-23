import { fr } from "@codegouvfr/react-dsfr";
import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";

import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/src/tagify.scss";
import "./../../sass/components/tagify.scss";
import { symToStr } from "tsafe/symToStr";

const TagifyComponent = forwardRef((props, ref) => {
    const {
        label, 
        hintText, 
        errorMessage,
        whiteList,
        name,
    } = props;

    const settings = {
        //maxTags: maxTags,
        enforceWhitelist: true,
        autoComplete: {
            enabled: true
        },
        dropdown : {
            enabled: 1,
            position: "text", 
            closeOnSelect: false,
            highlightFirst: true
        }
    };

    const tagifyRef = useRef();

    const [state, setState] = useState("default");
    const [values, setValues] = useState([]);
   
    useImperativeHandle(ref, () => ({
        checkValidity() {
            const b = values.length ? true: false;
            setState(b ? "default" : "error");
            return b;
        },
        getValues() {
            return values;
        }
    }));

    const onChange = () => {
        let v = tagifyRef.current.value.map(item => item.value);
        setValues(v);
        if (v.length) setState("default");
    };

    return (
        <div 
            ref={ref}
            className={
                fr.cx("fr-input-group",
                    (() => {
                        switch (state) {
                            case "error":
                                return "fr-input-group--error";
                            case "success":
                                return "fr-input-group--valid";
                            case "default":
                                return undefined;
                        }
                    })()
                )
            }
        >
            <label className="fr-label">{label}
                <span className="fr-hint-text">{hintText}</span>
            </label>
            <Tags
                tagifyRef={tagifyRef}
                name={name}
                onChange={onChange}
                whitelist={whiteList}
                settings={settings}
                autoFocus={true}
            />
            {state !== "default" && (
                <p
                    className={
                        fr.cx(
                            (() => {
                                switch (state) {
                                    case "error":
                                        return "fr-error-text";
                                    case "success":
                                        return "fr-valid-text";
                                }
                            })()
                        )
                    }
                >
                    {errorMessage}
                </p>
            )}
        </div>
    );
});

TagifyComponent.propTypes = {
    label: PropTypes.string.isRequired,
    hintText: PropTypes.string.isRequired,
    errorMessage: PropTypes.string.isRequired,
    //tagifyRef: PropTypes.object.isRequired,
    /*maxTags: PropTypes.number.isRequired, */
    whiteList: PropTypes.arrayOf(PropTypes.string).isRequired,
    name: PropTypes.string.isRequired,
};

TagifyComponent.displayName = symToStr({TagifyComponent});

export default TagifyComponent;
