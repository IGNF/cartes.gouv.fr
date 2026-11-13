import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { ChangeEventHandler, RefObject } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "react-hook-form";

import Progress from "@/components/Utils/Progress";
import { useTranslation } from "@/i18n";
import { DATASET_FILE_EXTENSIONS } from "@/utils";
import { DATASET_DESCRIPTION_MAX_LENGTH, DATASET_NAME_MAX_LENGTH, type DatasetAddFormValues } from "../datasetAddSchema";

const formatsHelpModal = createModal({ id: "dataset-add-formats-help-modal", isOpenedByDefault: false });

type DatasetSectionProps = {
    fileInputRef: RefObject<HTMLInputElement | null>;
    fileError?: string;
    uploadInProgress: boolean;
    progressValue: number;
    progressMax: number;
    onFileChange: ChangeEventHandler<HTMLInputElement>;
};

export default function DatasetSection({ fileInputRef, fileError, uploadInProgress, progressValue, progressMax, onFileChange }: DatasetSectionProps) {
    const { t } = useTranslation("DatasetAdd");
    const {
        register,
        formState: { errors },
    } = useFormContext<DatasetAddFormValues>();

    // le fichier est validé par data_upload_path, renseigné après un téléversement réussi
    const fileMessage = fileError ?? errors.data_upload_path?.message;

    return (
        <div>
            <Upload
                label={t("file.label")}
                hint={t("file.hint")}
                state={fileMessage ? "error" : "default"}
                stateRelatedMessage={fileMessage}
                nativeInputProps={{ ref: fileInputRef, onChange: onFileChange, accept: DATASET_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",") }}
                className={fr.cx("fr-input-group", "fr-mb-2v")}
            />
            <Button
                type="button"
                priority="tertiary no outline"
                size="small"
                iconId="fr-icon-eye-line"
                className={fr.cx("fr-mb-4v")}
                onClick={() => formatsHelpModal.open()}
            >
                {t("file.formats_help")}
            </Button>
            {uploadInProgress && <Progress label={t("file.uploading")} value={progressValue} max={progressMax} />}

            <Input
                label={t("name.label")}
                state={errors.name ? "error" : "default"}
                stateRelatedMessage={errors.name?.message}
                nativeInputProps={{ ...register("name"), maxLength: DATASET_NAME_MAX_LENGTH }}
            />
            <Input
                label={t("description.label")}
                textArea
                state={errors.description ? "error" : "default"}
                stateRelatedMessage={errors.description?.message}
                nativeTextAreaProps={{ ...register("description"), maxLength: DATASET_DESCRIPTION_MAX_LENGTH, rows: 4 }}
            />

            {createPortal(
                <formatsHelpModal.Component title={t("formats_modal.title")}>
                    <p>{t("formats_modal.limits")}</p>
                    <p className={fr.cx("fr-mb-1v")}>{t("formats_modal.formats")}</p>
                    <ul>
                        <li>{t("formats_modal.gpkg")}</li>
                        <li>{t("formats_modal.shp")}</li>
                        <li>{t("formats_modal.geojson")}</li>
                        <li>
                            {t("formats_modal.csv")}
                            <br />
                            {t("formats_modal.csv_columns")}
                        </li>
                        <li>
                            {t("formats_modal.sql")}
                            <br />
                            {t("formats_modal.sql_rules")}
                        </li>
                    </ul>
                </formatsHelpModal.Component>,
                document.body
            )}
        </div>
    );
}
