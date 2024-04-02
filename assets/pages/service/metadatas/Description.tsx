import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { XMLParser } from "fast-xml-parser";
import { FC, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import AutocompleteSelect from "../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../components/Input/MarkdownEditor";
import { getTranslation } from "../../../i18n/i18n";
import { EndpointTypeEnum, ServiceFormValuesBaseType } from "../../../types/app";
import { getInspireKeywords, regex } from "../../../utils";

type DescriptionProps = {
    visible: boolean;
    form: UseFormReturn<ServiceFormValuesBaseType>;
};

export const getEndpointSuffix = (endpointType: EndpointTypeEnum) => {
    switch (endpointType) {
        case EndpointTypeEnum.WFS:
            return "wfs";
        case EndpointTypeEnum.WMSVECTOR:
            return "wmsv";
        case EndpointTypeEnum.WMTSTMS:
            return "tms";
        default:
            return "other"; // TODO
    }
};

const keywords = getInspireKeywords();

const Description: FC<DescriptionProps> = ({ visible, form }) => {
    const { t: tCommon } = getTranslation("Common");
    const { t } = getTranslation("MetadatasForm");

    const {
        register,
        formState: { errors },
        setValue: setFormValue,
        watch,
        control,
    } = form;

    const metadata: File | undefined = watch("metadata_file_content")?.[0];

    useEffect(() => {
        (async () => {
            if (!metadata) return;

            const xmlText = await metadata.text();

            const xmlParser = new XMLParser();
            const parsed = xmlParser.parse(xmlText);
            const fileIdentifier = parsed["gmd:MD_Metadata"]?.["gmd:fileIdentifier"]?.["gco:CharacterString"] ?? "";
            const hierarchyLevel = parsed["gmd:MD_Metadata"]["gmd:hierarchyLevel"]["gmd:MD_ScopeCode"] ?? "";

            // TODO Utiliser la nouvelle route https://github.com/Geoplateforme/geoplateforme.github.io/issues/1

            if (regex.file_identifier.test(fileIdentifier)) {
                setFormValue("identifier", fileIdentifier);
            }
            if (["dataset", "series"].includes(hierarchyLevel)) {
                setFormValue("resource_genealogy", hierarchyLevel);
            }
        })();
    }, [setFormValue, metadata]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{tCommon("mandatory_fields")}</p>
            <h3>{t("metadata.description_form.description_title")}</h3>
            <Input
                label={t("metadata.description_form.technical_name")}
                hintText={t("metadata.description_form.hint_technical_name")}
                state={errors.technical_name ? "error" : "default"}
                stateRelatedMessage={errors?.technical_name?.message?.toString()}
                nativeInputProps={{
                    ...register("technical_name"),
                }}
            />
            <Input
                label={t("metadata.description_form.public_name")}
                hintText={t("metadata.description_form.hint_public_name")}
                state={errors.public_name ? "error" : "default"}
                stateRelatedMessage={errors?.public_name?.message?.toString()}
                nativeInputProps={{
                    ...register("public_name"),
                }}
            />
            <Controller
                control={control}
                name="description"
                render={({ field }) => (
                    <MarkdownEditor
                        label={t("metadata.description_form.description")}
                        hintText={t("metadata.description_form.hint_description")}
                        state={errors.description ? "error" : "default"}
                        stateRelatedMessage={errors?.description?.message?.toString()}
                        defaultValue={field.value}
                        onChange={(values) => {
                            field.onChange(values);
                        }}
                    />
                )}
            />

            <Input
                label={t("metadata.description_form.identifier")}
                hintText={t("metadata.description_form.hint_identifier")}
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
                render={({ field }) => (
                    <AutocompleteSelect
                        label={t("metadata.description_form.category")}
                        hintText={t("metadata.description_form.hint_category")}
                        options={keywords}
                        freeSolo={true}
                        getOptionLabel={(option) => option}
                        isOptionEqualToValue={(option, value) => option === value}
                        state={errors.category ? "error" : "default"}
                        stateRelatedMessage={errors?.category?.message?.toString()}
                        defaultValue={field.value}
                        onChange={(_, value) => field.onChange(value)}
                        // @ts-expect-error fausse alerte
                        controllerField={field}
                    />
                )}
            />

            <Input
                label={t("metadata.description_form.contact_email")}
                hintText={t("metadata.description_form.hint_contact_email")}
                state={errors.email_contact ? "error" : "default"}
                stateRelatedMessage={errors?.email_contact?.message?.toString()}
                nativeInputProps={{
                    ...register("email_contact"),
                }}
            />

            <h3>{t("metadata.description_form.time_reference_title")}</h3>
            <Input
                label={t("metadata.description_form.creation_date")}
                state={errors.creation_date ? "error" : "default"}
                stateRelatedMessage={errors?.creation_date?.message?.toString()}
                nativeInputProps={{
                    ...register("creation_date"),
                    type: "date",
                }}
            />
            <Select
                label={t("metadata.description_form.resource_genealogy")}
                hint={t("metadata.description_form.hint_resource_genealogy")}
                state={errors.resource_genealogy ? "error" : "default"}
                stateRelatedMessage={errors?.resource_genealogy?.message?.toString()}
                nativeSelectProps={{
                    ...register("resource_genealogy"),
                }}
            >
                <option value="">{tCommon("none")}</option>
                <option value="dataset">Lot</option>
                <option value="series">Produit</option>
            </Select>
            <h3>{t("metadata.description_form.resource_manager_title")}</h3>
            <Input
                label={t("metadata.description_form.organization")}
                hintText={t("metadata.description_form.hint_organization")}
                state={errors.organization ? "error" : "default"}
                stateRelatedMessage={errors?.organization?.message?.toString()}
                nativeInputProps={{
                    ...register("organization"),
                }}
            />
            <Input
                label={t("metadata.description_form.organization_email")}
                hintText={t("metadata.description_form.hint_organization_email")}
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
