import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

const UploadMetadataForm = ({ visibility, onPrevious, onSubmit }) => {
    return (
        <div className={fr.cx("fr-my-2v")} style={{ display: visibility ? "block" : "none"}}> 
            <h3>{Translator.trans("service.wfs.new.metadata_upload_form.title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.metadata_upload_form.import")}
                hintText={Translator.trans("service.wfs.new.metadata_upload_form.hint_import")}
                nativeInputProps={{type: "file"/*, onChange: handleFileChanged*/ }}
            />
            <ButtonsGroup
                className={fr.cx("fr-my-2v")}
                alignment="between"
                buttons={[
                    {
                        children: Translator.trans("previous_step"),
                        iconId: "fr-icon-arrow-left-fill",
                        onClick: onPrevious
                    },
                    {
                        children: Translator.trans("continue"),
                        onClick: onSubmit
                    }
                ]}
                inlineLayoutWhen="always"
            />  
        </div>
    );
};

UploadMetadataForm.propTypes = {
    visibility: PropTypes.bool.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default UploadMetadataForm;


