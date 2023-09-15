import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { format as datefnsFormat } from "date-fns";
import { XMLParser } from "fast-xml-parser";
import { FC, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import Translator from "../../../../modules/Translator";
import { VectorDb } from "../../../../types/app";
import { getInspireKeywords, removeDiacritics } from "../../../../utils";

type DescriptionProps = {
    vectorDb: VectorDb;
    visible: boolean;
    form: UseFormReturn;
};
const Description: FC<DescriptionProps> = ({ vectorDb, visible, form }) => {
    const keywords = getInspireKeywords();
    const now = datefnsFormat(new Date(), "yyyy-MM-dd");

    const {
        register,
        formState: { errors },
        setValue: setFormValue,
        watch,
    } = form;

    const metadata: File = watch("metadata_file_content")?.[0];

    useEffect(() => {
        const storedDataName = vectorDb?.name ?? "";
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

        setFormValue("technical_name", nice);
        setFormValue("public_name", storedDataName);
    }, [setFormValue, vectorDb]);

    useEffect(() => {
        (async () => {
            if (!metadata) return;

            const xmlText = await metadata.text();

            const xmlParser = new XMLParser();
            const parsed = xmlParser.parse(xmlText);
            const fileIdentifier = parsed["gmd:MD_Metadata"]?.["gmd:fileIdentifier"]?.["gco:CharacterString"] ?? "";
            const hierarchyLevel = parsed["gmd:MD_Metadata"]["gmd:hierarchyLevel"]["gmd:MD_ScopeCode"] ?? "";

            setFormValue("identifier", fileIdentifier);
            setFormValue("resource_genealogy", hierarchyLevel);
        })();
    }, [setFormValue, metadata]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{Translator.trans("mandatory_fields")}</p>

            <h3>{Translator.trans("service.wms_vector.new.step_description.description_title")}</h3>
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.technical_name")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_technical_name")}
                state={errors.technical_name ? "error" : "default"}
                stateRelatedMessage={errors?.technical_name?.message?.toString()}
                nativeInputProps={{
                    ...register("technical_name"),
                }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.public_name")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_public_name")}
                state={errors.public_name ? "error" : "default"}
                stateRelatedMessage={errors?.public_name?.message?.toString()}
                nativeInputProps={{
                    ...register("public_name"),
                }}
            />
            <MarkdownEditor
                label={Translator.trans("service.wms_vector.new.step_description.description")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_description")}
                state={errors.description ? "error" : "default"}
                stateRelatedMessage={errors?.description?.message?.toString()}
                onChange={(values) => {
                    setFormValue("description", values, { shouldValidate: true });
                }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.identifier")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_identifier")}
                state={errors.identifier ? "error" : "default"}
                stateRelatedMessage={errors?.identifier?.message?.toString()}
                nativeInputProps={{
                    ...register("identifier"),
                    defaultValue: uuidv4(),
                }}
            />
            <AutocompleteSelect
                label={Translator.trans("service.wms_vector.new.step_description.category")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_category")}
                state={errors.category ? "error" : "default"}
                stateRelatedMessage={errors?.category?.message?.toString()}
                freeSolo
                options={keywords}
                onChange={(values) => {
                    setFormValue("category", values, { shouldValidate: true });
                }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.email_contact")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_email_contact")}
                state={errors.email_contact ? "error" : "default"}
                stateRelatedMessage={errors?.email_contact?.message?.toString()}
                nativeInputProps={{
                    ...register("email_contact"),
                }}
            />

            <h3>{Translator.trans("service.wms_vector.new.step_description.time_reference_title")}</h3>
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.creation_date")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_creation_date")}
                state={errors.creation_date ? "error" : "default"}
                stateRelatedMessage={errors?.creation_date?.message?.toString()}
                nativeInputProps={{
                    ...register("creation_date"),
                    type: "date",
                    value: now,
                }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.resource_genealogy")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_resource_genealogy")}
                state={errors.resource_genealogy ? "error" : "default"}
                stateRelatedMessage={errors?.resource_genealogy?.message?.toString()}
                nativeInputProps={{
                    ...register("resource_genealogy"),
                }}
            />

            <h3>{Translator.trans("service.wms_vector.new.step_description.resource_manager_title")}</h3>
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.organization")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_organization")}
                state={errors.organization ? "error" : "default"}
                stateRelatedMessage={errors?.organization?.message?.toString()}
                nativeInputProps={{
                    ...register("organization"),
                }}
            />
            <Input
                label={Translator.trans("service.wms_vector.new.step_description.organization_email")}
                hintText={Translator.trans("service.wms_vector.new.step_description.hint_organization_email")}
                state={errors.organization_email ? "error" : "default"}
                stateRelatedMessage={errors?.organization_email?.message?.toString()}
                nativeInputProps={{
                    ...register("organization_email"),
                }}
            />
        </div>
    );
};

export default Description;
