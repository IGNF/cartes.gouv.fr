import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import { BasicRecipientsArray, EmailPlannerAddType, EmailPlannerFormType, EmailPlannerTypes } from "../../../../../../@types/app_espaceco";
import { CancelEventType, ReportStatusesDTO, TriggerEventType } from "../../../../../../@types/espaceco";
import AutocompleteSelect from "../../../../../../components/Input/AutocompleteSelect";
import { useTranslation } from "../../../../../../i18n/i18n";
import { getAddDefaultValues } from "./Defaults";
import PersonalEmailPlanner from "./PersonalEmailPlanner";
import { getBasicSchema, getPersonalSchema } from "./schemas";

const AddEmailPlannerDialogModal = createModal({
    id: "add-emailplanner",
    isOpenedByDefault: false,
});

type AddEmailPlannerDialogProps = {
    themes: string[];
    statuses: ReportStatusesDTO;
    onAdd: (values: EmailPlannerAddType) => void;
};

const AddEmailPlannerDialog: FC<AddEmailPlannerDialogProps> = ({ themes, statuses, onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddOrEditEmailPlanner");

    const [type, setType] = useState<"basic" | "personal">("basic");

    const schemas = {};
    schemas["basic"] = getBasicSchema();
    schemas["personal"] = getPersonalSchema(themes, statuses);

    const form = useForm<EmailPlannerFormType>({
        mode: "onChange",
        resolver: yupResolver(schemas[type]),
        defaultValues: getAddDefaultValues(type),
    });
    const {
        control,
        formState: { errors },
        getValues: getFormValues,
        reset,
        handleSubmit,
    } = form;

    useEffect(() => {
        reset(getAddDefaultValues(type));
    }, [reset, type]);

    const resetForm = useCallback(() => {
        /* si type est déjà basic, setType ne déclenchera pas le useEffect précédent 
        et ne fera donc pas un reset du formulaire avec les valeurs par défaut */
        type === "basic" ? reset(getAddDefaultValues(type)) : setType("basic");
    }, [type, reset]);

    const onSubmit = () => {
        const values = getFormValues();

        let form: EmailPlannerAddType = {
            subject: values.subject,
            event: values.event as TriggerEventType,
            cancel_event: values.cancel_event as CancelEventType,
            body: values.body,
            recipients: values.recipients,
            themes: values.themes ?? [],
            condition: null,
            delay: values.delay,
            repeat: values.repeat,
        };

        if (values.event === "georem_status_changed") {
            const statuses = values.statuses ?? [];
            if (statuses.length) {
                form = { ...form, condition: { status: statuses } };
            }
        }

        onAdd(form);

        resetForm();
        AddEmailPlannerDialogModal.close();
    };

    return (
        <>
            {createPortal(
                <AddEmailPlannerDialogModal.Component
                    title={t("title", { edit: false })}
                    size={"large"}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            onClick: () => {
                                resetForm();
                                AddEmailPlannerDialogModal.close();
                            },
                        },
                        {
                            children: tCommon("add"),
                            priority: "primary",
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                        },
                    ]}
                >
                    <div>
                        <h5>{t("choose_email_type")}</h5>
                        <RadioButtons
                            orientation={"horizontal"}
                            options={EmailPlannerTypes.map((ept) => ({
                                label: t("email_planner_type", { type: ept }),
                                nativeInputProps: {
                                    onChange: () => setType(ept),
                                    checked: type === ept,
                                },
                            }))}
                        />
                        <hr />
                        <p>{tCommon("mandatory_fields")}</p>
                        {type === "basic" ? (
                            <>
                                <h5>{t("dialog.recipients")}</h5>
                                <Controller
                                    control={control}
                                    name="recipients"
                                    render={({ field: { value, onChange } }) => (
                                        <AutocompleteSelect
                                            label={""}
                                            state={errors.recipients ? "error" : "default"}
                                            stateRelatedMessage={errors.recipients?.message?.toString()}
                                            freeSolo={true}
                                            options={BasicRecipientsArray}
                                            isOptionEqualToValue={(option, value) => {
                                                return option === value;
                                            }}
                                            searchFilter={{ limit: 10 }}
                                            onChange={(_, value) => {
                                                if (value && Array.isArray(value)) {
                                                    value = value.filter((v) => {
                                                        if (BasicRecipientsArray.includes(v)) return true;
                                                        return isEmail(v);
                                                    });
                                                    onChange(value);
                                                }
                                            }}
                                            value={value}
                                        />
                                    )}
                                />
                            </>
                        ) : (
                            <PersonalEmailPlanner form={form} themes={themes} statuses={statuses} />
                        )}
                    </div>
                </AddEmailPlannerDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AddEmailPlannerDialog, AddEmailPlannerDialogModal };
