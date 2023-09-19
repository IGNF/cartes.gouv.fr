import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import ignProducts from "../../../../data/md_resolutions.json";
import Translator from "../../../../modules/Translator";
import { StoredData } from "../../../../types/app";
import { LanguageType, charsets, getLanguages } from "../../../../utils";

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
        data_languages: yup
            .array()
            .of(
                yup.object({
                    language: yup.string(),
                    code: yup.string(),
                })
            )
            .required(Translator.trans("service.wfs.new.additional_information_form.language_error"))
            .min(1, Translator.trans("service.wfs.new.additional_information_form.language_error")),
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

const AdditionalInfoForm: FC<AdditionalInfoFormProps> = ({ storedData, fileType, visible, onPrevious, onValid }) => {
    let projUrl;
    const code = getCode(storedData.srs);
    if (code) {
        projUrl = `http://www.opengis.net/def/crs/EPSG/0/${code}`;
    }

    const languagesOptions: LanguageType[] = useMemo(getLanguages, []);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues,
        setValue: setFormValue,
    } = useForm({ resolver: yupResolver(schema) });

    useEffect(() => {
        setFormValue("data_encoding", fileType ?? "");
    }, [fileType, setFormValue]);

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

            <Controller
                control={control}
                name="data_languages"
                defaultValue={[{ language: "français", code: "fra" }]}
                render={({ field }) => {
                    return (
                        <AutocompleteSelect
                            label={Translator.trans("service.wfs.new.additional_information_form.language")}
                            hintText={Translator.trans("service.wfs.new.additional_information_form.hint_language")}
                            state={errors.data_languages ? "error" : "default"}
                            stateRelatedMessage={errors?.data_languages?.message?.toString()}
                            freeSolo={false}
                            defaultValue={[{ language: "français", code: "fra" }]}
                            getOptionLabel={(option) => (option as LanguageType).language}
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                            options={languagesOptions}
                            searchFilter={{ limit: 5 }}
                            onChange={(_, value) => field.onChange(value)}
                            // @ts-expect-error fausse alerte
                            controllerField={field}
                        />
                    );
                }}
            />
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
                    defaultValue: 0,
                }}
                state={errors?.data_resolution ? "error" : "default"}
                stateRelatedMessage={errors?.data_resolution?.message}
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
