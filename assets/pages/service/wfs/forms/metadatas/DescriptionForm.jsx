import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { yupResolver } from "@hookform/resolvers/yup";
import MDEditor from "@uiw/react-md-editor";
import getLocaleCommands from "../../../../../modules/react-md/react-md-commands";
import { format as datefnsFormat } from "date-fns";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import KeywordsSelect from "../../../../../components/Utils/KeywordsSelect";
import { removeDiacritics } from "../../../../../utils";

import Translator from "../../../../../modules/Translator";

// Themes et mot cles INSPIRE
import { getInspireKeywords } from "../../../../../utils";

// TODO PROVISOIRE
/* const schema = yup
    .object({
        data_technical_name: yup
            .string()
            .required(Translator.trans("service.wfs.new.description_form.technical_name_error"))
            .matches(/^[\w-\.]+$/, Translator.trans("service.wfs.new.description_form.technical_name_regex")),
        data_public_name: yup.string().required(Translator.trans("service.wfs.new.description_form.public_name_error")),
        data_description: yup.string().required(Translator.trans("service.wfs.new.description_form.description_error")),
        data_identifier: yup.string().required(Translator.trans("service.wfs.new.description_form.identifier_error")),
        data_category: yup.string().required(Translator.trans("service.wfs.new.description_form.category_error")),
        data_email_contact: yup
            .string()
            .email(Translator.trans("service.wfs.new.description_form.email_contact_error"))
            .required(Translator.trans("service.wfs.new.description_form.email_contact_mandatory_error")),
        data_creation_date: yup.date().required(Translator.trans("service.wfs.new.description_form.creation_date_error")),
        data_organization: yup.string().required(Translator.trans("service.wfs.new.description_form.organization_error")),
        data_organization_email: yup
            .string()
            .email(Translator.trans("service.wfs.new.description_form.organization_email_error"))
            .required(Translator.trans("service.wfs.new.description_form.organization_email_mandatory_error")),
    })
    .required(); */

// TODO SUPPRIMER
const schema = yup.object({}).required();

const DescriptionForm = ({ storedDataName, visibility, onPrevious, onValid }) => {
    const keywords = getInspireKeywords();

    const { isDark } = useIsDark();
    const [description, setDescription] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue: setFormValue,
        getValues: getFormValues,
        trigger,
    } = useForm({ resolver: yupResolver(schema) });

    useEffect(() => {
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");
        const now = datefnsFormat(new Date(), "yyyy-MM-dd");

        setFormValue("data_technical_name", nice);
        setFormValue("data_public_name", storedDataName);
        setFormValue("data_creation_date", now);
    }, [setFormValue, storedDataName]);

    const handleKeywordsChange = (values) => {
        setFormValue("data_category", values.join(","), { shouldValidate: true });
    };

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    return (
        <div className={fr.cx("fr-my-2v", !visibility && "fr-hidden")}>
            <h3>{Translator.trans("service.wfs.new.description_form.description_title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            <Input
                label={Translator.trans("service.wfs.new.description_form.technical_name")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_technical_name")}
                state={errors.data_technical_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_technical_name?.message}
                nativeInputProps={{
                    ...register("data_technical_name"),
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.public_name")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_public_name")}
                state={errors.data_public_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_public_name?.message}
                nativeInputProps={{
                    ...register("data_public_name"),
                }}
            />
            <div className={fr.cx("fr-input-group", errors.data_description && "fr-input-group--error")} data-color-mode={isDark ? "dark" : "light"}>
                <label className={fr.cx("fr-label")}>
                    {Translator.trans("service.wfs.new.description_form.description")}
                    <span className="fr-hint-text">{Translator.trans("service.wfs.new.description_form.hint_description")}</span>
                </label>
                <MDEditor
                    value={description}
                    height={200}
                    commands={getLocaleCommands("fr")}
                    extraCommands={[]}
                    textareaProps={{
                        placeholder: Translator.trans("service.wfs.new.description_form.markdown_placeholder"),
                    }}
                    onChange={(newValue = "") => {
                        setDescription(newValue);
                        setFormValue("data_description", newValue);
                        trigger();
                    }}
                />
                {errors.data_description && <p className={fr.cx("fr-error-text")}>{errors.data_description?.message}</p>}
            </div>
            <Input
                label={Translator.trans("service.wfs.new.description_form.identifier")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_identifier")}
                state={errors.data_identifier ? "error" : "default"}
                stateRelatedMessage={errors?.data_identifier?.message}
                nativeInputProps={{
                    ...register("data_identifier"),
                    readOnly: true,
                    defaultValue: uuidv4(),
                }}
            />
            <KeywordsSelect
                label={Translator.trans("service.wfs.new.description_form.category")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_category")}
                freeSolo
                keywords={keywords}
                onChange={handleKeywordsChange}
            />
            <Input
                state={errors.data_category ? "error" : "default"}
                stateRelatedMessage={errors?.data_category?.message}
                nativeInputProps={{
                    ...register("data_category"),
                    type: "hidden",
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.email_contact")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_email_contact")}
                state={errors.data_email_contact ? "error" : "default"}
                stateRelatedMessage={errors?.data_email_contact?.message}
                nativeInputProps={{
                    ...register("data_email_contact"),
                }}
            />
            <h3>{Translator.trans("service.wfs.new.description_form.time_reference_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.description_form.creation_date")}
                // hintText={Translator.trans("service.wfs.new.description_form.hint_creation_date")}
                state={errors.data_creation_date ? "error" : "default"}
                stateRelatedMessage={errors?.data_creation_date?.message}
                nativeInputProps={{
                    ...register("data_creation_date"),
                    type: "date",
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.resource_genealogy")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_resource_genealogy")}
                state={errors.data_resource_genealogy ? "error" : "default"}
                stateRelatedMessage={errors?.data_resource_genealogy?.message}
                textArea={true}
                nativeInputProps={{
                    ...register("data_resource_genealogy"),
                }}
            />
            <h3>{Translator.trans("service.wfs.new.description_form.resource_manager_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.description_form.organization")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_organization")}
                state={errors.data_organization ? "error" : "default"}
                stateRelatedMessage={errors?.data_organization?.message}
                nativeInputProps={{
                    ...register("data_organization"),
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.organization_email")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_organization_email")}
                state={errors.data_organization_email ? "error" : "default"}
                stateRelatedMessage={errors?.data_organization_email?.message}
                nativeInputProps={{
                    ...register("data_organization_email"),
                }}
            />
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
                        children: Translator.trans("continue"),
                        onClick: () => {
                            console.log(getFormValues());
                            handleSubmit(onSubmit)();
                            // tagifyRef.current.checkValidity();  // TODO PROVISOIRE
                        },
                    },
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
    onValid: PropTypes.func.isRequired,
};

export default DescriptionForm;
