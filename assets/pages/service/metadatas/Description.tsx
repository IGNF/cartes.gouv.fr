import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { format as datefnsFormat } from "date-fns";
import { XMLParser } from "fast-xml-parser";
import { FC, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import AutocompleteSelect from "../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../components/Input/MarkdownEditor";
import Translator from "../../../modules/Translator";
import { Pyramid, VectorDb } from "../../../types/app";
import { getInspireKeywords, removeDiacritics } from "../../../utils";
import Select from "@codegouvfr/react-dsfr/Select";
import { regex } from "../../../utils";
import { EndpointTypes } from "../../../types/app";

type DescriptionProps = {
    storedData: VectorDb | Pyramid;
    endpointType: EndpointTypes;
    visible: boolean;
    form: UseFormReturn;
};

const getSuffix = (endpointType) => {
    switch (endpointType) {
        case "WFS":
            return "wfs";
        case "WMS-VECTOR":
            return "wmsv";
        case "WMTS-TMS":
            return "tms";
        default:
            return "other"; // TODO
    }
};

const Description: FC<DescriptionProps> = ({ storedData, endpointType, visible, form }) => {
    const keywords = getInspireKeywords();
    const now = datefnsFormat(new Date(), "yyyy-MM-dd");

    const suffix = getSuffix(endpointType);

    const {
        register,
        formState: { errors },
        setValue: setFormValue,
        watch,
        control,
    } = form;

    const metadata: File = watch("metadata_file_content")?.[0];

    useEffect(() => {
        const storedDataName = storedData?.name ?? "";
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

        setFormValue("technical_name", `${nice}_${suffix}`);
        setFormValue("public_name", storedDataName);
    }, [setFormValue, storedData, suffix]);

    useEffect(() => {
        (async () => {
            if (!metadata) return;

            const xmlText = await metadata.text();

            const xmlParser = new XMLParser();
            const parsed = xmlParser.parse(xmlText);
            const fileIdentifier = parsed["gmd:MD_Metadata"]?.["gmd:fileIdentifier"]?.["gco:CharacterString"] ?? "";
            const hierarchyLevel = parsed["gmd:MD_Metadata"]["gmd:hierarchyLevel"]["gmd:MD_ScopeCode"] ?? "";

            // TODO Utiliser la nouvelle route https://github.com/Geoplateforme/geoplateforme.github.io/issues/1

            if (regex.name_constraint.test(fileIdentifier)) {
                setFormValue("resource_genealogy", hierarchyLevel);
            }
            if (["dataset", "series"].includes(hierarchyLevel)) {
                setFormValue("resource_genealogy", hierarchyLevel);
            }
        })();
    }, [setFormValue, metadata]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{Translator.trans("mandatory_fields")}</p>

            <h3>{Translator.trans("service.tms.new.step_description.description_title")}</h3>
            <Input
                label={Translator.trans("service.tms.new.step_description.technical_name")}
                hintText={Translator.trans("service.tms.new.step_description.hint_technical_name")}
                state={errors.technical_name ? "error" : "default"}
                stateRelatedMessage={errors?.technical_name?.message?.toString()}
                nativeInputProps={{
                    ...register("technical_name"),
                }}
            />
            <Input
                label={Translator.trans("service.tms.new.step_description.public_name")}
                hintText={Translator.trans("service.tms.new.step_description.hint_public_name")}
                state={errors.public_name ? "error" : "default"}
                stateRelatedMessage={errors?.public_name?.message?.toString()}
                nativeInputProps={{
                    ...register("public_name"),
                }}
            />
            <MarkdownEditor
                label={Translator.trans("service.tms.new.step_description.description")}
                hintText={Translator.trans("service.tms.new.step_description.hint_description")}
                state={errors.description ? "error" : "default"}
                stateRelatedMessage={errors?.description?.message?.toString()}
                onChange={(values) => {
                    setFormValue("description", values, { shouldValidate: true });
                }}
            />
            <Input
                label={Translator.trans("service.tms.new.step_description.identifier")}
                hintText={Translator.trans("service.tms.new.step_description.hint_identifier")}
                state={errors.identifier ? "error" : "default"}
                stateRelatedMessage={errors?.identifier?.message?.toString()}
                nativeInputProps={{
                    ...register("identifier"),
                }}
            />
            <Controller
                control={control}
                name="category"
                defaultValue={[]}
                render={({ field }) => {
                    return (
                        <AutocompleteSelect
                            label={Translator.trans("service.tms.new.step_description.category")}
                            hintText={Translator.trans("service.tms.new.step_description.hint_category")}
                            options={keywords}
                            freeSolo={true}
                            getOptionLabel={(option) => option}
                            isOptionEqualToValue={(option, value) => option === value}
                            state={errors.category ? "error" : "default"}
                            stateRelatedMessage={errors?.category?.message?.toString()}
                            onChange={(_, value) => field.onChange(value)}
                            // @ts-expect-error fausse alerte
                            controllerField={field}
                        />
                    );
                }}
            />

            <Input
                label={Translator.trans("service.tms.new.step_description.email_contact")}
                hintText={Translator.trans("service.tms.new.step_description.hint_email_contact")}
                state={errors.email_contact ? "error" : "default"}
                stateRelatedMessage={errors?.email_contact?.message?.toString()}
                nativeInputProps={{
                    ...register("email_contact"),
                }}
            />

            <h3>{Translator.trans("service.tms.new.step_description.time_reference_title")}</h3>
            <Input
                label={Translator.trans("service.tms.new.step_description.creation_date")}
                state={errors.creation_date ? "error" : "default"}
                stateRelatedMessage={errors?.creation_date?.message?.toString()}
                nativeInputProps={{
                    ...register("creation_date"),
                    type: "date",
                    defaultValue: now,
                }}
            />
            <Select
                label={Translator.trans("service.tms.new.step_description.resource_genealogy")}
                hint={Translator.trans("service.tms.new.step_description.hint_resource_genealogy")}
                state={errors.resource_genealogy ? "error" : "default"}
                stateRelatedMessage={errors?.resource_genealogy?.message?.toString()}
                nativeSelectProps={{
                    ...register("resource_genealogy"),
                    defaultValue: "",
                }}
            >
                <option value="">Aucune</option>
                <option value="dataset">Lot</option>
                <option value="series">Produit</option>
            </Select>
            <h3>{Translator.trans("service.tms.new.step_description.resource_manager_title")}</h3>
            <Input
                label={Translator.trans("service.tms.new.step_description.organization")}
                hintText={Translator.trans("service.tms.new.step_description.hint_organization")}
                state={errors.organization ? "error" : "default"}
                stateRelatedMessage={errors?.organization?.message?.toString()}
                nativeInputProps={{
                    ...register("organization"),
                }}
            />
            <Input
                label={Translator.trans("service.tms.new.step_description.organization_email")}
                hintText={Translator.trans("service.tms.new.step_description.hint_organization_email")}
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
