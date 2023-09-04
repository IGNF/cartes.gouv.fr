import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

import Translator from "../../../../modules/Translator";
import { VectorDb } from "../../../../types/app";
import Input from "@codegouvfr/react-dsfr/Input";
import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import KeywordsSelect from "../../../../components/Utils/KeywordsSelect";
import { getInspireKeywords } from "../../../../utils";

type DescriptionProps = {
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn;
};
const Description: FC<DescriptionProps> = ({ vectorDb, visible, form }) => {
    const keywords = getInspireKeywords();

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{Translator.trans("mandatory_fields")}</p>

            <h3>{Translator.trans("service.wms_vector.new.step_description.description_title")}</h3>
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.technical_name")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_technical_name")}
                // state={errors.data_technical_name ? "error" : "default"}
                // stateRelatedMessage={errors?.data_technical_name?.message}
                // nativeInputProps={{
                //     ...register("data_technical_name"),
                // }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.public_name")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_public_name")}
                // state={errors.data_public_name ? "error" : "default"}
                // stateRelatedMessage={errors?.data_public_name?.message}
                // nativeInputProps={{
                //     ...register("data_public_name"),
                // }}
            />
            <MarkdownEditor
                label={Translator.trans("service.wms_vector.new.step_description.description")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_description")}
                // state=""
                // stateRelatedMessage=""
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.identifier")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_identifier")}
                // state={errors.data_identifier ? "error" : "default"}
                // stateRelatedMessage={errors?.data_identifier?.message}
                // nativeInputProps={{
                //     ...register("data_identifier"),
                //     readOnly: true,
                //     defaultValue: uuidv4(),
                // }}
            />
            <KeywordsSelect
                label={Translator.trans("service.wms_vector.new.step_description.category")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_category")}
                // state={errors.data_category ? "error" : "default"}
                // stateRelatedMessage={errors?.data_category?.message}
                freeSolo
                keywords={keywords}
                onChange={(values) => {
                    console.log(values);
                }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.email_contact")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_email_contact")}
                // state={errors.data_email_contact ? "error" : "default"}
                // stateRelatedMessage={errors?.data_email_contact?.message}
                // nativeInputProps={{
                //     ...register("data_email_contact"),
                // }}
            />

            <h3>{Translator.trans("service.wms_vector.new.step_description.time_reference_title")}</h3>
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.creation_date")}
                // hintText={Translator.trans("service.wms_vector.new.step_description.hint_creation_date")}
                // state={errors.data_creation_date ? "error" : "default"}
                // stateRelatedMessage={errors?.data_creation_date?.message}
                // nativeInputProps={{
                //     ...register("data_creation_date"),
                //     type: "date",
                //     value: now,
                // }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.resource_genealogy")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_resource_genealogy")}
                // state={errors.data_resource_genealogy ? "error" : "default"}
                // stateRelatedMessage={errors?.data_resource_genealogy?.message}
                textArea={true}
                // nativeTextAreaProps={{
                //     ...register("data_resource_genealogy"),
                // }}
            />

            <h3>{Translator.trans("service.wms_vector.new.step_description.resource_manager_title")}</h3>
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.organization")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_organization")}
                // state={errors.data_organization ? "error" : "default"}
                // stateRelatedMessage={errors?.data_organization?.message}
                // nativeInputProps={{
                //     ...register("data_organization"),
                // }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.organization_email")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_organization_email")}
                // state={errors.data_organization_email ? "error" : "default"}
                // stateRelatedMessage={errors?.data_organization_email?.message}
                // nativeInputProps={{
                //     ...register("data_organization_email"),
                // }}
            />
        </div>
    );
};

export default Description;
