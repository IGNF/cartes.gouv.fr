import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { EmailPlannerFormType, EmailPlannerType, EmailPlannerTypes } from "../../../../../../@types/app_espaceco";
import { CancelEvents, TriggerEvents } from "../../../../../../@types/espaceco";
import { useTranslation } from "../../../../../../i18n/i18n";
import { setToNull } from "../../../../../../utils";
import { getAddDefaultValues } from "./Defaults";
import PersonalEmailPlanner from "./PersonalEmailPlanner";
import RecipientsManager from "./RecipientsManager";

const cloneEvents = [...TriggerEvents] as string[];
const cloneCancelEvents = [...CancelEvents] as string[];

const AddEmailPlannerDialogModal = createModal({
    id: "add-emailplanner",
    isOpenedByDefault: false,
});

type AddEmailPlannerDialogProps = {
    themes: string[];
    statuses: string[];
};

const AddEmailPlannerDialog: FC<AddEmailPlannerDialogProps> = ({ themes, statuses }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddOrEditEmailPlanner");

    const [type, setType] = useState<EmailPlannerType>("basic");

    const baseSchema = yup.object({
        type: yup.string().oneOf([...EmailPlannerTypes]),
        recipients: yup.array().of(yup.string().required()).min(1, t("validation.error.email.min")).required(),
    });

    const schema = {};

    schema["basic"] = baseSchema;
    schema["personal"] = baseSchema.shape({
        subject: yup.string().required(t("validation.subject.mandatory")),
        body: yup.string().required(t("validation.body.mandatory")),
        delay: yup.number().min(1, t("validation.delay.positive")).required(t("validation.delay.mandatory")),
        repeat: yup.boolean().required(),
        event: yup.string().required().oneOf(cloneEvents),
        cancel_event: yup
            .string()
            .required()
            .oneOf([...cloneCancelEvents]),
        condition: yup.object({
            status: yup
                .array()
                .of(yup.string().oneOf(statuses).required())
                .test({
                    name: "validate-condition",
                    test: (value, context) => {
                        if (!value || !context.from) return true;

                        const [, parent] = context.from;
                        const { event } = parent.value;
                        if (event === "georem_status_changed") {
                            if (value && value.length === 0) {
                                return context.createError({ message: t("validation.condition.mandatory") });
                            }
                        }

                        return true;
                    },
                }),
        }),
        /*.test({
                name: "validate-condition",
                test: (value, context) => {
                    const {
                        parent: { event },
                    } = context;
                    if (event === "georem_status_changed") {
                        if (!("status" in value) || value["status"]?.length === 0) {
                            return context.createError({ message: t("validation.condition.mandatory") });
                        }
                    }
                    return true;
                },
            })*/ themes: yup.string().nullable().transform(setToNull),
    });

    const form = useForm<EmailPlannerFormType>({
        mode: "onChange",
        resolver: yupResolver(schema[type]),
        defaultValues: getAddDefaultValues(type),
    });
    const {
        control,
        watch,
        formState: { errors },
        getValues: getFormValues,
        reset,
        handleSubmit,
    } = form;

    /* TODO SUPPRIMER */
    const values = watch();
    useEffect(() => {
        console.log("VALUES : ", values);
    }, [values]);

    useEffect(() => {
        reset(getAddDefaultValues(type));
    }, [reset, type]);

    const resetForm = useCallback(() => {
        type === "basic" ? reset(getAddDefaultValues(type)) : setType("basic");
    }, [type, reset]);

    // TODO
    const onSubmit = () => {
        const values = getFormValues();
        console.log(values);
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
                            <Controller
                                control={control}
                                name="recipients"
                                render={({ field: { value, onChange } }) => (
                                    <RecipientsManager
                                        state={errors.recipients ? "error" : "default"}
                                        stateRelatedMessage={errors.recipients?.message?.toString()}
                                        value={value ?? []}
                                        onChange={onChange}
                                    />
                                )}
                            />
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
