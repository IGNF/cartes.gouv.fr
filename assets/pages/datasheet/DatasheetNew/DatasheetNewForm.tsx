import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { format as datefnsFormat } from "date-fns";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import Progress from "../../../components/Utils/Progress";
import Wait from "../../../components/Utils/Wait";
import defaultProjections from "../../../data/default_projections.json";
import functions from "../../../functions";
import FileUploader from "../../../modules/FileUploader";
import RQKeys from "../../../modules/RQKeys";
import Translator from "../../../modules/Translator";
import { routes } from "../../../router/router";
import DatasheetNewIntegrationDialog from "./DatasheetNewIntegration/DatasheetNewIntegrationDialog";

import "./../../../sass/components/spinner.scss";

const maxFileSize = 2000000000; // 2 GB
const fileExtensions = ["gpkg", "zip"];

const fileUploader = new FileUploader();

const DatasheetNewForm = ({ datastoreId }) => {
    let uuid = "";

    const schema = yup
        .object({
            data_name: yup
                .string()
                .required("Le nom de la donnée est obligatoire")
                .test({
                    name: "does-not-contain-equals",
                    test(dataName, ctx) {
                        if (dataName.includes("=")) {
                            return ctx.createError({ message: "Le nom de la fiche de donnée ne peut pas contenir le symbole égal `=`" });
                        }

                        return true;
                    },
                })
                .test({
                    name: "is-unique",
                    test(dataName, ctx) {
                        const existingDataList = dataListQuery?.data?.map((data) => data?.name);
                        if (existingDataList?.includes(dataName)) {
                            return ctx.createError({ message: `Une fiche de donnée existe déjà avec le nom "${dataName}"` });
                        }

                        return true;
                    },
                }),
            data_technical_name: yup.string().required("Le nom technique de la donnée est obligatoire"),
            data_srid: yup.string().required("La projection (srid) est obligatoire"),
            data_type: yup.string().required("Le format de donnée est obligatoire"),
            data_upload_path: yup.string(),
        })
        .required();

    // Progress
    const [showProgress, setShowProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMax, setProgressMax] = useState(0);

    const [showDataInfos, setShowDataInfos] = useState(false);
    const [projections, setProjections] = useState(defaultProjections);

    const [srid, setSrid] = useState(""); // srid

    const [dataFileError, setDataFileError] = useState<string>();
    const dataFileRef = useRef<HTMLInputElement>(null);

    const [uploadCreationInProgress, setUploadCreationInProgress] = useState<boolean>(false);
    const [uploadCreatedSuccessfully, setUploadCreatedSuccessfully] = useState<boolean>(false);
    const [uploadId, setUploadId] = useState<string>();

    const [shouldFetchDataList, setShouldFetchDataList] = useState<boolean>(true);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isValidating },
        setValue: setFormValue,
    } = useForm({ resolver: yupResolver(schema) });

    const dataListQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_list(datastoreId),
        queryFn: () => api.datasheet.getList(datastoreId),
        refetchInterval: 20000,
        enabled: shouldFetchDataList,
    });

    useEffect(() => {
        setProgressValue(0);
    }, [showProgress]);

    useEffect(() => {
        if (!showDataInfos) {
            setFormValue("data_name", "");
            setFormValue("data_upload_path", "");
            setFormValue("data_technical_name", "");
            setFormValue("data_type", "");
        }
    }, [showDataInfos, setFormValue]);

    const onSubmit = async (formData) => {
        console.debug("errors", errors);
        console.debug("formData", formData);

        const dataFile = dataFileRef.current?.files?.[0];

        if (isValid && validateDataFile(dataFile)) {
            setUploadCreationInProgress(true);

            api.upload.add(datastoreId, formData).then((response) => {
                console.debug(response);
                setUploadCreatedSuccessfully(true);
                setUploadId(response?._id);
                setShouldFetchDataList(false);
            });
        }
    };

    const validateDataFile = (file) => {
        if (!file) {
            setDataFileError("Aucun fichier téléversé");
            return false;
        }

        const extension = functions.path.getFileExtension(file.name);
        if (!extension || !fileExtensions.includes(extension)) {
            setDataFileError(`L'extension du fichier ${file.name} n'est pas correcte`);
            return false;
        }

        if (file.size > maxFileSize) {
            setDataFileError(`La taille maximale pour un fichier est de ${maxFileSize}`);
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

        uuid = uuidv4();
        setShowProgress(true);
        setProgressMax(file.size);

        fileUploader
            .uploadFile(uuid, file, setProgressValue)
            .then(() => {
                fileUploader
                    .uploadComplete(uuid, file)
                    .then((data) => {
                        const srid = data?.srid;

                        if (srid in projections) {
                            setSrid(srid);
                        } else {
                            api.epsg
                                .getProjFromEpsg(srid)
                                .then((proj) => {
                                    const projectionsClone = { ...projections };
                                    projectionsClone[srid] = proj.name;
                                    setProjections(projectionsClone);
                                    setSrid(srid);
                                })
                                .catch((err) => console.error(err));
                        }

                        setFormValue("data_technical_name", getDataTechNameSuggestion(file.name), { shouldValidate: true });
                        setFormValue("data_type", "vector", { shouldValidate: true }); // TODO : vector pour l'instant
                        setFormValue("data_upload_path", data?.filename, { shouldValidate: true });

                        setShowDataInfos(true);
                        setShowProgress(false);
                    })
                    .catch((err) => {
                        console.error(err);
                        setShowProgress(false);
                        setDataFileError(err?.msg);
                    });
            })
            .catch((err) => {
                console.error(err);
                setShowProgress(false);
                setDataFileError(err?.msg);
            });
    };

    const getDataTechNameSuggestion = (fileName) => {
        let dataTechName = fileName.replace(/ /g, "_");
        dataTechName = dataTechName.replace(/\./g, "_");
        dataTechName += "_" + datefnsFormat(new Date(), "dd-MM-yyyy");

        return dataTechName;
    };

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Nouvelle fiche de données">
            <h1>Créer une fiche de données</h1>

            <p>{Translator.trans("mandatory_fields")}</p>

            <Input
                label="Nom de votre fiche de donnée"
                hintText="Ce nom vous permettra d’identifier votre donnée dans la géoplateforme, soyez aussi clair que possible."
                state={errors.data_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_name?.message}
                nativeInputProps={{
                    ...register("data_name"),
                }}
            />
            {/* A remplacer par le composant Upload quand cette issue sera corrigée (https://github.com/codegouvfr/react-dsfr/issues/155 | https://react-dsfr-components.etalab.studio/?path=/docs/components-upload--default) */}
            <Input
                label="Déposez votre fichier de données"
                hintText="Formats de fichiers autorisés : archive zip contenant un Geopackage (recommandé) ou un CSV..."
                state={dataFileError === undefined ? "default" : "error"}
                stateRelatedMessage={dataFileError}
                nativeInputProps={{ type: "file", onChange: postDataFile, className: fr.cx("fr-upload"), ref: dataFileRef }}
            />
            {/* <Upload
                hint="Formats de fichiers autorisés : archive zip contenant un Geopackage (recommandé) ou un CSV..."
                state={dataFileError === undefined ? "default" : "error"}
                stateRelatedMessage={dataFileError}
                nativeInputProps={{ onChange: postDataFile, ref: dataFileRef }}
            /> */}
            {showProgress && <Progress label={"Upload en cours ..."} value={progressValue} max={progressMax} />}
            {showDataInfos && (
                <div className={fr.cx("fr-mt-2v")}>
                    <h5>Les données suivantes ont été détectées. Modifiez les si besoin</h5>
                    <Input
                        label="Nom technique de votre donnée:"
                        hintText="Ce nom technique est invisible par votre utilisateur final. Il apparaitra uniquement dans votre espace de travail"
                        state={errors.data_technical_name ? "error" : "default"}
                        stateRelatedMessage={errors?.data_technical_name?.message}
                        nativeInputProps={{
                            ...register("data_technical_name"),
                        }}
                    />
                    <Select
                        label="Projection de vos données"
                        nativeSelectProps={{
                            ...register("data_srid"),
                            onChange: (e) => setSrid(e.target.value),
                            value: srid,
                        }}
                    >
                        <option value="" disabled>
                            Selectionnez une Projection
                        </option>

                        {Object.entries(projections).map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </Select>
                    <RadioButtons
                        state={errors.data_type ? "error" : "default"}
                        stateRelatedMessage={errors?.data_type?.message}
                        legend="Format du fichier déposé"
                        options={[
                            {
                                label: "Vecteur",
                                nativeInputProps: {
                                    ...register("data_type"),
                                    value: "vector",
                                },
                            },
                            {
                                label: "Raster",
                                nativeInputProps: {
                                    ...register("data_type"),
                                    value: "raster",
                                },
                            },
                        ]}
                        orientation="horizontal"
                    />
                    <input type="hidden" {...register("data_upload_path")} />
                </div>
            )}
            <ButtonsGroup
                buttons={[
                    {
                        linkProps: routes.datasheet_list({ datastoreId }).link,
                        children: "Annuler",
                    },
                    {
                        onClick: () => {
                            const dataFile = dataFileRef.current?.files?.[0];
                            validateDataFile(dataFile);
                            handleSubmit(onSubmit)();
                        },
                        children: "Déposer votre fichier",
                    },
                ]}
                inlineLayoutWhen="always"
                alignment="right"
                className={fr.cx("fr-mt-2w")}
            />

            {isValidating && (
                <Wait>
                    <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
                </Wait>
            )}

            {uploadCreationInProgress && uploadId && (
                <Wait>
                    {uploadCreatedSuccessfully ? (
                        <DatasheetNewIntegrationDialog datastoreId={datastoreId} uploadId={uploadId} />
                    ) : (
                        <>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
                            <p>Création de la fiche en cours</p>
                        </>
                    )}
                </Wait>
            )}
        </DatastoreLayout>
    );
};

DatasheetNewForm.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

DatasheetNewForm.displayName = symToStr({ DatasheetNewForm });

export default DatasheetNewForm;
