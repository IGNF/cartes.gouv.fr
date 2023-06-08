import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select"; 
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { v4 as uuidv4 } from "uuid";
import Button from "@codegouvfr/react-dsfr/Button";
import AppLayout from "../../components/Layout/AppLayout";
import { defaultProjections } from "../../config/projections";
// import Autocomplete from "../../components/Utils/Autocomplete";
import MapWrapper from "../../components/Utils/MapWrapper";
import "./../../sass/components/zoom-range-map.scss";

const maxFileSize =  2000000000; // 2 GB
const fileExtensions = ["csv", "gpkg", "zip"]; // TODO zip

const getExtension = filename => {
    if (! filename) return "";
    return  filename.split(".").pop().toLowerCase();
};

const schema = yup
    .object({
        data_name: yup.string().required("Le nom de la donnée est obligatoire"),
        date_file: yup.mixed()
            .required("Un fichier associé est obligatoire")
            .test("is-valid-size", `La taille maximale pour un fichier est de ${maxFileSize}`,
                value => value && value.size <= maxFileSize)
            .test("is-valid-extension", "Seuls les types de fichiers zip, gpkg et csv sont autorisés", 
                value => value && fileExtensions.includes(getExtension(value.name))
            )   
    })
    .required();

const DataNewForm = ({ datastoreId }) => {
    let uuid = "";

    const maxChunkSize = 16000000; // 16 MB
    const uploadChunk       = Routing.generate("cartesgouvfr_app_upload_chunk");
    const uploadComplete    = Routing.generate("cartesgouvfr_app_upload_complete");

    const [showDataInfos, setshowDataInfos] = useState(false);
    const [srid, setSrid] = useState(null);
    const [projections, setProjections] = useState(defaultProjections);

    useEffect(() => {
        if (! srid) return;
        if (srid in projections) {
            return;
        }

        const match = srid.match(/EPSG:(\d+)/);
        if (match) {
            fetch(`https://epsg.io/${match[1]}.json`)
                .then(response => response.json())
                .then(data => {
                    setProjections([...projections, { code: srid, name: data.name }]); 
                    setSrid(srid); 
                })
                .catch(err => console.log(err));
        }
    }, [showDataInfos]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = (formData) => {
        console.log(errors);
        console.log(formData);
    };

    const createFileChunk = file => {
        const fileChunkList = [];
        
        let cur = 0;
        while (cur < file.size) {
            const chunk = file.slice(cur, cur + maxChunkSize);
            fileChunkList.push({ chunk: chunk, size: chunk.size });
            cur += maxChunkSize;
        }
        return fileChunkList;
    };

    const handleFileChanged = e => {
        const file = e.currentTarget.files[0];
        
        const extension = getExtension(file.name);
        if (! fileExtensions.includes(extension)) {
            e.currentTarget.value = "";
            // TODO Envoyer une erreur propre
            return;
        }

        uuid = uuidv4();
        const chunks = createFileChunk(file);

        const promises = chunks.map((chunkProps, index) => {
            const chunkFile = new File([chunkProps.chunk], "chunk");
            const formData = new FormData();
            
            formData.append("uuid", uuid);
            formData.append("chunk", chunkFile, `${uuid}_${index}`);
            formData.append("index", index);
            return fetch(uploadChunk, { 
                method: "POST",
                body: formData 
            }).then(() => {

            });
        });
        
        Promise.all(promises).then(() => {
            // Tout s'est bien passe, on merge tous les fichiers
            const formData = new FormData();
            formData.append("uuid", uuid);
            formData.append("originalFilename", file.name);

            fetch(uploadComplete, { method: "POST", body: formData })
                .then(response => response.json())
                .then(data => {
                    if (data.srid) {
                        setSrid(data.srid);
                    }
                    setshowDataInfos(true);
                }).catch(err => {
                    console.log(err.message); 
                });

        }).catch(err => { 
            uuid = "";
            console.log(err.message); 
        });
    };

    const fileProps = { type: "file", onChange: handleFileChanged };

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
                stateRelatedMessage={errors?.data_name?.message}
                // nativeInputProps={{ type: "file", onChange: handleFileChanged}}
                nativeInputProps={{...register("data_file"), ...fileProps}}
            />
            <MapWrapper id={"map-xxxxxx"} zoom={5} className={"zoom-range-map"} />
            {
                showDataInfos && 
                <div className={fr.cx("fr-mt-2v")}>
                    <h5>Les données suivantes ont été détectées. Modifiez les si besoins</h5>
                    <Input
                        label="Nom technique de votre donnée:"
                        hintText="Ce nom technique est invisible par votre utilisateur final. Il apparaitra uniquement dans votre espace de travail"
                        state={errors.data_technical_name ? "error" : "default"}
                        stateRelatedMessage={errors?.data_technical_name?.message}
                    />
                    {/* <Autocomplete minChar={3} /> */}
                    <Select
                        label="Projection de vos données"
                        nativeSelectProps={{
                            onChange: event => setSrid(event.target.value)
                        }}
                    >
                        {srid === null ? (
                            <option value="" disabled selected hidden>Selectionnez une Projection</option>
                        ) : ( 
                            <option value="" disabled hidden>Selectionnez une Projection</option>
                        )}
                        {
                            projections.map((proj) => { 
                                if (proj.code === srid) {
                                    return <option key={proj.code} value={proj.code} selected>{proj.name}</option>;
                                } else {
                                    return <option key={proj.code} value={proj.code}>{proj.name}</option>;
                                }
                            })                           
                        }
                    </Select>
                </div>
                
            }
            <Button onClick={handleSubmit(onSubmit)}>Soumettre</Button>
        </AppLayout>
    );
};

DataNewForm.propTypes = {
    datastoreId: PropTypes.string.isRequired,
};

export default DataNewForm;
