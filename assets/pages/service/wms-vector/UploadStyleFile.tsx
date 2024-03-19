import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC } from "react";
import { type UseFormReturn } from "react-hook-form";

import { Translations, declareComponentKeys, useTranslation } from "../../../i18n/i18n";
import { type StoredDataRelation } from "../../../types/app";
import { WmsVectorServiceFormValuesType } from "./WmsVectorServiceForm";

type UploadStyleFileProps = {
    visible: boolean;
    selectedTables: StoredDataRelation[];
    form: UseFormReturn<WmsVectorServiceFormValuesType>;
};
const UploadStyleFile: FC<UploadStyleFileProps> = ({ visible, selectedTables = [], form }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UploadStyleFile");

    const {
        formState: { errors },
        register,
    } = form;

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{t("title")}</h3>

            <p>{tCommon("mandatory_fields")}</p>

            {selectedTables.map((table) => (
                <Upload
                    key={table.name}
                    label={table.name}
                    className={fr.cx("fr-input-group", "fr-mb-2w")}
                    hint={t("file_input_hint")}
                    state={errors?.style_files?.[table.name]?.message ? "error" : "default"}
                    stateRelatedMessage={errors?.style_files?.[table.name]?.message}
                    nativeInputProps={{
                        ...register(`style_files.${table.name}`),
                        accept: ".sld",
                    }}
                />
            ))}
        </div>
    );
};

export default UploadStyleFile;

export const { i18n } = declareComponentKeys<"title" | "file_input_hint">()({
    UploadStyleFile,
});

export const UploadStyleFileFrTranslations: Translations<"fr">["UploadStyleFile"] = {
    title: "Déposez vos fichiers de style SLD",
    file_input_hint: "Glissez-déposez votre fichier SLD ici. Formats de fichiers autorisés : .sld",
};

export const UploadStyleFileEnTranslations: Translations<"en">["UploadStyleFile"] = {
    title: undefined,
    file_input_hint: undefined,
};
