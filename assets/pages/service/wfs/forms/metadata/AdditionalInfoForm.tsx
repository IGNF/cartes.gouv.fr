import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getLanguages, charsets } from "../../../../../utils";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Autocomplete, createFilterOptions } from "@mui/material";
import { TextField } from "@mui/material";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { StoredData } from "../../../../../types/app";
import ignProducts from "../../../../../data/md_resolutions.json";
import Translator from "../../../../../modules/Translator";

const getCode = (epsg) => {
    if (!epsg) return null;
    const parts = epsg.split(":");
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
};

const schema = yup
    .object({
        data_languages: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.language_error")),
        data_charset: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.charset_error")),
        data_projection: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.projection_error")),
        data_encoding: yup.string().required(Translator.trans("service.wfs.new.additional_information_form.encoding_error")),
        data_resolution: yup.number(),
    })
    .required();

type AdditionalInfoFormProps = {
    storedData: StoredData;
    fileType?: string;
    visible: boolean;
    onPrevious: () => void;
    onValid: (values) => void;
};

type LanguageOption = { language: string; code: string };

const AdditionalInfoForm: FC<AdditionalInfoFormProps> = ({ storedData, fileType, visible, onPrevious, onValid }) => {
    let projUrl;
    const code = getCode(storedData.srs);
    if (code) {
        projUrl = `http://www.opengis.net/def/crs/EPSG/0/${code}`;
    }

    const languagesOptions = getLanguages();
    const filterOptions = createFilterOptions({ limit: 5 });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue: setFormValue,
        getValues: getFormValues,
    } = useForm({ resolver: yupResolver(schema) });

    const handleOnLanguageChange = (e, values) => {
        const codes = values.map((value) => value.code);
        setFormValue("data_languages", codes.join(","), { shouldValidate: true });
    };

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wfs.new.additional_information_form.metadata_information_title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

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
            <MuiDsfrThemeProvider>
                <label className={fr.cx("fr-label")}>
                    {Translator.trans("service.wfs.new.additional_information_form.language")}
                    <span className={fr.cx("fr-hint-text")}>{Translator.trans("service.wfs.new.additional_information_form.hint_language")}</span>
                </label>
                <Autocomplete
                    autoComplete={true}
                    disablePortal
                    multiple
                    filterSelectedOptions
                    options={languagesOptions as LanguageOption[]}
                    getOptionLabel={(option) => (option as LanguageOption).language}
                    defaultValue={[{ language: "français", code: "fra" }]}
                    renderInput={(params) => <TextField {...params} />}
                    filterOptions={filterOptions}
                    isOptionEqualToValue={(option, value) => (option as LanguageOption).code === (value as LanguageOption).code}
                    onChange={handleOnLanguageChange}
                />
            </MuiDsfrThemeProvider>
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
                hint={Translator.trans("service.wfs.new.additional_information_form.hint_spatial_resolution")}
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

export default AdditionalInfoForm;
