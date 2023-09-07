import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RQKeys from "../../../../modules/RQKeys";
import api from "../../../../api";
import { yupResolver } from "@hookform/resolvers/yup";
import MDEditor from "@uiw/react-md-editor";
import getLocaleCommands from "../../../../modules/react-md/react-md-commands";
import { format as datefnsFormat } from "date-fns";
import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import KeywordsSelect from "../../../../components/Utils/KeywordsSelect";
import { regex, removeDiacritics } from "../../../../utils";
import Translator from "../../../../modules/Translator";

// Themes et mot cles INSPIRE
import { getInspireKeywords } from "../../../../utils";

type DescriptionFormProps = {
    datastoreId: string;
    storedDataName: string;
    visible: boolean;
    onPrevious: () => void;
    onValid: (values) => void;
};

const DescriptionForm: FC<DescriptionFormProps> = ({ datastoreId, storedDataName, visible, onPrevious, onValid }) => {
    const keywords = getInspireKeywords();
    const now = datefnsFormat(new Date(), "yyyy-MM-dd");

    const schema = yup
        .object({
            data_technical_name: yup
                .string()
                .required(Translator.trans("service.wfs.new.description_form.technical_name_error"))
                .matches(/^[\w-.]+$/, Translator.trans("service.wfs.new.description_form.technical_name_regex"))
                .test({
                    name: "is-unique",
                    test(technicalName, ctx) {
                        const technicalNameList = offeringsQuery?.data?.map((data) => data?.layer_name);
                        if (technicalNameList?.includes(technicalName)) {
                            return ctx.createError({ message: `"${technicalName}" : Ce nom technique existe déjà` });
                        }

                        return true;
                    },
                }),
            data_public_name: yup.string().required(Translator.trans("service.wfs.new.description_form.public_name_error")),
            data_description: yup.string().required(Translator.trans("service.wfs.new.description_form.description_error")),
            data_identifier: yup.string().required(Translator.trans("service.wfs.new.description_form.identifier_error")),
            data_category: yup.string().required(Translator.trans("service.wfs.new.description_form.category_error")),
            data_email_contact: yup
                .string()
                .matches(regex.email, Translator.trans("service.wfs.new.description_form.email_contact_error"))
                .required(Translator.trans("service.wfs.new.description_form.email_contact_mandatory_error")),
            data_creation_date: yup.date().required(Translator.trans("service.wfs.new.description_form.creation_date_error")),
            data_resource_genealogy: yup.string(),
            data_organization: yup.string().required(Translator.trans("service.wfs.new.description_form.organization_error")),
            data_organization_email: yup
                .string()
                .matches(regex.email, Translator.trans("service.wfs.new.description_form.organization_email_error"))
                .required(Translator.trans("service.wfs.new.description_form.organization_email_mandatory_error")),
        })
        .required();

    const queryClient = useQueryClient();
    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: () => api.service.getOfferings(datastoreId),
        refetchInterval: 10000,
    });

    const { isDark } = useIsDark();
    const [description, setDescription] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue: setFormValue,
        getValues: getFormValues,
        trigger,
    } = useForm({ resolver: yupResolver(schema) });

    useEffect(() => {
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

        setFormValue("data_technical_name", nice);
        setFormValue("data_public_name", storedDataName);
    }, [setFormValue, storedDataName]);

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({ queryKey: [...RQKeys.datastore_offering_list(datastoreId)] });
        };
    }, [datastoreId, queryClient, offeringsQuery.data]);

    const handleKeywordsChange = (values) => {
        setFormValue("data_category", values.join(","), { shouldValidate: true });
    };

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wfs.new.description_form.description_title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            <Input
                label={Translator.trans("service.wfs.new.description_form.technical_name")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_technical_name")}
                state={errors.data_technical_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_technical_name?.message}
                nativeInputProps={{
                    ...register("data_technical_name"),
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.public_name")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_public_name")}
                state={errors.data_public_name ? "error" : "default"}
                stateRelatedMessage={errors?.data_public_name?.message}
                nativeInputProps={{
                    ...register("data_public_name"),
                }}
            />
            <div className={fr.cx("fr-input-group", errors.data_description && "fr-input-group--error")} data-color-mode={isDark ? "dark" : "light"}>
                <label className={fr.cx("fr-label")}>
                    {Translator.trans("service.wfs.new.description_form.description")}
                    <span className="fr-hint-text">{Translator.trans("service.wfs.new.description_form.hint_description")}</span>
                </label>
                <MDEditor
                    value={description}
                    height={200}
                    commands={getLocaleCommands("fr")}
                    extraCommands={[]}
                    textareaProps={{
                        placeholder: Translator.trans("service.wfs.new.description_form.markdown_placeholder"),
                    }}
                    onChange={(newValue = "") => {
                        setDescription(newValue);
                        setFormValue("data_description", newValue);
                        trigger();
                    }}
                />
                {errors.data_description && <p className={fr.cx("fr-error-text")}>{errors.data_description?.message}</p>}
            </div>
            <Input
                label={Translator.trans("service.wfs.new.description_form.identifier")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_identifier")}
                state={errors.data_identifier ? "error" : "default"}
                stateRelatedMessage={errors?.data_identifier?.message}
                nativeInputProps={{
                    ...register("data_identifier"),
                    readOnly: true,
                    defaultValue: uuidv4(),
                }}
            />
            <KeywordsSelect
                label={Translator.trans("service.wfs.new.description_form.category")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_category")}
                state={errors.data_category ? "error" : "default"}
                stateRelatedMessage={errors?.data_category?.message}
                freeSolo
                keywords={keywords}
                onChange={handleKeywordsChange}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.email_contact")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_email_contact")}
                state={errors.data_email_contact ? "error" : "default"}
                stateRelatedMessage={errors?.data_email_contact?.message}
                nativeInputProps={{
                    ...register("data_email_contact"),
                }}
            />
            <h3>{Translator.trans("service.wfs.new.description_form.time_reference_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.description_form.creation_date")}
                // hintText={Translator.trans("service.wfs.new.description_form.hint_creation_date")}
                state={errors.data_creation_date ? "error" : "default"}
                stateRelatedMessage={errors?.data_creation_date?.message}
                nativeInputProps={{
                    ...register("data_creation_date"),
                    type: "date",
                    value: now,
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.resource_genealogy")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_resource_genealogy")}
                state={errors.data_resource_genealogy ? "error" : "default"}
                stateRelatedMessage={errors?.data_resource_genealogy?.message}
                textArea={true}
                nativeTextAreaProps={{
                    ...register("data_resource_genealogy"),
                }}
            />
            <h3>{Translator.trans("service.wfs.new.description_form.resource_manager_title")}</h3>
            <Input
                label={Translator.trans("service.wfs.new.description_form.organization")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_organization")}
                state={errors.data_organization ? "error" : "default"}
                stateRelatedMessage={errors?.data_organization?.message}
                nativeInputProps={{
                    ...register("data_organization"),
                }}
            />
            <Input
                label={Translator.trans("service.wfs.new.description_form.organization_email")}
                hintText={Translator.trans("service.wfs.new.description_form.hint_organization_email")}
                state={errors.data_organization_email ? "error" : "default"}
                stateRelatedMessage={errors?.data_organization_email?.message}
                nativeInputProps={{
                    ...register("data_organization_email"),
                }}
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
                        onClick: () => {
                            handleSubmit(onSubmit)();
                        },
                    },
                ]}
                inlineLayoutWhen="always"
            />
        </div>
    );
};

export default DescriptionForm;
