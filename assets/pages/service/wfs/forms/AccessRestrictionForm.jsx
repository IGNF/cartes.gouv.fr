import { fr } from "@codegouvfr/react-dsfr";
import React from "react";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

const AccessRestrictionForm = ({ visibility, onPrevious, onValid }) => {
    const {
        // register,
        handleSubmit,
        // formState: { errors },
        getValues: getFormValues,
    } = useForm(/*{ resolver: yupResolver(schema) }*/);

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    return (
        <div className={fr.cx("fr-my-2v")} style={{ display: visibility ? "block" : "none" }}>
            <h3>{Translator.trans("service.wfs.new.access_retrictions.title")}</h3>
            <ButtonsGroup
                className={fr.cx("fr-my-2v")}
                alignment="between"
                buttons={[
                    {
                        children: Translator.trans("previous_step"),
                        iconId: "fr-icon-arrow-left-fill",
                        onClick: onPrevious,
                    },
                    {
                        children: Translator.trans("service.wfs.new.publish"),
                        onClick: handleSubmit(onSubmit),
                    },
                ]}
                inlineLayoutWhen="always"
            />
        </div>
    );
};

AccessRestrictionForm.propTypes = {
    visibility: PropTypes.bool.isRequired,
    onPrevious: PropTypes.func.isRequired,
    // onValid: PropTypes.func.isRequired
    onValid: PropTypes.func,
};

export default AccessRestrictionForm;
