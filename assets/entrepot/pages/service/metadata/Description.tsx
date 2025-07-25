import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { XMLParser } from "fast-xml-parser";
import { FC, useEffect, useState } from "react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";

import { type ServiceFormValuesBaseType } from "../../../../@types/app";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../../components/Input/MarkdownEditor";
import frequencyCodes from "../../../../data/maintenance_frequency.json";
import inspireLicense from "../../../../data/inspire_license.json";
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

    const [selectedInspire, setSelectedInspire] = useState<string | undefined>();

    const {
        fields: accessConstraints,
        append: appendAccessConstraint,
        remove: removeAccessConstraint,
    } = useFieldArray({
        control,
        name: "accessConstraints",
    });

    const {
        fields: useConstraints,
        append: appendUseConstraint,
        remove: removeUseConstraint,
    } = useFieldArray({
        control,
        name: "useConstraints",
    });

    const addAccessConstraint = () => {
        appendAccessConstraint({ code: "", name: "", link: "" });
    };

    const addUseConstraint = () => {
        appendUseConstraint({ code: "", name: "", link: "" });
    };

    const inspireOptions = Object.entries(inspireLicense).map(([id, text]) => ({
        id,
        text,
    }));

    console.log(form.getValues());
    console.log(form.formState.errors);

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
                    <p>{t("metadata.description_form.inspire_restriction_type")}</p>
                    <RadioButtons
                        options={inspireOptions.map((lic) => ({
                            label: lic.text,
                            nativeInputProps: {
                                name: "inspire_reason",
                                value: lic.id,
                                checked: selectedInspire === lic.id,
                                onChange: () => setSelectedInspire(lic.id),
                            },
                        }))}
                    />
                    <p>{t("metadata.description_form.additional_access_constraints")}</p>
                    {accessConstraints.map((_, index) => (
                        <div key={`access-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => removeAccessConstraint(index)}>
                                Supprimer
                            </Button>
                            <Select
                                label={t("metadata.description_form.access_restriction_code")}
                                nativeSelectProps={register(`accessConstraints.${index}.code`)}
                            >
                                <option value="otherRestrictions">otherRestrictions</option>
                                <option value="copyright">copyright</option>
                                <option value="patent">patent</option>
                                <option value="patentPending">patentPending</option>
                                <option value="trademark">trademark</option>
                                <option value="license">license</option>
                                <option value="intellectualPropertyRights">intellectualPropertyRights</option>
                                <option value="restricted">restricted</option>
                            </Select>
                            <Input
                                label={t("metadata.description_form.access_constraint_name")}
                                nativeInputProps={register(`accessConstraints.${index}.name`)}
                            />
                            <Input
                                label={t("metadata.description_form.access_constraint_link")}
                                nativeInputProps={register(`accessConstraints.${index}.link`)}
                            />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={addAccessConstraint} className={fr.cx("fr-mb-6v")}>
                        {t("metadata.description_form.add_access_constraint")}
                    </Button>
                    <p>{t("metadata.description_form.additional_use_constraints")}</p>
                    {useConstraints.map((_, index) => (
                        <div key={`use-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => removeUseConstraint(index)}>
                                Supprimer
                            </Button>
                            <Select label={t("metadata.description_form.use_restriction_code")} nativeSelectProps={register(`useConstraints.${index}.code`)}>
                                <option value="otherRestrictions">otherRestrictions</option>
                                <option value="copyright">copyright</option>
                                <option value="patent">patent</option>
                                <option value="patentPending">patentPending</option>
                                <option value="trademark">trademark</option>
                                <option value="license">license</option>
                                <option value="intellectualPropertyRights">intellectualPropertyRights</option>
                                <option value="restricted">restricted</option>
                            </Select>
                            <Input label={t("metadata.description_form.use_constraint_name")} nativeInputProps={register(`useConstraints.${index}.name`)} />
                            <Input label={t("metadata.description_form.use_constraint_link")} nativeInputProps={register(`useConstraints.${index}.link`)} />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={addUseConstraint} className={fr.cx("fr-mb-6v")}>
                        {t("metadata.description_form.add_use_constraint")}
                    </Button>
                </>
            ) : restrictionValue === "other_conditions" ? (
                <>
                    {accessConstraints.map((_, index) => (
                        <div key={`access-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => removeAccessConstraint(index)}>
                                Supprimer
                            </Button>
                            <Select
                                label={t("metadata.description_form.access_restriction_code")}
                                nativeSelectProps={register(`accessConstraints.${index}.code`)}
                            >
                                <option value="otherRestrictions">otherRestrictions</option>
                                <option value="copyright">copyright</option>
                                <option value="patent">patent</option>
                                <option value="patentPending">patentPending</option>
                                <option value="trademark">trademark</option>
                                <option value="license">license</option>
                                <option value="intellectualPropertyRights">intellectualPropertyRights</option>
                                <option value="restricted">restricted</option>
                            </Select>
                            <Input
                                label={t("metadata.description_form.access_constraint_name")}
                                nativeInputProps={register(`accessConstraints.${index}.name`)}
                            />
                            <Input
                                label={t("metadata.description_form.access_constraint_link")}
                                nativeInputProps={register(`accessConstraints.${index}.link`)}
                            />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={addAccessConstraint}>
                        {t("metadata.description_form.add_access_constraint")}
                    </Button>
                    {useConstraints.map((_, index) => (
                        <div key={`use-${index}`} className={fr.cx("fr-mb-3v")} style={{ border: "1px solid grey", padding: "1rem" }}>
                            <Button className={fr.cx("fr-btn--close", "fr-btn")} onClick={() => removeUseConstraint(index)}>
                                Supprimer
                            </Button>
                            <Select label={t("metadata.description_form.use_restriction_code")} nativeSelectProps={register(`useConstraints.${index}.code`)}>
                                <option value="otherRestrictions">otherRestrictions</option>
                                <option value="copyright">copyright</option>
                                <option value="patent">patent</option>
                                <option value="patentPending">patentPending</option>
                                <option value="trademark">trademark</option>
                                <option value="license">license</option>
                                <option value="intellectualPropertyRights">intellectualPropertyRights</option>
                                <option value="restricted">restricted</option>
                            </Select>
                            <Input label={t("metadata.description_form.use_constraint_name")} nativeInputProps={register(`useConstraints.${index}.name`)} />
                            <Input label={t("metadata.description_form.use_constraint_link")} nativeInputProps={register(`useConstraints.${index}.link`)} />
                        </div>
                    ))}
                    <Button iconId={"fr-icon-add-line"} priority="secondary" onClick={addUseConstraint}>
                        {t("metadata.description_form.add_use_constraint")}
                    </Button>
                </>
            ) : null}
        </div>
    );
};

export default Description;
