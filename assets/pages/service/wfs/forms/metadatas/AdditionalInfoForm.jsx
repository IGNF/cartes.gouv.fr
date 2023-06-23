import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { languages, charsets } from "../../../../../utils";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";


const schema = yup
    .object({
        data_language: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.language_error")),
        data_charset: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.charset_error")),
        data_projection: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.projection_error")),
        data_encoding: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.encoding_error"))
    }).required();


const AdditionalInfoForm = ({ storedData, visibility, onPrevious, onValid }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues
    } = useForm({ resolver: yupResolver(schema) });
    
    const onSubmit = formData => {
        console.log(formData);
        onValid(formData);
        const values = getFormValues();
        onValid(values);
    };

    return (
        <div className={fr.cx("fr-my-2v")} style={{ display: visibility ? "block" : "none"}}> 
            <h3>{Translator.trans("service.wfs.new.additional_information_form.metadata_information_title")}</h3>
            <Select
                label={Translator.trans("service.wfs.new.additional_information_form.language")}
                hint={Translator.trans("service.wfs.new.additional_information_form.hint_language")}
                state={errors.data_language ? "error" : "default"}
                stateRelatedMessage={errors?.data_language?.message}
                nativeSelectProps={{
                    ...register("data_language"),
                    value: ""
                }}
            >
                <option value="" disabled hidden>Selectionnez une option</option>
                {Object.keys(languages).map((language, index) => {
                    return (
                        <option key={index} value={language}>{languages[language]}</option>
                    );
                })}
            </Select> 
            <h3>{Translator.trans("service.wfs.new.additional_information_form.type_of_spatial_representation_title")}</h3>
            <ButtonsGroup
                className={fr.cx("fr-my-2v")}
                alignment="between"
                buttons={[
                    {
                        children: Translator.trans("previous_step"),
                        iconId: "fr-icon-arrow-left-fill",
                        onClick: onPrevious
                    },
                    {
                        children: Translator.trans("continue"),
                        onClick: handleSubmit(onSubmit)
                    }
                ]}
                inlineLayoutWhen="always"
            />  
        </div>
    );
};

AdditionalInfoForm.propTypes = {
    storedData: PropTypes.object.isRequired,
    visibility: PropTypes.bool.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onValid: PropTypes.func.isRequired
};

export default AdditionalInfoForm;