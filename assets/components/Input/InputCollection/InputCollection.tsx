import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC } from "react";
import { useForm } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import * as yup from "yup";
import { ValidatorType } from "./InputCollection.types";

interface InputCollectionProps {
    label?: string;
    hintText?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    minLength?: number;
    validator?: ValidatorType; // On pourrait en mettre plusieurs
    value?: string[];
    onChange: (value: string[]) => void;
}

const InputCollection: FC<InputCollectionProps> = (props: InputCollectionProps) => {
    const { label, hintText, state, stateRelatedMessage, minLength = 0, validator = "none", value = [], onChange } = props;

    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("InputCollection");

    const _validator: (value) => boolean = validator === "email" ? isEmail : undefined;

    const schema = yup.object({
        text: yup
            .string()
            .min(minLength, t("min_length_error", { min: minLength }))
            .test({
                name: "check",
                test(value, ctx) {
                    if (!value) return true;
                    if (_validator) {
                        if (!_validator(value)) {
                            return ctx.createError({ message: `${value} n'est pas un email valide` });
                        }
                    }
                    return true;
                },
            }),
    });

    const {
        register,
        formState: { errors },
        getValues: getFormValues,
        resetField,
        handleSubmit,
    } = useForm<{ text?: string }>({
        mode: "onChange",
        resolver: yupResolver(schema),
    });

    const onSubmit = () => {
        const v = getFormValues("text");
        const values = value ? [...value] : [];
        if (v) {
            values.push(v);
            onChange(Array.from(new Set(values)));
            resetField("text");
        }
    };

    /* Suppression d'une ligne */
    const handleRemove = (text: string) => {
        const values = value.filter((v) => text !== v);
        onChange(values);
    };

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
            {label && <label className={fr.cx("fr-label")}>{label}</label>}
            {hintText && <span className={fr.cx("fr-hint-text", "fr-mt-2v")}>{hintText}</span>}
            <div className={fr.cx("fr-grid-row", "fr-grid-row--top")}>
                <div className={fr.cx("fr-col")}>
                    <Input
                        className={fr.cx("fr-mb-1v")}
                        label={null}
                        state={errors.text ? "error" : "default"}
                        stateRelatedMessage={errors?.text?.message?.toString()}
                        nativeInputProps={{
                            ...register("text"),
                        }}
                    />
                </div>
                <Button className={fr.cx("fr-mb-1v")} iconId={"fr-icon-add-circle-line"} priority="tertiary" onClick={handleSubmit(onSubmit)}>
                    {tCommon("add")}
                </Button>
            </div>
            {value && (
                <div>
                    {value.map((v) => (
                        <div key={v} className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col")}>{v}</div>
                            <Button title={tCommon("delete")} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(v)} />
                        </div>
                    ))}
                </div>
            )}

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
                        })(),
                        "fr-mb-1v"
                    )}
                >
                    {stateRelatedMessage}
                </p>
            )}
        </div>
    );
};

export default InputCollection;
