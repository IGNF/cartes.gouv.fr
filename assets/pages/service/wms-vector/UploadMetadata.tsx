import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

import Translator from "../../../modules/Translator";

type UploadMetadataProps = {
    visible: boolean;
    form: UseFormReturn;
};

const UploadMetadata: FC<UploadMetadataProps> = ({ visible, form }) => {
    const {
        formState: { errors },
        register,
        watch,
    } = form;

    const isUploadFile = watch("is_upload_file", "false");

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wms_vector.new.step_metadata.title")}</h3>

            <p>
                <strong>{Translator.trans("service.wms_vector.new.step_metadata.help")}</strong>
            </p>

            <p>{Translator.trans("mandatory_fields")}</p>

            <RadioButtons
                legend={Translator.trans("service.wms_vector.new.step_metadata.legend")}
                hintText={Translator.trans("service.wms_vector.new.step_metadata.legend_hint")}
                options={[
                    {
                        label: Translator.trans("service.wms_vector.new.step_metadata.option_fill_form"),
                        hintText: Translator.trans("service.wms_vector.new.step_metadata.option_fill_form_hint"),
                        nativeInputProps: {
                            ...register("is_upload_file"),
                            value: "false",
                            checked: isUploadFile === "false",
                        },
                    },
                    {
                        label: Translator.trans("service.wms_vector.new.step_metadata.option_import_file"),
                        hintText: Translator.trans("service.wms_vector.new.step_metadata.option_import_file_hint"),
                        nativeInputProps: {
                            ...register("is_upload_file"),
                            value: "true",
                            checked: isUploadFile === "true",
                        },
                    },
                ]}
                state={errors?.is_upload_file?.message ? "error" : "default"}
                stateRelatedMessage={errors?.is_upload_file?.message?.toString()}
            />

            {isUploadFile === "true" && (
                <Upload
                    label="Glissez-déposez votre fichier de métadonnées ici"
                    className={fr.cx("fr-mb-2w")}
                    hint="Formats de fichiers autorisés : .xml"
                    nativeInputProps={{
                        ...register("metadata_file_content", { deps: ["is_upload_file"] }),
                    }}
                    state={errors?.metadata_file_content?.message ? "error" : "default"}
                    stateRelatedMessage={errors?.metadata_file_content?.message?.toString()}
                />
            )}
        </div>
    );
};

export default UploadMetadata;
