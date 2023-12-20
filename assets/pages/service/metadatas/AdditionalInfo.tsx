import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import api from "../../../api";
import AutocompleteSelect from "../../../components/Input/AutocompleteSelect";
import ignProducts from "../../../data/md_resolutions.json";
import RQKeys from "../../../modules/RQKeys";
import Translator from "../../../modules/Translator";
import { Pyramid, UploadTree, VectorDb } from "../../../types/app";
import { LanguageType, charsets, getLanguages } from "../../../utils";

const getCode = (epsg) => {
    if (!epsg) return null;
    const parts = epsg.split(":");
    if (parts.length === 2) {
        return parts[1];
    }
    return null;
};

/**
 * Récupère le type de fichier (undefined, csv ou geopackage)
 */
const getUploadFileType = (fileTree) => {
    if (!fileTree) return undefined;
    let fileType: string | undefined = undefined;

    const directory = fileTree.filter((tree) => tree?.type === "DIRECTORY" && tree?.name === "data");
    if (directory.length) {
        const extensions = directory[0]?.children?.filter((child) => child.type === "FILE").map((file) => file.name.split(".").pop().toLowerCase());
        if (extensions.length) {
            fileType = extensions[0];
        }
    }
    return fileType;
};

type AdditionalInfoProps = {
    storedData: VectorDb | Pyramid;
    visible: boolean;
    form: UseFormReturn;
    datastoreId: string;
};
const AdditionalInfo: FC<AdditionalInfoProps> = ({ storedData, datastoreId, visible, form }) => {
    const {
        register,
        formState: { errors },
        control,
        setValue: setFormValue,
    } = form;

    let projUrl;
    const code = getCode(storedData.srs);
    if (code) {
        projUrl = `http://www.opengis.net/def/crs/EPSG/0/${code}`;
    }

    const languagesOptions: LanguageType[] = useMemo(getLanguages, []);

    const fileTreeQuery = useQuery<UploadTree>({
        queryKey: RQKeys.datastore_upload_file_tree(datastoreId, storedData.tags.upload_id),
        queryFn: () => api.upload.getFileTree(datastoreId, storedData.tags.upload_id!),
        staleTime: 1800000,
        enabled: !!storedData.tags.upload_id,
    });

    const fileType = useMemo(() => {
        return getUploadFileType(fileTreeQuery.data);
    }, [fileTreeQuery.data]);

    useEffect(() => {
        setFormValue("encoding", fileType);
    }, [fileType, setFormValue]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wms_vector.new.step_additional_information.metadata_information_title")}</h3>
            <p>{Translator.trans("mandatory_fields")}</p>
            <Controller
                control={control}
                name="languages"
                defaultValue={[{ language: "français", code: "fra" }]}
                render={({ field }) => {
                    return (
                        <AutocompleteSelect
                            label={Translator.trans(Translator.trans("service.wms_vector.new.step_additional_information.language"))}
                            hintText={Translator.trans("service.wms_vector.new.step_additional_information.hint_language")}
                            state={errors.languages ? "error" : "default"}
                            stateRelatedMessage={errors?.languages?.message?.toString()}
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
                    readOnly: fileType !== undefined,
                    defaultValue: fileType,
                }}
            />
            <Select
                label={Translator.trans("service.wms_vector.new.step_additional_information.spatial_resolution")}
                hint={Translator.trans("service.wms_vector.new.step_additional_information.hint_spatial_resolution")}
                state={errors.resolution ? "error" : "default"}
                stateRelatedMessage={errors?.resolution?.message?.toString()}
                nativeSelectProps={{
                    ...register("resolution"),
                    defaultValue: "",
                }}
            >
                <option value="">Aucune</option>
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
