import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { FC, FormEvent } from "react";
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
        setValue: setFormValue,
        formState: { errors },
    } = form;

    const handleFileChange = async (tableName: string, e: FormEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];

        setFormValue(`style_files.${tableName}`, file, { shouldValidate: true });
    };

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>Déposez vos fichiers de style SLD</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            {selectedTables.map((table) => (
                <Input
                    key={table.name}
                    label={table.name}
                    hintText="Glissez-déposez votre fichier SLD ici. Formats de fichiers autorisés : .sld"
                    nativeInputProps={{
                        type: "file",
                        onChange: (e: FormEvent<HTMLInputElement>) => handleFileChange(table.name, e),
                    }}
                    className={fr.cx("fr-mb-2w")}
                    state={errors?.style_files?.[table.name]?.message ? "error" : "default"}
                    stateRelatedMessage={errors?.style_files?.[table.name]?.message?.toString()}
                />
            ))}
        </div>
    );
};

export default UploadStyleFile;
