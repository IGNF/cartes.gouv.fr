import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";
import { Select as SelectNext } from "@codegouvfr/react-dsfr/SelectNext";
import { FC, useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import type { PyramidRaster, PyramidVector } from "../../../../@types/app";
import { MetadataHierarchyLevel, type ServiceFormValuesBaseType, type VectorDb } from "../../../../@types/app";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import resolutions from "../../../../data/md_resolutions.json";
import { getTranslation } from "../../../../i18n/i18n";
import { LanguageType, charsets, getLanguages } from "../../../../utils";

/**
 * Récupère le type de fichier (undefined, csv ou geopackage)
 */
// const getUploadFileType = (fileTree) => {
//     if (!fileTree) return undefined;
//     let fileType: string | undefined = undefined;

//     const directory = fileTree.filter((tree) => tree?.type === "DIRECTORY" && tree?.name === "data");
//     if (directory.length) {
//         const extensions = directory[0]?.children?.filter((child) => child.type === "FILE").map((file) => file.name.split(".").pop().toLowerCase());
//         if (extensions.length) {
//             fileType = extensions[0];
//         }
//     }
//     return fileType;
// };

type AdditionalInfoProps = {
    storedData: VectorDb | PyramidVector | PyramidRaster;
    visible: boolean;
    form: UseFormReturn<ServiceFormValuesBaseType>;
    datastoreId: string;
};

const AdditionalInfo: FC<AdditionalInfoProps> = ({ /*storedData, datastoreId,*/ visible, form }) => {
    const { t: tCommon } = getTranslation("Common");
    const { t } = getTranslation("MetadatasForm");

    const {
        register,
        formState: { errors },
        control,
        // setValue: setFormValue,
    } = form;

    const languagesOptions: LanguageType[] = useMemo(getLanguages, []);

    // const fileTreeQuery = useQuery<UploadTree, CartesApiException>({
    //     queryKey: RQKeys.datastore_upload_file_tree(datastoreId, storedData.tags.upload_id),
    //     queryFn: () => api.upload.getFileTree(datastoreId, storedData.tags.upload_id!),
    //     staleTime: 1800000,
    //     enabled: !!storedData.tags.upload_id,
    // });

    // const fileType = useMemo(() => {
    //     return getUploadFileType(fileTreeQuery.data);
    // }, [fileTreeQuery.data]);

    // useEffect(() => {
    //     setFormValue("encoding", fileType);
    // }, [fileType, setFormValue]);

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
            <RadioButtons
                legend={t("metadata.additionnal_infos_form.hierarchy_level")}
                state={errors.hierarchy_level ? "error" : "default"}
                stateRelatedMessage={errors.hierarchy_level?.message}
                orientation="vertical"
                options={[
                    {
                        label: t(`metadata.additionnal_infos_form.hierarchy_level_${MetadataHierarchyLevel.Dataset}`),
                        hintText: t(`metadata.additionnal_infos_form.hierarchy_level_${MetadataHierarchyLevel.Dataset}_hint`),
                        nativeInputProps: {
                            ...register("hierarchy_level"),
                            value: MetadataHierarchyLevel.Dataset,
                        },
                    },
                    {
                        label: t("metadata.additionnal_infos_form.hierarchy_level_series"),
                        hintText: t("metadata.additionnal_infos_form.hierarchy_level_series_hint"),
                        nativeInputProps: {
                            ...register("hierarchy_level"),
                            value: MetadataHierarchyLevel.Series,
                        },
                    },
                ]}
            />
            <Controller
                control={control}
                name="language"
                render={({ field }) => {
                    return (
                        <AutocompleteSelect
                            label={t("metadata.additionnal_infos_form.language")}
                            hintText={t("metadata.additionnal_infos_form.hint_language")}
                            state={errors.language ? "error" : "default"}
                            stateRelatedMessage={errors?.language?.message?.toString()}
                            freeSolo={false}
                            value={field.value}
                            getOptionLabel={(option) => (option as LanguageType).language ?? ""}
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                            options={languagesOptions}
                            searchFilter={{ limit: 5 }}
                            onChange={(_, value) => field.onChange(value)}
                            controllerField={field}
                            multiple={false}
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
            {/* <Input
                label={t("metadata.additionnal_infos_form.encoding")}
                hintText={t("metadata.additionnal_infos_form.hint_encoding")}
                state={errors.encoding ? "error" : "default"}
                stateRelatedMessage={errors?.encoding?.message?.toString()}
                nativeInputProps={{
                    ...register("encoding"),
                    readOnly: fileType !== undefined,
                    defaultValue: fileType,
                }}
            /> */}
            <SelectNext
                label={t("metadata.additionnal_infos_form.spatial_resolution")}
                hint={t("metadata.additionnal_infos_form.hint_spatial_resolution")}
                state={errors.resolution ? "error" : "default"}
                stateRelatedMessage={errors?.resolution?.message?.toString()}
                options={["", ...resolutions].map((res) => ({
                    value: res.toString(),
                    label: res === "" ? "Aucune" : `1:${res.toLocaleString()}`,
                }))}
                nativeSelectProps={{
                    ...register("resolution"),
                }}
            />
        </div>
    );
};

export default AdditionalInfo;
