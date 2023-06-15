import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { format as datefnsFormat } from "date-fns";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToDashboard from "../../components/Utils/BtnBackToDashboard";
import Progress from "../../components/Utils/Progress";
import Wait from "../../components/Utils/Wait";
import { defaultProjections } from "../../config/projections";
import FileUploader from "../../modules/FileUploader";
import { jsonFetch } from "../../modules/jsonFetch";

const maxFileSize = 2000000000; // 2 GB
const fileExtensions = ["gpkg", "zip"];

const getExtension = (filename) => {
    if (!filename) return "";
    return filename.split(".").pop().toLowerCase();
};

const schema = yup
    .object({
        data_name: yup.string().required("Le nom de la donnée est obligatoire"),
        data_technical_name: yup.string().required("Le nom technique de la donnée est obligatoire"),
        data_srid: yup.string().required("La projection (srid) est obligatoire"),
        data_type: yup.string().required("Le format de donnée est obligatoire"),
        data_upload_path: yup.string(),
    })
    .required();

const fileUploader = new FileUploader();

const DataNewForm = ({ datastoreId }) => {
    let uuid = "";

    // Progress
    const [showProgress, setShowProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMax, setProgressMax] = useState(0);

    const [showDataInfos, setShowDataInfos] = useState(false);
    const [projections, setProjections] = useState(defaultProjections);

    const [srid, setSrid] = useState(""); // srid

    const [dataFileError, setDataFileError] = useState(null);
    const dataFileRef = useRef();

    const [showWait, setShowWait] = useState(true);

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
    }, [showDataInfos]);

    const getProjFromEpsg = (srid) => {
        const match = srid.match(/EPSG:(\d+)/);
        if (!match) return;

        return jsonFetch(`https://epsg.io/${match[1]}.json`, {}, false, false);
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue: setFormValue,
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = (formData) => {
        console.log(errors);
        console.log(formData);

        const dataFile = dataFileRef.current?.files?.[0];

        if (isValid && validateDataFile(dataFile)) {
            const url = Routing.generate("cartesgouvfr_api_upload_add", { datastoreId: datastoreId });
            jsonFetch(url, {
                method: "POST",
                body: formData,
            }).then((response) => {
                console.log(response);
                setShowWait(true);
            });
        }
    };

    const validateDataFile = (file) => {
        if (!file) {
            setDataFileError("Aucun fichier téléversé");
            return false;
        }

        const extension = getExtension(file.name);
        if (!fileExtensions.includes(extension)) {
            setDataFileError(`L'extension du fichier ${file.name} n'est pas correcte`);
            return false;
        }

        if (file.size > maxFileSize) {
            setDataFileError(`La taille maximale pour un fichier est de ${maxFileSize}`);
            return false;
        }

        return true;
    };

    const postDataFile = (e) => {
        setDataFileError(null);
        setShowDataInfos(false);

        const file = e.currentTarget.files?.[0];
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
                            getProjFromEpsg(srid)
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
                        setDataFileError(err?.data.msg);
                    });
            })
            .catch((err) => {
                console.error(err);
                setShowProgress(false);
                setDataFileError(err?.data.msg);
            });
    };

    const getDataTechNameSuggestion = (fileName) => {
        let dataTechName = fileName.replace(/ /g, "_");
        dataTechName = dataTechName.replace(/\./g, "_");
        dataTechName += "_" + datefnsFormat(new Date(), "dd-MM-yyyy");

        return dataTechName;
    };

    return (
        <AppLayout>
            <h2>Créer une fiche de données</h2>
            <Input
                label="Nom de votre fiche de donnée"
                hintText="Ce nom vous permettra d’identifier votre donnée dans la géoplateforme, soyez aussi clair que possible."
                state={errors.data_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_name?.message}
                nativeInputProps={{
                    ...register("data_name"),
                }}
            />
            {/* A remplacer par le composant Upload quand il sera prêt (https://react-dsfr-components.etalab.studio/?path=/docs/components-upload--default) */}
            <Input
                label="Déposez votre fichier de données"
                hintText="Formats de fichiers autorisés : archive zip contenant un Geopackage (recommandé) ou un CSV..."
                state={dataFileError === null ? "default" : "error"}
                stateRelatedMessage={dataFileError}
                nativeInputProps={{ type: "file", onChange: postDataFile, className: fr.cx("fr-upload"), ref: dataFileRef }}
            />
            {showProgress && <Progress label={"Upload en cours ..."} value={progressValue} max={progressMax} />}
            {showDataInfos && (
                <>
                    <div className={fr.cx("fr-mt-2v")}>
                        <h5>Les données suivantes ont été détectées. Modifiez les si besoins</h5>
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
                            placeholder="Selectionnez une Projection"
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
                        <Input
                            nativeInputProps={{
                                ...register("data_upload_path"),
                                type: "hidden",
                            }}
                        />
                    </div>
                </>
            )}
            <Button
                onClick={() => {
                    const dataFile = dataFileRef.current?.files?.[0];
                    validateDataFile(dataFile);
                    handleSubmit(onSubmit)();
                }}
            >
                Soumettre
            </Button>
            <BtnBackToDashboard datastoreId={datastoreId} className={fr.cx("fr-ml-2w")} />

            <Button onClick={() => setShowWait(true)}>Afficher attente</Button>
            <Wait show={showWait}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-1")}>
                        <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg")} />
                    </div>
                    <div className={fr.cx("fr-col-11")}>
                        <h6 className={fr.cx("fr-h6")}>Vos données vecteur sont en cours de dépôt</h6>
                    </div>
                </div>
                <div className={fr.cx("fr-grid-row", "fr-px-4w")}>
                    <ul>
                        <li>Etape 1</li>
                        <li>Etape 2</li>
                        <li>Etape 3</li>
                        <li>Etape 4</li>
                    </ul>
                </div>
                <div className={fr.cx("fr-grid-row")}>
                    <Button onClick={() => setShowWait(false)} iconPosition="right">
                        Continuer
                    </Button>
                </div>
            </Wait>
        </AppLayout>
    );
};

DataNewForm.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DataNewForm;
