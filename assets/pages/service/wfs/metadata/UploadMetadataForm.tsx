import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

import Translator from "../../../../modules/Translator";

type UploadMetadataFormProps = {
    visible: boolean;
    onPrevious: () => void;
    onSubmit: () => void;
};

const UploadMetadataForm: FC<UploadMetadataFormProps> = ({ visible, onPrevious, onSubmit }) => {
    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wfs.new.metadata_upload_form.title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            <Input
                label={Translator.trans("service.wfs.new.metadata_upload_form.import")}
                hintText={Translator.trans("service.wfs.new.metadata_upload_form.hint_import")}
                nativeInputProps={{ type: "file" /*, onChange: handleFileChanged*/ }}
            />
            <ButtonsGroup
                className={fr.cx("fr-my-2v")}
                alignment="between"
                buttons={[
                    {
                        children: Translator.trans("previous_step"),
                        iconId: "fr-icon-arrow-left-fill",
                        onClick: onPrevious,
                    },
                    {
                        children: Translator.trans("continue"),
                        onClick: onSubmit,
                    },
                ]}
                inlineLayoutWhen="always"
            />
        </div>
    );
};

export default UploadMetadataForm;
