import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { XMLParser } from "fast-xml-parser";
import { FC, useEffect } from "react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";

import { type ServiceFormValuesBaseType } from "../../../../@types/app";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import frequencyCodes from "../../../../data/maintenance_frequency.json";
import inspireLicense from "../../../../data/inspire_license.json";
import restrictionCodes from "../../../../data/restriction_code.json";
import { useTranslation } from "../../../../i18n/i18n";
import { getInspireKeywords, getThematicCategories, regex } from "../../../../utils";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Button from "@codegouvfr/react-dsfr/Button";

const keywords = getInspireKeywords();
const thematicCategories = getThematicCategories();

type DescriptionProps = {
    visible: boolean;
    form: UseFormReturn<ServiceFormValuesBaseType>;
    editMode?: boolean;
};

const Description: FC<DescriptionProps> = ({ visible, form, editMode }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("MetadatasForm");

    const {
        register,
        formState: { errors, dirtyFields },
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

    useEffect(() => {
        const { unsubscribe } = watch(({ public_name }, { name }) => {
            // si l'utilisateur n'a pas modifié la valeur de service_name
            if (dirtyFields.service_name === true) {
                return;
            }

            // si le champ public_name a été modifié, on synchronise avec le champ service_name
            if (public_name && name === "public_name") {
                setFormValue("service_name", public_name);
            }
        });

        return () => unsubscribe();
    }, [watch, setFormValue, dirtyFields.service_name]);

    const restrictionValue = watch("restriction");

    function useFieldArrayConstraint(control, name: string) {
        const { fields, append, remove } = useFieldArray({ control, name });

        const add = () => append({ code: "otherRestrictions", name: "", link: "" });

        return { fields, add, remove };
    }

    const inspireAccess = useFieldArrayConstraint(control, "inspire_access_constraints");
    const otherAccess = useFieldArrayConstraint(control, "other_access_constraints");
    const inspireUse = useFieldArrayConstraint(control, "inspire_use_constraints");
    const otherUse = useFieldArrayConstraint(control, "other_use_constraints");

    // console.log(form.getValues());
    // console.log(form.formState.errors);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{tCommon("mandatory_fields")}</p>
            <h3>{t("metadata.description_form.description_title")}</h3>
            <Input
                label={t("metadata.description_form.public_name")}
                hintText={t("metadata.description_form.hint_public_name")}
                state={errors.public_name ? "error" : "default"}
                stateRelatedMessage={errors?.public_name?.message?.toString()}
                nativeInputProps={{
                    ...register("public_name"),
                }}
            />
            <Input
                label={t("metadata.description_form.service_name")}
                hintText={t("metadata.description_form.hint_service_name")}
                state={errors.service_name ? "error" : "default"}
                stateRelatedMessage={errors?.service_name?.message?.toString()}
                nativeInputProps={{
                    ...register("service_name"),
                }}
            />
            <Input
                label={t("metadata.description_form.technical_name")}
                hintText={t("metadata.description_form.hint_technical_name")}
                state={errors.technical_name ? "error" : "default"}
                stateRelatedMessage={errors?.technical_name?.message?.toString()}
                nativeInputProps={{
                    ...register("technical_name"),
                }}
                disabled={editMode === true}
            />
            <Controller
                control={control}
                name="description"
                render={({ field }) => (
                    <MarkdownEditor
                        label={t("metadata.description_form.description")}
                        hintText={t("metadata.description_form.hint_description")}
                        placeholder={t("metadata.description_form.placeholder_description")}
                        state={errors.description ? "error" : "default"}
                        stateRelatedMessage={errors?.description?.message?.toString()}
                        value={field.value ?? ""}
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
                name="category" /* themes */
                render={({ field }) => (
                    <AutocompleteSelect
                        label={t("metadata.description_form.category")}
                        hintText={t("metadata.description_form.hint_category")}
                        options={thematicCategories.map((c) => c.code)}
                        getOptionLabel={(option) => thematicCategories.find((c) => c.code === option)?.text ?? option}
                        searchFilter={{ limit: 40 }}
                        state={errors.category ? "error" : "default"}
                        stateRelatedMessage={errors?.category?.message?.toString()}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                        controllerField={field}
                    />
                )}
            />
            <Controller
                control={control}
                name="keywords"
                render={({ field }) => (
                    <AutocompleteSelect
                        label={t("metadata.description_form.keywords")}
                        hintText={t("metadata.description_form.hint_keywords")}
                        options={keywords}
                        state={errors.keywords ? "error" : "default"}
                        stateRelatedMessage={errors?.keywords?.message?.toString()}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                        controllerField={field}
                    />
                )}
            />
            <Controller
                control={control}
                name="free_keywords"
                render={({ field }) => (
                    <AutocompleteSelect
                        label={t("metadata.description_form.free_keywords")}
                        hintText={t("metadata.description_form.hint_free_keywords")}
                        options={[]}
                        freeSolo={true}
                        state={errors.free_keywords ? "error" : "default"}
                        stateRelatedMessage={errors?.free_keywords?.message?.toString()}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
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

            <h3>{t("metadata.description_form.quality_title")}</h3>
            <Input
                label={t("metadata.description_form.resource_genealogy")}
                hintText={t("metadata.description_form.hint_resource_genealogy")}
                state={errors.resource_genealogy ? "error" : "default"}
                stateRelatedMessage={errors?.resource_genealogy?.message?.toString()}
                nativeTextAreaProps={{
                    ...register("resource_genealogy"),
                }}
                textArea={true}
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
                label={t("metadata.description_form.frequency_code")}
                state={errors.frequency_code ? "error" : "default"}
                stateRelatedMessage={errors?.frequency_code?.message?.toString()}
                nativeSelectProps={{
                    ...register("frequency_code"),
                }}
            >
                {Object.keys(frequencyCodes).map((k) => (
                    <option key={k} value={k}>
                        {frequencyCodes[k]}
                    </option>
                ))}
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
            <h3>{t("metadata.description_form.public_access_limits_title")}</h3>
            <Select
                label={t("metadata.description_form.restriction")}
                state={errors.restriction ? "error" : "default"}
                stateRelatedMessage={errors?.restriction?.message?.toString()}
                nativeSelectProps={{
                    ...register("restriction"),
                }}
            >
                <option value="no_restriction">{t("metadata.description_form.no_restriction")}</option>
                <option value="open_license">{t("metadata.description_form.open_license")}</option>
                <option value="inspire_directive">{t("metadata.description_form.inspire_directive")}</option>
                <option value="other_conditions">{t("metadata.description_form.other_conditions")}</option>
            </Select>
            {restrictionValue === "open_license" ? (
                <>
                    <Input
                        label={t("metadata.description_form.open_license_name")}
                        state={errors.open_license_name ? "error" : "default"}
                        stateRelatedMessage={errors?.open_license_name?.message?.toString()}
                        nativeInputProps={{
                            ...register("open_license_name"),
                        }}
                    />
                    <Input
                        label={t("metadata.description_form.open_license_link")}
                        state={errors.open_license_link ? "error" : "default"}
                        stateRelatedMessage={errors?.open_license_link?.message?.toString()}
                        nativeInputProps={{
                            ...register("open_license_link"),
                        }}
                    />
                </>
            ) : restrictionValue === "inspire_directive" ? (
                <>
                    <Controller
                        name="inspire_license"
                        control={control}
                        render={({ field }) => (
                            <RadioButtons
                                legend={t("metadata.description_form.inspire_restriction_type")}
                                options={inspireLicense.map((license) => ({
                                    hintText: license.id,
                                    label: license.text,
                                    nativeInputProps: {
                                        checked: field.value?.id === license.id,
                                        onChange: () => field.onChange(license),
                                        name: field.name,
                                    },
                                }))}
                                orientation="horizontal"
                                state={errors.inspire_license ? "error" : "default"}
                                stateRelatedMessage={errors?.inspire_license?.message?.toString()}
                            />
                        )}
                    />
                    {/* <RadioButtons
                        legend={t("metadata.description_form.inspire_restriction_type")}
                        options={inspireLicense.map((license) => ({
                            
                            label: license.text,
                            nativeInputProps: {
                                ...register("inspire_license"),
                                value: JSON.stringify({ id: license.id, link: license.link }),
                            },
                        }))}
                        orientation="horizontal"
                        state={errors.inspire_license ? "error" : "default"}
                        stateRelatedMessage={errors?.inspire_license?.message?.toString()}
                    /> */}
                    <p>{t("metadata.description_form.additional_access_constraints")}</p>
                    {inspireAccess.fields.map((_, index) => (
                        <div key={`access-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => inspireAccess.remove(index)}>
                                Supprimer
                            </Button>
                            <Select
                                label={t("metadata.description_form.access_restriction_code")}
                                nativeSelectProps={register(`inspire_access_constraints.${index}.code`)}
                            >
                                {restrictionCodes.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                label={t("metadata.description_form.access_constraint_name")}
                                nativeInputProps={register(`inspire_access_constraints.${index}.name`)}
                            />
                            <Input
                                label={t("metadata.description_form.access_constraint_link")}
                                nativeInputProps={register(`inspire_access_constraints.${index}.link`)}
                            />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={inspireAccess.add} className={fr.cx("fr-mb-6v")}>
                        {t("metadata.description_form.add_access_constraint")}
                    </Button>
                    <p>{t("metadata.description_form.additional_use_constraints")}</p>
                    {inspireUse.fields.map((_, index) => (
                        <div key={`use-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => inspireUse.remove(index)}>
                                Supprimer
                            </Button>
                            <Select
                                label={t("metadata.description_form.use_restriction_code")}
                                nativeSelectProps={register(`inspire_use_constraints.${index}.code`)}
                            >
                                {restrictionCodes.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                label={t("metadata.description_form.use_constraint_name")}
                                nativeInputProps={register(`inspire_use_constraints.${index}.name`)}
                            />
                            <Input
                                label={t("metadata.description_form.use_constraint_link")}
                                nativeInputProps={register(`inspire_use_constraints.${index}.link`)}
                            />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={inspireUse.add} className={fr.cx("fr-mb-6v")}>
                        {t("metadata.description_form.add_use_constraint")}
                    </Button>
                </>
            ) : restrictionValue === "other_conditions" ? (
                <>
                    <p>{t("metadata.description_form.additional_access_constraints")}</p>
                    {otherAccess.fields.map((_, index) => (
                        <div key={`access-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => otherAccess.remove(index)}>
                                Supprimer
                            </Button>
                            <Select
                                label={t("metadata.description_form.access_restriction_code")}
                                nativeSelectProps={register(`other_access_constraints.${index}.code`)}
                            >
                                {restrictionCodes.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                label={t("metadata.description_form.access_constraint_name")}
                                nativeInputProps={register(`other_access_constraints.${index}.name`)}
                            />
                            <Input
                                label={t("metadata.description_form.access_constraint_link")}
                                nativeInputProps={register(`other_access_constraints.${index}.link`)}
                            />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={otherAccess.add} className={fr.cx("fr-mb-6v")}>
                        {t("metadata.description_form.add_access_constraint")}
                    </Button>
                    <p>{t("metadata.description_form.additional_use_constraints")}</p>
                    {otherUse.fields.map((_, index) => (
                        <div key={`use-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => otherUse.remove(index)}>
                                Supprimer
                            </Button>
                            <Select
                                label={t("metadata.description_form.use_restriction_code")}
                                nativeSelectProps={register(`other_use_constraints.${index}.code`)}
                            >
                                {restrictionCodes.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                label={t("metadata.description_form.use_constraint_name")}
                                nativeInputProps={register(`other_use_constraints.${index}.name`)}
                            />
                            <Input
                                label={t("metadata.description_form.use_constraint_link")}
                                nativeInputProps={register(`other_use_constraints.${index}.link`)}
                            />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={otherUse.add} className={fr.cx("fr-mb-6v")}>
                        {t("metadata.description_form.add_use_constraint")}
                    </Button>
                </>
            ) : null}
        </div>
    );
};

export default Description;
