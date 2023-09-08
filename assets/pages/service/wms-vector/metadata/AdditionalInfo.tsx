import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Autocomplete, TextField, createFilterOptions } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

import api from "../../../../api";
import ignProducts from "../../../../data/md_resolutions.json";
import RQKeys from "../../../../modules/RQKeys";
import Translator from "../../../../modules/Translator";
import { UploadTree, VectorDb } from "../../../../types/app";
import { charsets, getLanguages } from "../../../../utils";

const getCode = (epsg) => {
    if (!epsg) return null;
    const parts = epsg.split(":");
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
};

/**
 * Récupère le type de fichier (unknown, csv ou geopackage)
 
 */
const getUploadFileType = (fileTree) => {
    if (!fileTree) return undefined;
    let fileType = "unknown";

    const directory = fileTree.filter((tree) => tree?.type === "DIRECTORY" && tree?.name === "data");
    if (directory.length) {
        const extensions = directory[0]?.children?.filter((child) => child.type === "FILE").map((file) => file.name.split(".").pop().toLowerCase());
        if (extensions.length) {
            fileType = extensions[0];
        }
    }
    return fileType;
};

type Language = {
    language: string;
    code: string;
};

type AdditionalInfoProps = {
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn;
    datastoreId: string;
};
const AdditionalInfo: FC<AdditionalInfoProps> = ({ vectorDb, datastoreId, visible, form }) => {
    const {
        register,
        formState: { errors },
        setValue: setFormValue,
    } = form;

    let projUrl;
    const code = getCode(vectorDb.srs);
    if (code) {
        projUrl = `http://www.opengis.net/def/crs/EPSG/0/${code}`;
    }

    const languagesOptions: Language[] = useMemo(getLanguages, []);
    const filterOptions = createFilterOptions({ limit: 5 });

    const handleOnLanguageChange = (e, values) => {
        const codes = values.map((value) => value.code);
        setFormValue("languages", codes.join(","), { shouldValidate: true });
    };

    const fileTreeQuery = useQuery<UploadTree>({
        queryKey: RQKeys.datastore_upload_file_tree(datastoreId, vectorDb.tags.upload_id),
        queryFn: () => api.upload.getFileTree(datastoreId, vectorDb.tags.upload_id),
        staleTime: 1800000,
    });

    const fileType = useMemo(() => {
        return getUploadFileType(fileTreeQuery.data);
    }, [fileTreeQuery.data]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wms_vector.new.step_additional_information.metainformation_title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            <Input
                label={Translator.trans("service.wms_vector.new.step_additional_information.projection")}
                hintText={Translator.trans("service.wms_vector.new.step_additional_information.hint_projection")}
                state={errors.projection ? "error" : "default"}
                stateRelatedMessage={errors?.projection?.message?.toString()}
                nativeInputProps={{
                    ...register("projection"),
                    readOnly: true,
                    defaultValue: projUrl,
                }}
            />
            <MuiDsfrThemeProvider>
                <label className={fr.cx("fr-label")}>
                    {Translator.trans("service.wms_vector.new.step_additional_information.language")}
                    <span className={fr.cx("fr-hint-text")}>{Translator.trans("service.wms_vector.new.step_additional_information.hint_language")}</span>
                </label>
                <Autocomplete
                    autoComplete={true}
                    disablePortal
                    multiple
                    filterSelectedOptions
                    options={languagesOptions}
                    getOptionLabel={(option) => (option as Language).language}
                    defaultValue={[{ language: "français", code: "fra" }]}
                    renderInput={(params) => <TextField {...params} />}
                    filterOptions={filterOptions}
                    isOptionEqualToValue={(option, value) => (option as Language).code === (value as Language).code}
                    onChange={handleOnLanguageChange}
                />
            </MuiDsfrThemeProvider>
            <Select
                label={Translator.trans("service.wms_vector.new.step_additional_information.charset")}
                hint={Translator.trans("service.wms_vector.new.step_additional_information.hint_charset")}
                state={errors.charset ? "error" : "default"}
                stateRelatedMessage={errors?.charset?.message?.toString()}
                nativeSelectProps={{
                    ...register("charset"),
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
            <h3>{Translator.trans("service.wms_vector.new.step_additional_information.type_of_spatial_representation_title")}</h3>
            <Input
                label={Translator.trans("service.wms_vector.new.step_additional_information.projection")}
                hintText={Translator.trans("service.wms_vector.new.step_additional_information.hint_projection")}
                state={errors.projection ? "error" : "default"}
                stateRelatedMessage={errors?.projection?.message?.toString()}
                nativeInputProps={{
                    ...register("projection"),
                    readOnly: true,
                    defaultValue: projUrl,
                }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_additional_information.encoding")}
                hintText={Translator.trans("service.wms_vector.new.step_additional_information.hint_encoding")}
                state={errors.encoding ? "error" : "default"}
                stateRelatedMessage={errors?.encoding?.message?.toString()}
                nativeInputProps={{
                    ...register("encoding"),
                    readOnly: fileType !== "unknown",
                    defaultValue: fileType,
                }}
            />
            <Select
                label={Translator.trans("service.wms_vector.new.step_additional_information.spatial_resolution")}
                hint={Translator.trans("service.wms_vector.new.step_additional_information.hint_spatial_resolution")}
                nativeSelectProps={{
                    ...register("resolution"),
                    defaultValue: "",
                }}
            >
                <option value="" disabled hidden>
                    {Translator.trans("service.wms_vector.new.step_additional_information.select_spatial_resolution")}
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
        </div>
    );
};

export default AdditionalInfo;
