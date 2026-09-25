import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { ChangeEventHandler, RefObject } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "react-hook-form";
import { tss } from "tss-react";

import Progress from "@/components/Utils/Progress";
import { DATASET_FILE_EXTENSIONS } from "@/utils";
import { DATASET_DESCRIPTION_MAX_LENGTH, DATASET_NAME_MAX_LENGTH, type DatasetAddFormValues } from "../datasetAddSchema";

const formatsHelpModal = createModal({
    id: "dataset-add-formats-help-modal",
    isOpenedByDefault: false,
});

type DatasetSectionProps = {
    fileInputRef: RefObject<HTMLInputElement | null>;
    fileError?: string;
    uploadInProgress: boolean;
    progressValue: number;
    progressMax: number;
    onFileChange: ChangeEventHandler<HTMLInputElement>;
};

export default function DatasetSection({ fileInputRef, fileError, uploadInProgress, progressValue, progressMax, onFileChange }: DatasetSectionProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext<DatasetAddFormValues>();

    // le fichier est porté par data_upload_path (renseigné après téléversement réussi)
    const uploadPathError = errors.data_upload_path?.message;

    const { classes, cx } = useStyles();

    return (
        <div>
            <Upload
                label="Ajouter un fichier"
                hint="Taille maximale : 2 Go. Types de données acceptés : Vecteur. Formats de fichiers acceptés : GeoPackage, Shapefile, GeoJSON, CSV, SQL ou zip contenant l’un de ces formats."
                state={fileError !== undefined || uploadPathError !== undefined ? "error" : "default"}
                stateRelatedMessage={fileError ?? uploadPathError}
                nativeInputProps={{
                    ref: fileInputRef,
                    onChange: onFileChange,
                    accept: DATASET_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(","),
                }}
                className={fr.cx("fr-input-group", "fr-mb-4v")}
            />

            <div className={cx(classes.uploadFooter, fr.cx("fr-mb-4v"))}>
                <Button
                    type="button"
                    priority="tertiary no outline"
                    className={cx(classes.formatsHelpButton, fr.cx("fr-link"))}
                    onClick={() => formatsHelpModal.open()}
                    size="small"
                >
                    <span className={fr.cx("fr-icon-eye-fill", "fr-icon--sm", "fr-mr-2v")} />
                    Plus d’informations sur les formats acceptés
                </Button>
                {uploadInProgress && <Progress label="Téléversement du fichier en cours ..." value={progressValue} max={progressMax} />}
            </div>

            <Input
                label="Nom du jeu de données"
                state={errors.name ? "error" : "default"}
                stateRelatedMessage={errors.name?.message}
                nativeInputProps={{ ...register("name"), maxLength: DATASET_NAME_MAX_LENGTH }}
            />

            <Input
                label="Description"
                textArea
                state={errors.description ? "error" : "default"}
                stateRelatedMessage={errors.description?.message}
                nativeTextAreaProps={{ ...register("description"), maxLength: DATASET_DESCRIPTION_MAX_LENGTH, rows: 4 }}
            />

            {createPortal(
                <formatsHelpModal.Component title="Configurer vos fichiers">
                    <p>Taille maximale : 2 Go. Types de données acceptés : Vecteurs.</p>
                    <p className={fr.cx("fr-mb-1v")}>Formats de fichiers acceptés :</p>
                    <ul>
                        <li>GeoPackage (.gpkg ou .zip avec au moins un .gpkg)</li>
                        <li>Shapefile (.zip avec .shp, .shx, .dbf et .prj, .cpg, .qix, .xml)</li>
                        <li>GeoJSON (.geojson ou .zip avec au moins un .geojson)</li>
                        <li>
                            CSV (.csv ou .zip avec au moins un .csv).
                            <br />
                            Le fichier doit inclure : une colonne géométrie nommée json, geom, the_geom, wkb ou wkt, ou pour les points, deux colonnes
                            coordonnées nommées lon et lat, x et y ou longitude et latitude.
                        </li>
                        <li>
                            SQL (.sql ou .zip avec au moins un .sql).
                            <br />
                            Seules les instructions suivantes sont permises : CREATE TABLE, CREATE VIEW, CREATE INDEX, CREATE SEQUENCE, ALTER TABLE, ALTER
                            SEQUENCE. Aucun nom de schéma ne doit être présent (ex : public.table interdit).
                        </li>
                    </ul>
                </formatsHelpModal.Component>,
                document.body
            )}
        </div>
    );
}

const useStyles = tss.withName({ DatasetSection }).create({
    uploadFooter: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: "0.5rem",
    },
    formatsHelpButton: {
        color: fr.colors.decisions.text.default.info.default,
        borderBottom: `1px solid ${fr.colors.decisions.text.default.info.default}`,
        padding: 0,
    },
});
