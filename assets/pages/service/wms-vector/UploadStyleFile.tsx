import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC } from "react";
import { type UseFormReturn } from "react-hook-form";

import Translator from "../../../modules/Translator";
import { type StoredDataRelation } from "../../../types/app";

type UploadStyleFileProps = {
    visible: boolean;
    selectedTables: StoredDataRelation[];
    form: UseFormReturn;
};
const UploadStyleFile: FC<UploadStyleFileProps> = ({ visible, selectedTables, form }) => {
    const {
        formState: { errors },
        register,
    } = form;

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wms_vector.new.step_style_file.title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            {selectedTables.map((table) => (
                <Upload
                    key={table.name}
                    label={table.name}
                    className={fr.cx("fr-mb-2w")}
                    hint="Glissez-déposez votre fichier SLD ici. Formats de fichiers autorisés : .sld"
                    state={errors?.style_files?.[table.name]?.message ? "error" : "default"}
                    stateRelatedMessage={errors?.style_files?.[table.name]?.message}
                    nativeInputProps={{
                        ...register(`style_files.${table.name}`),
                    }}
                />
            ))}
        </div>
    );
};

export default UploadStyleFile;
