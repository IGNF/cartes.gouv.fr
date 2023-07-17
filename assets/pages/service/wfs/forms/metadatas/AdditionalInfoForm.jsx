import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { languages, charsets } from "../../../../../utils";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import ignProducts from "./../../../../../data/md_resolutions.json";

const getCode = (epsg) => {
    if (!epsg) return null;
    const parts = epsg.split(":");
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
};

// TODO PROVISOIRE
/* const schema = yup
    .object({
        data_language: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.language_error")),
        data_charset: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.charset_error")),
        data_projection: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.projection_error")),
        data_encoding: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.encoding_error")),
        data_resolution: yup.number()
    })
    .required(); */

// TODO SUPPRIMER
const schema = yup.object({}).required();

// TODO storedData : Utiliser pour la projection
const AdditionalInfoForm = ({ storedData, fileType, visibility, onPrevious, onValid }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues,
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    let projUrl = null;
    const code = getCode(storedData.srs);
    if (code) {
        projUrl = `http://www.opengis.net/def/crs/EPSG/0/${code}`;
    }

    return (
        <div className={fr.cx("fr-my-2v")} style={{ display: visibility ? "block" : "none" }}>
            <h3>{Translator.trans("service.wfs.new.additional_information_form.metadata_information_title")}</h3>
            <Select
                label={Translator.trans("service.wfs.new.additional_information_form.language")}
                hint={Translator.trans("service.wfs.new.additional_information_form.hint_language")}
                state={errors.data_language ? "error" : "default"}
                stateRelatedMessage={errors?.data_language?.message}
                nativeSelectProps={{
                    ...register("data_language"),
                    defaultValue: "",
                }}
            >
                <option value="" disabled hidden>
                    Selectionnez une option
                </option>
                {Object.keys(languages).map((language) => {
                    return (
                        <option key={language} value={language}>
                            {languages[language]}
                        </option>
                    );
                })}
            </Select>
            <Select
                label={Translator.trans("service.wfs.new.additional_information_form.charset")}
                hint={Translator.trans("service.wfs.new.additional_information_form.hint_charset")}
                state={errors.data_charset ? "error" : "default"}
                stateRelatedMessage={errors?.data_charset?.message}
                nativeSelectProps={{
                    ...register("data_charset"),
                    defaultValue: "utf8",
                }}
            >
                {Object.keys(charsets).map((code) => {
                    return (
                        <option key={code} value={code} title={charsets[code]}>
                            {code}
                        </option>
                    );
                })}
            </Select>
            <h3>{Translator.trans("service.wfs.new.additional_information_form.type_of_spatial_representation_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.additional_information_form.projection")}
                hintText={Translator.trans("service.wfs.new.additional_information_form.hint_projection")}
                state={errors.data_projection ? "error" : "default"}
                stateRelatedMessage={errors?.data_projection?.message}
                nativeInputProps={{
                    ...register("data_projection"),
                    readOnly: true,
                    defaultValue: projUrl,
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.additional_information_form.encoding")}
                hintText={Translator.trans("service.wfs.new.additional_information_form.hint_encoding")}
                state={errors.data_encoding ? "error" : "default"}
                stateRelatedMessage={errors?.data_encoding?.message}
                nativeInputProps={{
                    ...register("data_encoding"),
                    readOnly: fileType !== "unknown",
                    defaultValue: fileType,
                }}
            />
            <Select
                label={Translator.trans("service.wfs.new.additional_information_form.spatial_resolution")}
                hintText={Translator.trans("service.wfs.new.additional_information_form.hint_spatial_resolution")}
                nativeSelectProps={{
                    ...register("data_resolution"),
                    defaultValue: "",
                }}
            >
                <option value="" disabled hidden>
                    {Translator.trans("service.wfs.new.additional_information_form.select_spatial_resolution")}
                </option>
                {Object.keys(ignProducts).map((product) => {
                    const text = `${product} (1/${ignProducts[product]})`;
                    return (
                        <option key={product} value={ignProducts[product]}>
                            {text}
                        </option>
                    );
                })}
            </Select>
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
                        onClick: handleSubmit(onSubmit),
                    },
                ]}
                inlineLayoutWhen="always"
            />
        </div>
    );
};

AdditionalInfoForm.propTypes = {
    storedData: PropTypes.object.isRequired,
    fileType: PropTypes.string.isRequired,
    visibility: PropTypes.bool.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onValid: PropTypes.func.isRequired,
};

export default AdditionalInfoForm;
