import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import * as yup from "yup";
import { Recipients } from "../../../../../../@types/espaceco";
import InputCollection from "../../../../../../components/Input/InputCollection";
import { useTranslation } from "../../../../../../i18n/i18n";

type RecipientFormType = {
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
        extraRecipients: recipients.filter((recipient) => isEmail(recipient)),
    };
};

const RecipientsManager: FC<RecipientsManagerProps> = ({ value, state, stateRelatedMessage, onChange }) => {
    const { t } = useTranslation("AddOrEditEmailPlanner");

    const [basicRecipients, setBasicRecipients] = useState<string[]>(() => value.filter((recipient) => !isEmail(recipient)));

    const schema = yup.object({
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
        watch,
        formState: { errors },
    } = useForm<RecipientFormType>({
        mode: "onChange",
        resolver: yupResolver(schema),
        values: defaultValues(value),
    });

    const extraRecipients = watch("extraRecipients");

    useEffect(() => {
        const recipients = [...(basicRecipients ?? []), ...(extraRecipients ?? [])];
        onChange(recipients);
    }, [basicRecipients, extraRecipients, onChange]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let basics = [...basicRecipients];

        const checked = event.currentTarget.checked;
        if (checked) {
            basics.push(event.currentTarget.value);
        } else basics = basics.filter((v) => v !== event.currentTarget.value);

        setBasicRecipients([...new Set(basics)]);
    };

    return (
        <div className={fr.cx("fr-input-group", "fr-mb-6v", state === "error" && "fr-input-group--error")}>
            <h5>{t("dialog.recipients")}</h5>
            <Checkbox
                options={Recipients.map((r) => ({
                    label: t("recipient", { name: r }),
                    nativeInputProps: {
                        onChange: (e) => handleChange(e),
                        value: r,
                        checked: basicRecipients.includes(r),
                    },
                }))}
            />
            <Controller
                control={control}
                name="extraRecipients"
                render={({ field: { value, onChange } }) => (
                    <InputCollection
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
