import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC } from "react";
import { type UseFormReturn } from "react-hook-form";

import { type StoredDataRelation } from "../../../../@types/app";
import { useTranslation } from "../../../../i18n/i18n";
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
