import { ChangeEventHandler, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useTranslation } from "@/i18n";
import FileUploader from "@/modules/FileUploader";
import { DATASET_FILE_EXTENSIONS, DATASET_MAX_FILE_SIZE, getFileExtension, looksLikeShapefileComponent, mapIgnfToEpsg } from "@/utils";

const fileUploader = new FileUploader();

export type DatasetFileUploadResult = {
    /** projection lue dans le fichier, IGNF convertie en EPSG */
    srid?: string;
    /** chemin du fichier téléversé côté serveur */
    uploadPath: string;
};

type UseDatasetFileUploadOptions = {
    onFileSelected: () => void;
    onUploadSuccess: (result: DatasetFileUploadResult) => void;
};

/** téléversement du fichier de données avant la soumission du formulaire */
export default function useDatasetFileUpload({ onFileSelected, onUploadSuccess }: UseDatasetFileUploadOptions) {
    const { t } = useTranslation("DatasetAdd");
    const fileInputRef = useRef<HTMLInputElement>(null);
    // un nouveau fichier remplace le précédent, dont les rappels sont alors ignorés
    const currentUploadRef = useRef<string | undefined>(undefined);
    const [fileError, setFileError] = useState<string>();
    const [uploadInProgress, setUploadInProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMax, setProgressMax] = useState(0);

    const fileErrorOf = (file: File): string | undefined => {
        if (looksLikeShapefileComponent(file.name)) return t("file.shapefile_component", { name: file.name });
        const extension = getFileExtension(file.name);
        if (!extension || !DATASET_FILE_EXTENSIONS.includes(extension)) return t("file.extension", { name: file.name });
        if (file.size > DATASET_MAX_FILE_SIZE) return t("file.size");
        return undefined;
    };

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = () => {
        setFileError(undefined);
        currentUploadRef.current = undefined;
        onFileSelected();

        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        const error = fileErrorOf(file);
        if (error) {
            setFileError(error);
            return;
        }

        const uuid = uuidv4();
        currentUploadRef.current = uuid;
        const isCurrent = () => currentUploadRef.current === uuid;
        setUploadInProgress(true);
        setProgressValue(0);
        setProgressMax(file.size);

        fileUploader
            .uploadFile(uuid, file, (value) => {
                if (isCurrent()) setProgressValue(value);
            })
            .then(() => fileUploader.uploadComplete(uuid, file))
            .then((data) => {
                if (isCurrent()) onUploadSuccess({ srid: mapIgnfToEpsg(data?.srid), uploadPath: String(data?.filename ?? "") });
            })
            .catch((err: unknown) => {
                if (isCurrent()) setFileError((err as { msg?: string } | undefined)?.msg ?? t("file.upload_failed"));
            })
            .finally(() => {
                if (isCurrent()) setUploadInProgress(false);
            });
    };

    return { fileInputRef, fileError, uploadInProgress, progressValue, progressMax, handleFileChange };
}
