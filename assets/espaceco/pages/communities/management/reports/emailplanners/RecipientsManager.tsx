import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import * as yup from "yup";
import { BasicRecipientsArray } from "../../../../../../@types/app_espaceco";
import { BasicRecipients } from "../../../../../../@types/espaceco";
import InputCollection from "../../../../../../components/Input/InputCollection";
import { useTranslation } from "../../../../../../i18n/i18n";

type RecipientFormType = {
    basicRecipients?: string[];
    extraRecipients?: string[];
};

type RecipientsManagerProps = {
    value: string[];
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (values: string[]) => void;
};

const defaultValues = (recipients) => {
    return {
        basicRecipients: recipients.filter((recipient) => !isEmail(recipient)),
        extraRecipients: recipients.filter((recipient) => isEmail(recipient)),
    };
};

const RecipientsManager: FC<RecipientsManagerProps> = ({ value, state, stateRelatedMessage, onChange }) => {
    const { t } = useTranslation("AddOrEditEmailPlanner");

    const schema = yup.object({
        basicRecipients: yup.array().of(yup.string().oneOf(BasicRecipientsArray).required()),
        extraRecipients: yup
            .array()
            .of(yup.string().required())
            .test({
                name: "check-email",
                test(value, ctx) {
                    if (value) {
                        for (const v of value) {
                            if (!isEmail(v)) {
                                return ctx.createError({ message: t("validation.error.email_not_valid", { value: v }) });
                            }
                        }
                    }
                    return true;
                },
            }),
    });

    const {
        control,
        register,
        formState: { errors },
    } = useForm<RecipientFormType>({
        mode: "onChange",
        resolver: yupResolver(schema),
        values: defaultValues(value),
    });

    const basicRecipients = useWatch({
        control: control,
        name: "basicRecipients",
    });
    const extraRecipients = useWatch({
        control: control,
        name: "extraRecipients",
    });

    useEffect(() => {
        const recipients = [...(basicRecipients ?? []), ...(extraRecipients ?? [])];
        onChange(recipients);
    }, [basicRecipients, extraRecipients, onChange]);

    return (
        <div className={fr.cx("fr-input-group", "fr-mb-6v", state === "error" && "fr-input-group--error")}>
            <h5>{t("dialog.recipients")}</h5>
            <Checkbox
                options={BasicRecipients.map((r) => ({
                    label: t("recipient", { name: r }),
                    nativeInputProps: {
                        ...register("basicRecipients"),
                        value: r,
                    },
                }))}
            />
            <Controller
                control={control}
                name="extraRecipients"
                render={({ field: { value, onChange } }) => (
                    <InputCollection
                        validator="email"
                        state={errors.extraRecipients ? "error" : "default"}
                        stateRelatedMessage={errors.extraRecipients?.message?.toString()}
                        value={value}
                        onChange={onChange}
                    />
                )}
            />
            {state !== "default" && (
                <p
                    className={fr.cx(
                        (() => {
                            switch (state) {
                                case "error":
                                    return "fr-error-text";
                                case "success":
                                    return "fr-valid-text";
                            }
                        })()
                    )}
                >
                    {stateRelatedMessage}
                </p>
            )}
        </div>
    );
};

export default RecipientsManager;
