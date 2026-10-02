import { ChangeEventHandler, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import FileUploader from "@/modules/FileUploader";
import { DATASET_FILE_EXTENSIONS, DATASET_MAX_FILE_SIZE, getFileExtension, looksLikeShapefileComponent, mapIgnfToEpsg } from "@/utils";

const fileUploader = new FileUploader();

export type DatasetFileUploadResult = {
    /** projection détectée dans le fichier (déjà convertie IGNF → EPSG si nécessaire) */
    srid?: string;
    /** chemin du fichier téléversé côté serveur */
    uploadPath: string;
};

type UseDatasetFileUploadOptions = {
    /** appelé dès qu'un nouveau fichier est sélectionné, avant validation */
    onFileSelected?: () => void;
    /** appelé quand le téléversement s'est terminé avec succès */
    onUploadSuccess: (result: DatasetFileUploadResult) => void;
};

/** téléversement du fichier de données (validation, envoi, progression, détection de projection) */
export default function useDatasetFileUpload({ onFileSelected, onUploadSuccess }: UseDatasetFileUploadOptions) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // identifiant du téléversement courant : un nouveau fichier remplace le précédent, dont les callbacks sont alors ignorés
    const currentUploadRef = useRef<string | undefined>(undefined);
    const [fileError, setFileError] = useState<string>();
    const [uploadInProgress, setUploadInProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMax, setProgressMax] = useState(0);

    const validateDataFile = (file?: File): boolean => {
        if (!file) {
            setFileError("Veuillez sélectionner un fichier");
            return false;
        }

        if (looksLikeShapefileComponent(file.name)) {
            setFileError(`Le fichier ${file.name} semble faire partie d’un Shapefile. Déposez une archive zip contenant tous les fichiers composants.`);
            return false;
        }

        const extension = getFileExtension(file.name);
        if (!extension || !DATASET_FILE_EXTENSIONS.includes(extension)) {
            setFileError(`L’extension du fichier ${file.name} n’est pas acceptée`);
            return false;
        }

        if (file.size > DATASET_MAX_FILE_SIZE) {
            setFileError("La taille du fichier ne peut pas excéder 2 Go");
            return false;
        }

        return true;
    };

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = () => {
        setFileError(undefined);
        onFileSelected?.();

        const file = fileInputRef.current?.files?.[0];
        if (!file || !validateDataFile(file)) {
            return;
        }

        const uuid = uuidv4();
        currentUploadRef.current = uuid;
        setUploadInProgress(true);
        setProgressValue(0);
        setProgressMax(file.size);

        const isCurrent = () => currentUploadRef.current === uuid;

        fileUploader
            .uploadFile(uuid, file, (value) => isCurrent() && setProgressValue(value))
            .then(() => fileUploader.uploadComplete(uuid, file))
            .then((data) => {
                if (!isCurrent()) {
                    return;
                }

                onUploadSuccess({
                    // projection déduite du fichier déposé (mapping IGNF → EPSG si nécessaire)
                    srid: mapIgnfToEpsg(data?.srid),
                    uploadPath: String(data?.filename ?? ""),
                });
            })
            .catch((err) => {
                console.error(err);
                if (isCurrent()) {
                    setFileError(err?.msg ?? "Le téléversement du fichier a échoué");
                }
            })
            .finally(() => {
                if (isCurrent()) {
                    setUploadInProgress(false);
                }
            });
    };

    return { fileInputRef, fileError, uploadInProgress, progressValue, progressMax, handleFileChange };
}
