import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToDashboard from "../../components/Utils/BtnBackToDashboard";
import MapWrapper from "../../components/Utils/MapWrapper";
import Progress from "../../components/Utils/Progress";
import { defaultProjections } from "../../config/projections";

const maxFileSize = 2000000000; // 2 GB
const fileExtensions = ["csv", "gpkg", "zip"];

const getExtension = (filename) => {
    if (!filename) return "";
    return filename.split(".").pop().toLowerCase();
};

const schema = yup
    .object({
        data_name: yup.string().required("Le nom de la donnée est obligatoire"),
        data_file: yup
            .mixed()
            .test("is-missing", "Aucun fichier téléversé", (value) => {
                console.log(value);
                return value.length > 0;
            })
            .test("is-too-big", `La taille maximale pour un fichier est de ${maxFileSize}`, (value) => {
                const file = value[0] || null;
                return file && file.size <= maxFileSize;
            }),
    })
    .required();

const DataNewForm = ({ datastoreId }) => {
    let uuid = "";

    const maxChunkSize = 16000000; // 16 MB
    const urlUploadChunk = Routing.generate("cartesgouvfr_app_upload_chunk");
    const urlUploadComplete = Routing.generate("cartesgouvfr_app_upload_complete");

    // Progress
    const [showProgress, setShowProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMax, setProgressMax] = useState(0);

    useEffect(() => {
        setProgressValue(0);
    }, [showProgress]);

    const [showDataInfos, setShowDataInfos] = useState(false);
    const [srid, setSrid] = useState("");
    const [projections, setProjections] = useState(defaultProjections);

    const getProjFromEpsg = (srid) => {
        const match = srid.match(/EPSG:(\d+)/);
        if (!match) return;

        return fetch(`https://epsg.io/${match[1]}.json`).then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(text);
                });
            } else return response.json();
        });
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = (formData) => {
        console.log(errors);
        console.log(formData);
    };

    const uploadFile = async (uuid, file, maxChunkSize) => {
        let numBytes = 0;

        const uploadChunk = async (index, chunk) => {
            const chunkFile = new File([chunk], "chunk");

            const formData = new FormData();
            formData.append("uuid", uuid);
            formData.append("index", index);
            formData.append("chunk", chunkFile, `${uuid}_${index}`);

            return fetch(urlUploadChunk, {
                method: "POST",
                body: formData,
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const text = await response.text();
                        return { status: "error", msg: text };
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    return { status: "ok", numBytes: data.numBytes };
                })
                .catch((err) => {
                    return { status: "error", msg: err.message };
                });
        };

        return new Promise((resolve, reject) => {
            (async function () {
                let index = 1,
                    start = 0;

                while (start < file.size) {
                    const chunk = file.slice(start, start + maxChunkSize);

                    let response = await uploadChunk(index, chunk);
                    if (response.status === "error") {
                        reject(new Error(response.msg));
                    }

                    numBytes += response.numBytes;
                    setProgressValue(numBytes);

                    index += 1;
                    start += maxChunkSize;
                }
                resolve();
            })();
        });
    };

    const handleFileChanged = (e) => {
        errors.data_file = null;
        const file = e.currentTarget.files[0];
        setShowDataInfos(false);

        const extension = getExtension(file.name);
        if (!fileExtensions.includes(extension)) {
            e.currentTarget.value = "";
            // TODO Envoyer une erreur propre
            return;
        }

        uuid = uuidv4();
        setShowProgress(true);
        setProgressMax(file.size);

        // const chunks = createFileChunk(file);

        uploadFile(uuid, file, maxChunkSize).then(() => {
            const formData = new FormData();
            formData.append("uuid", uuid);
            formData.append("originalFilename", file.name);

            fetch(urlUploadComplete, { method: "POST", body: formData })
                .then(async (response) => {
                    if (!response.ok) {
                        const text = await response.text();
                        throw new Error(text);
                    } else return response.json();
                })
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
                    setShowDataInfos(true);
                    setShowProgress(false);
                })
                .catch((err) => {
                    console.error(err);
                    setShowProgress(false);
                });
        });
    };

    return (
        <AppLayout>
            <h2>Créer une fiche de données</h2>
            <Input
                label="Nom de votre fiche de donnée"
                hintText="Ce nom vous permettra d’identifier votre donnée dans la géoplateforme, soyez aussi clair que possible."
                state={errors.data_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_name?.message}
                nativeInputProps={register("data_name")}
            />
            <Input
                label="Déposez votre fichier de données"
                hintText="Formats de fichiers autorisés : archive zip contenant un Geopackage (recommandé) ou un CSV..."
                state={errors.data_file ? "error" : "default"}
                stateRelatedMessage={errors?.data_file?.message}
                nativeInputProps={{ ...register("data_file"), type: "file", onChange: handleFileChanged }}
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
                        />
                        <Select
                            label="Projection de vos données"
                            placeholder="Selectionnez une Projection"
                            nativeSelectProps={{
                                onChange: (event) => setSrid(event.target.value),
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
                            legend="Format du fichier déposé"
                            name="radio"
                            options={[
                                {
                                    label: "Vecteur",
                                    nativeInputProps: {
                                        value: "vector",
                                    },
                                },
                                {
                                    label: "Raster",
                                    nativeInputProps: {
                                        value: "raster",
                                    },
                                },
                            ]}
                            orientation="horizontal"
                        />
                    </div>
                    <div className={fr.cx("fr-mt-2v")}>
                        <MapWrapper id={"map"} zoom={5} className={"zoom-range-map"} />
                    </div>
                </>
            )}
            <Button onClick={handleSubmit(onSubmit)}>Soumettre</Button>
            <BtnBackToDashboard datastoreId={datastoreId} className={fr.cx("fr-ml-2w")} />
        </AppLayout>
    );
};

DataNewForm.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DataNewForm;
