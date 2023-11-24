import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

import Translator from "../../../modules/Translator";

type UploadMDFileProps = {
    visible: boolean;
    form: UseFormReturn;
};

const UploadMDFile: FC<UploadMDFileProps> = ({ visible, form }) => {
    const {
        formState: { errors },
        register,
    } = form;

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wfs.new.metadata_upload_form.title")}</h3>
            <p>{Translator.trans("mandatory_fields")}</p>
            <Upload
                label={Translator.trans("metadatas.drag_and_drop_file")}
                className={fr.cx("fr-input-group", "fr-mb-2w")}
                hint={Translator.trans("metadatas.used_format")}
                nativeInputProps={{
                    ...register("metadata_file_content"),
                    accept: ".xml",
                }}
                state={errors?.metadata_file_content?.message ? "error" : "default"}
                stateRelatedMessage={errors?.metadata_file_content?.message?.toString()}
            />
        </div>
    );
};

export default UploadMDFile;
