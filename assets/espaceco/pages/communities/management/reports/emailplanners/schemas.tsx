import isEmail from "validator/lib/isEmail";
import * as yup from "yup";
import { BasicRecipientsArray } from "../../../../../../@types/app_espaceco";
import { CancelEvents, ReportStatusesDTO, TriggerEvents } from "../../../../../../@types/espaceco";
import { getTranslation } from "../../../../../../i18n/i18n";

const { t } = getTranslation("AddOrEditEmailPlanner");

const cloneEvents = [...TriggerEvents] as string[];
const cloneCancelEvents = [...CancelEvents] as string[];

const recipientsSchema = yup.object({
    recipients: yup
        .array()
        .of(yup.string().required())
        .test({
            name: "check",
            test: (value, ctx) => {
                if (value === undefined) return true;
                if (!value.length) {
                    return ctx.createError({ message: t("validation.error.email.min") });
                }
                for (const v of value) {
                    if (BasicRecipientsArray.includes(v)) continue;
                    if (!isEmail(v)) {
                        return ctx.createError({ message: t("validation.error.email_not_valid", { value: v }) });
                    }
                }
                return true;
            },
        })
        .required(),
});

const getBasicSchema = () => {
    return recipientsSchema;
};

const getPersonalSchema = (themes: string[], statuses: ReportStatusesDTO) => {
    return recipientsSchema.concat(
        yup.object({
            subject: yup.string().required(t("validation.subject.mandatory")),
            body: yup.string().required(t("validation.body.mandatory")),
            delay: yup.number().min(1, t("validation.delay.positive")).required(t("validation.delay.mandatory")),
            repeat: yup.boolean().required(),
            event: yup.string().required().oneOf(cloneEvents),
            cancel_event: yup
                .string()
                .required()
                .oneOf([...cloneCancelEvents]),
            statuses: yup
                .array()
                .of(yup.string().oneOf(Object.keys(statuses)).required())
                .test({
                    name: "validate-status",
                    test: (value, context) => {
                        if (!value) return true;
                        const {
                            parent: { event },
                        } = context;

                        if (event === "georem_status_changed") {
                            if (value && value.length === 0) {
                                return context.createError({ message: t("validation.condition.mandatory") });
                            }
                        }

                        return true;
                    },
                }),
            themes: yup
                .array()
                .of(yup.string().oneOf(themes).required())
                .test({
                    name: "validate-status",
                    test: (value, context) => {
                        const v = value ?? [];
                        const {
                            parent: { event },
                        } = context;

                        if (event === "georem_created" && v.length === 0) {
                            return context.createError({ message: t("validation.themes.mandatory") });
                        }
                        return true;
                    },
                }),
        })
    );
};

export { getBasicSchema, getPersonalSchema };
