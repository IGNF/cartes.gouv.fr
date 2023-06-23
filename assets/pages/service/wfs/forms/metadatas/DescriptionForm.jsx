import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Tagify from "@yaireo/tagify";
import "@yaireo/tagify/src/tagify.scss";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { removeDiacritics } from "../../../../../utils";
import { format as datefnsFormat } from "date-fns";
import TagifyComponent from "../../../../../components/Utils/TagifyComponent";

// Themes et mot cles INSPIRE
import inspireKeywords from "./../../../../../data/thematic-inspire.json";

const schema = yup
    .object({
        data_technical_name: yup.string().required(Translator.trans("service.wfs.new.description_form.technical_name_error")),
        data_public_name: yup.string().required(Translator.trans("service.wfs.new.description_form.public_name_error")),
        data_description: yup.string().required(Translator.trans("service.wfs.new.description_form.description_error")),
        data_identifier: yup.string().required(Translator.trans("service.wfs.new.description_form.identifier_error")),
        data_email_contact: yup.string()
            .email(Translator.trans("service.wfs.new.description_form.email_contact_error"))
            .required(Translator.trans("service.wfs.new.description_form.email_contact_mandatory_error")),
        data_creation_date: yup.date().required(Translator.trans("service.wfs.new.description_form.creation_date_error")),
        data_organization: yup.string().required(Translator.trans("service.wfs.new.description_form.organization_error")),
        data_organization_email: yup.string()
            .email(Translator.trans("service.wfs.new.description_form.organization_email_error"))
            .required(Translator.trans("service.wfs.new.description_form.organization_email_mandatory_error"))
    }).required();


const DescriptionForm = ({ storedDataName, visibility, onPrevious, onValid }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue: setFormValue,
        getValues: getFormValues
    } = useForm({ resolver: yupResolver(schema) });
        
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");
        setFormValue("data_technical_name", nice);
        setFormValue("data_public_name", storedDataName);

        const now = datefnsFormat(new Date(), "yyyy-MM-dd");
        setFormValue("data_creation_date", now);

        let words = [];
        for (let theme in inspireKeywords) {
            if (Array.isArray(inspireKeywords[theme]) && inspireKeywords[theme].length) {
                words = [...words, ...inspireKeywords[theme]]   ; 
            }
        }
        setKeywords(words);
    },[]);

    const tagifyRef = useRef();

    const onSubmit = () => {
        const values = getFormValues();
        if (tagifyRef.current.checkValidity()) {
            const name = tagifyRef.current.name;
            values[name] = tagifyRef.current.getValues();
            onValid(values);
        }
    };

    return (
        <div className={fr.cx("fr-my-2v")} style={{ display: visibility ? "block" : "none"}}> 
            <h3>{Translator.trans("service.wfs.new.description_form.description_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.description_form.technical_name")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_technical_name")}
                state={errors.data_technical_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_technical_name?.message}
                nativeInputProps={{
                    ...register("data_technical_name")
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.public_name")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_public_name")}
                state={errors.data_public_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_public_name?.message}
                nativeInputProps={{
                    ...register("data_public_name")
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.description")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_description")}
                state={errors.data_description ? "error" : "default"}
                stateRelatedMessage={errors?.data_description?.message}
                textArea={true}
                nativeTextAreaProps={{
                    ...register("data_description")
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.identifier")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_identifier")}
                state={errors.data_identifier ? "error" : "default"}
                stateRelatedMessage={errors?.data_identifier?.message}
                nativeInputProps={{
                    ...register("data_identifier")
                }}
            />
            <TagifyComponent 
                ref={tagifyRef}
                name={"data_category"}
                label={Translator.trans("service.wfs.new.description_form.category")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_category")}
                errorMessage={Translator.trans("service.wfs.new.description_form.category_error")}
                whiteList={keywords}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.email_contact")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_email_contact")}
                state={errors.data_email_contact ? "error" : "default"}
                stateRelatedMessage={errors?.data_email_contact?.message}
                nativeInputProps={{
                    ...register("data_email_contact")
                }}
            />
            <h3>{Translator.trans("service.wfs.new.description_form.time_reference_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.description_form.creation_date")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_creation_date")}
                state={errors.data_creation_date ? "error" : "default"}
                stateRelatedMessage={errors?.data_creation_date?.message}
                nativeInputProps={{
                    ...register("data_creation_date"),
                    type: "date"
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.resource_genealogy")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_resource_genealogy")}
                state={errors.data_resource_genealogy ? "error" : "default"}
                stateRelatedMessage={errors?.data_resource_genealogy?.message}
                nativeInputProps={{
                    ...register("data_resource_genealogy")
                }}
            />
            <h3>{Translator.trans("service.wfs.new.description_form.resource_manager_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.description_form.organization")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_organization")}
                state={errors.data_organization ? "error" : "default"}
                stateRelatedMessage={errors?.data_organization?.message}
                nativeInputProps={{
                    ...register("data_organization")
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.organization_email")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_organization_email")}
                state={errors.data_organization_email ? "error" : "default"}
                stateRelatedMessage={errors?.data_organization_email?.message}
                nativeInputProps={{
                    ...register("data_organization_email")
                }}
            />
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
                        onClick: () => {
                            handleSubmit(onSubmit)();
                            tagifyRef.current.checkValidity();
                        }
                    }
                ]}
                inlineLayoutWhen="always"
            />  
        </div>
    );
};

DescriptionForm.propTypes = {
    storedDataName: PropTypes.string.isRequired,
    visibility: PropTypes.bool.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onValid: PropTypes.func.isRequired
};

export default DescriptionForm;
