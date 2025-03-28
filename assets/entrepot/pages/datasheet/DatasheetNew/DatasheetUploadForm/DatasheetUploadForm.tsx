import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select as SelectNext } from "@codegouvfr/react-dsfr/SelectNext";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format as datefnsFormat } from "date-fns";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import defaultProjections from "../../../../../data/default_projections.json";
import ignfProjections from "../../../../../data/ignf_projections.json";
import { useTranslation } from "../../../../../i18n/i18n";
import FileUploader from "../../../../../modules/FileUploader";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes, useRoute } from "../../../../../router/router";
import { getFileExtension, regex } from "../../../../../utils";
import api from "../../../../api";
import DatasheetUploadIntegrationDialog from "../DatasheetUploadIntegration/DatasheetUploadIntegrationDialog";
import Main from "../../../../../components/Layout/Main";

const maxFileSize = 2000000000; // 2 GB
const fileExtensions = ["gpkg", "zip"];

const fileUploader = new FileUploader();

const getDataTechNameSuggestion = (fileName: string) => {
    let dataTechName = fileName.replace(/ /g, "_");
    dataTechName = dataTechName.replace(/\./g, "_");
    dataTechName += "_" + datefnsFormat(new Date(), "dd-MM-yyyy");

    return dataTechName;
};

type DatasheetUploadFormProps = {
    datastoreId: string;
};
const DatasheetUploadForm: FC<DatasheetUploadFormProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatasheetUploadForm");
    const { t: tCommon } = useTranslation("Common");

    const route = useRoute();

    const datasheetName: string | undefined = useMemo(() => route.params?.["datasheetName"], [route.params]);

    const schema = yup
        .object({
            data_name: yup
                .string()
                .required(t("datasheet.name_mandatory_error"))
                .max(99, t("datasheet.name_max_length_error"))
                .matches(regex.datasheet_name, t("datasheet.name_regex_error"))
                .transform((value) => value.trim())
                .test({
                    name: "is-unique",
                    test(dataName, ctx) {
                        // si on téléverse un nouveau fichier sur une fiche de données existante, ne vérifie pas l'unicité
                        if (datasheetName !== undefined) {
                            return true;
                        }

                        const existingDataList = datasheetListQuery?.data?.map((data) => data?.name);
                        if (existingDataList?.includes(dataName)) {
                            return ctx.createError({ message: t("datasheet.name_already_exists_error", { datasheetName: dataName }) });
                        }

                        return true;
                    },
                }),
            data_technical_name: yup.string().required(t("technical_name_mandatory_error")),
            data_srid: yup
                .string()
                .required(t("projection_mandatory_error"))
                .test({
                    name: "srid-is-accepted",
                    async test(srid, ctx) {
                        // vérifier si le srid est présent dans la liste des proj EPSG par défaut
                        if (srid in projections) {
                            return true;
                        } else {
                            // sinon voir si le srid est bien une proj EPSG
                            try {
                                // on ajoute le srid à la liste des projections (donc nouvelle valeur dans le select)
                                const proj = await api.epsg.getProjFromEpsg(srid);
                                const projectionsClone = { ...projections };
                                projectionsClone[srid] = proj.name;
                                setProjections(projectionsClone);

                                if (srid in projectionsClone) {
                                    return true;
                                }
                            } catch (error) {
                                console.error(error);
                                if (error instanceof Error) {
                                    return ctx.createError({ message: error.message });
                                }
                            }

                            return ctx.createError({ message: `Projection ${srid} inconnue` });
                        }
                    },
                }),
            data_upload_path: yup.string(),
        })
        .required();

    // Progress
    const [fileUploadInProgress, setFileUploadInProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMax, setProgressMax] = useState(0);

    const [showDataInfos, setShowDataInfos] = useState(false);
    const [projections, setProjections] = useState(defaultProjections);

    const [dataFileError, setDataFileError] = useState<string>();
    const dataFileRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isValidating },
        setValue: setFormValue,
        trigger,
        watch,
    } = useForm({ resolver: yupResolver(schema) });

    const selectedSrid = watch("data_srid");

    const addUploadMutation = useMutation({
        mutationFn: (formData: object) => {
            return api.upload.add(datastoreId, formData);
        },
    });

    const datasheetListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: ({ signal }) => api.datasheet.getList(datastoreId, { signal }),
        refetchInterval: 20000,
        enabled: !addUploadMutation.isSuccess && !fileUploadInProgress,
    });

    useEffect(() => {
        setProgressValue(0);
    }, [fileUploadInProgress]);

    useEffect(() => {
        if (!showDataInfos) {
            setFormValue("data_upload_path", "");
            setFormValue("data_technical_name", "");
        }
    }, [showDataInfos, setFormValue]);

    const onSubmit = async (formData) => {
        const dataFile = dataFileRef.current?.files?.[0];

        if (isValid && validateDataFile(dataFile)) {
            addUploadMutation.mutate(formData);
        }
    };

    const validateDataFile = (file?: File) => {
        if (!file) {
            setDataFileError(t("upload_nofile_error"));
            return false;
        }

        const extension = getFileExtension(file.name);
        if (!extension || !fileExtensions.includes(extension)) {
            setDataFileError(t("upload_extension_error", { filename: file.name }));
            return false;
        }

        if (file.size > maxFileSize) {
            setDataFileError(t("upload_max_size_error", { maxSize: maxFileSize }));
            return false;
        }

        return true;
    };

    const postDataFile = () => {
        setDataFileError(undefined);
        setShowDataInfos(false);

        if (!dataFileRef.current || !dataFileRef.current.files) return;

        const file = dataFileRef.current.files[0];
        if (!validateDataFile(file)) {
            return;
        }

        const uuid = uuidv4();
        setFileUploadInProgress(true);
        setProgressMax(file.size);

        fileUploader
            .uploadFile(uuid, file, setProgressValue)
            .then(() => {
                fileUploader
                    .uploadComplete(uuid, file)
                    .then(async (data) => {
                        let srid = data?.srid;
                        srid = srid in ignfProjections ? ignfProjections[srid] : srid; // récupérer la proj EPSG correspondante si une proj IGNF est détectée

                        setFormValue("data_srid", srid, { shouldValidate: true });
                        setFormValue("data_technical_name", getDataTechNameSuggestion(file.name), { shouldValidate: true });
                        setFormValue("data_upload_path", data?.filename, { shouldValidate: true });
                        trigger();

                        setShowDataInfos(true);
                        setFileUploadInProgress(false);
                    })
                    .catch((err) => {
                        console.error(err);
                        setFileUploadInProgress(false);
                        setDataFileError(err?.msg);
                    });
            })
            .catch((err) => {
                console.error(err);
                setFileUploadInProgress(false);
                setDataFileError(err?.msg);
            });
    };

    return (
        <Main title={t("title", { datasheetName })}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                <Button
                    iconId="fr-icon-arrow-left-s-line"
                    priority="tertiary no outline"
                    linkProps={
                        datasheetName === undefined
                            ? routes.datasheet_list({ datastoreId }).link
                            : routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab: "dataset" }).link
                    }
                    title={t("back_to", { datasheetName: datasheetName })}
                    size="large"
                />
                <h1 className={fr.cx("fr-m-0")}>{t("title", { datasheetName: datasheetName })}</h1>
            </div>

            <p>{tCommon("mandatory_fields")}</p>

            <Input
                label={t("datasheet.name")}
                hintText={t("datasheet.name_hint")}
                state={errors.data_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_name?.message}
                nativeInputProps={{
                    ...register("data_name"),
                    defaultValue: datasheetName,
                    readOnly: !!datasheetName,
                }}
                className={fr.cx(!!datasheetName && "fr-hidden")}
            />
            <Upload
                label={t("upload")}
                hint={t("upload_hint")}
                state={dataFileError === undefined ? "default" : "error"}
                stateRelatedMessage={dataFileError}
                nativeInputProps={{ onChange: postDataFile, ref: dataFileRef, accept: ".gpkg,.zip" }}
                className={fr.cx("fr-input-group")}
            />
            {fileUploadInProgress && <Progress label={t("upload_running")} value={progressValue} max={progressMax} />}

            {showDataInfos && (
                <div className={fr.cx("fr-mt-2v")}>
                    <h5>{t("data_infos_title")}</h5>

                    <Input
                        label={t("technical_name")}
                        hintText={t("technical_name_hint")}
                        state={errors.data_technical_name ? "error" : "default"}
                        stateRelatedMessage={errors?.data_technical_name?.message}
                        nativeInputProps={{
                            ...register("data_technical_name"),
                        }}
                    />

                    <SelectNext
                        label={t("projection")}
                        state={errors.data_srid ? "error" : "default"}
                        stateRelatedMessage={errors?.data_srid?.message}
                        nativeSelectProps={{
                            ...register("data_srid"),
                            value: selectedSrid,
                        }}
                        placeholder={t("select_projection")}
                        options={Object.entries(projections).map(([code, name]) => ({
                            label: name,
                            value: code,
                        }))}
                    />

                    <input type="hidden" {...register("data_upload_path")} />
                </div>
            )}

            <ButtonsGroup
                buttons={[
                    {
                        linkProps: routes.datasheet_list({ datastoreId }).link,
                        children: tCommon("cancel"),
                        priority: "secondary",
                    },
                    {
                        children: t("upload_file"),
                        onClick: () => {
                            const dataFile = dataFileRef.current?.files?.[0];
                            validateDataFile(dataFile);
                            handleSubmit(onSubmit)();
                        },
                    },
                ]}
                inlineLayoutWhen="always"
                alignment="right"
                className={fr.cx("fr-mt-2w")}
            />

            {isValidating && (
                <Wait>
                    <LoadingIcon largeIcon={true} />
                </Wait>
            )}

            {addUploadMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("datasheet.creation_running")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}

            {addUploadMutation.isSuccess && addUploadMutation.data?._id !== undefined && (
                <Wait>
                    <DatasheetUploadIntegrationDialog datastoreId={datastoreId} uploadId={addUploadMutation.data?._id} datasheetName={datasheetName} />
                </Wait>
            )}
        </Main>
    );
};

DatasheetUploadForm.displayName = symToStr({ DatasheetUploadForm });

export default DatasheetUploadForm;
