import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import api from "../../../api";
import AutocompleteSelect from "../../../components/Input/AutocompleteSelect";
import ignProducts from "../../../data/md_resolutions.json";
import { getTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { Pyramid, ServiceFormValuesBaseType, UploadTree, VectorDb } from "../../../types/app";
import { LanguageType, charsets, getLanguages } from "../../../utils";

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
    form: UseFormReturn<ServiceFormValuesBaseType>;
    datastoreId: string;
};

const AdditionalInfo: FC<AdditionalInfoProps> = ({ storedData, datastoreId, visible, form }) => {
    const { t: tCommon } = getTranslation("Common");
    const { t } = getTranslation("MetadatasForm");

    const {
        register,
        formState: { errors },
        control,
        setValue: setFormValue,
    } = form;

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
            <p>{tCommon("mandatory_fields")}</p>
            <h3>{t("attribution.title")}</h3>
            <p>{t("attribution.explain")}</p>
            <Input
                label={t("attribution_form.text")}
                hintText={t("attribution_form.hint_text")}
                state={errors.attribution_text ? "error" : "default"}
                stateRelatedMessage={errors?.attribution_text?.message?.toString()}
                nativeInputProps={{
                    ...register("attribution_text"),
                }}
            />
            <Input
                label={t("attribution_form.url")}
                hintText={t("attribution_form.hint_url")}
                state={errors.attribution_url ? "error" : "default"}
                stateRelatedMessage={errors?.attribution_url?.message?.toString()}
                nativeInputProps={{
                    ...register("attribution_url"),
                }}
            />
            <h3>{t("metadata.additionnal_infos_form.metadata_information_title")}</h3>
            <Controller
                control={control}
                name="languages"
                render={({ field }) => {
                    return (
                        <AutocompleteSelect
                            label={t("metadata.additionnal_infos_form.language")}
                            hintText={t("metadata.additionnal_infos_form.hint_language")}
                            state={errors.languages ? "error" : "default"}
                            stateRelatedMessage={errors?.languages?.message?.toString()}
                            freeSolo={false}
                            defaultValue={field.value}
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
                label={t("metadata.additionnal_infos_form.charset")}
                hint={t("metadata.additionnal_infos_form.hint_charset")}
                state={errors.charset ? "error" : "default"}
                stateRelatedMessage={errors?.charset?.message?.toString()}
                nativeSelectProps={{
                    ...register("charset"),
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
            <h3>{t("metadata.additionnal_infos_form.type_of_spatial_representation_title")}</h3>
            <Input
                label={t("metadata.additionnal_infos_form.projection")}
                hintText={t("metadata.additionnal_infos_form.hint_projection")}
                state={errors.projection ? "error" : "default"}
                stateRelatedMessage={errors?.projection?.message?.toString()}
                nativeInputProps={{
                    ...register("projection"),
                    readOnly: true,
                }}
            />
            <Input
                label={t("metadata.additionnal_infos_form.encoding")}
                hintText={t("metadata.additionnal_infos_form.hint_encoding")}
                state={errors.encoding ? "error" : "default"}
                stateRelatedMessage={errors?.encoding?.message?.toString()}
                nativeInputProps={{
                    ...register("encoding"),
                    readOnly: fileType !== undefined,
                    defaultValue: fileType,
                }}
            />
            <Select
                label={t("metadata.additionnal_infos_form.hint_spatial_resolution")}
                hint={t("metadata.additionnal_infos_form.hint_spatial_resolution")}
                state={errors.resolution ? "error" : "default"}
                stateRelatedMessage={errors?.resolution?.message?.toString()}
                nativeSelectProps={{
                    ...register("resolution"),
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
