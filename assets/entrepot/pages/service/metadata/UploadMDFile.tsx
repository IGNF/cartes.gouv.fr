import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

import { useTranslation } from "../../../../i18n/i18n";
import { ServiceFormValuesBaseType } from "../../../../@types/app";

type UploadMDFileProps = {
    visible: boolean;
    form: UseFormReturn<ServiceFormValuesBaseType>;
};

const UploadMDFile: FC<UploadMDFileProps> = ({ visible, form }) => {
    const { t } = useTranslation("MetadatasForm");
    // const { t: tCommon } = useTranslation("Common");

    const {
        formState: { errors },
        register,
    } = form;

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{t("metadata.upload_form.title")}</h3>
            {/* // cf. https://github.com/IGNF/cartes.gouv.fr/issues/519 */}
            {/* <p>{tCommon("mandatory_fields")}</p> */}
            <Alert description="Fonctionnalité en cours de construction" className={fr.cx("fr-mb-2v")} closable={false} severity="info" small />
            <Upload
                label={t("metadata.upload_form.drag_and_drop_file")}
                className={fr.cx("fr-input-group", "fr-mb-2w")}
                hint={t("metadata.upload_form.used_format")}
                nativeInputProps={{
                    ...register("metadata_file_content"),
                    accept: ".xml",
                }}
                state={errors?.metadata_file_content?.message ? "error" : "default"}
                stateRelatedMessage={errors?.metadata_file_content?.message?.toString()}
                disabled={true} // cf. https://github.com/IGNF/cartes.gouv.fr/issues/519
            />
        </div>
    );
};

export default UploadMDFile;
