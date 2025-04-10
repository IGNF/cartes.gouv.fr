import { getSelectedText, useEditor } from "react-dsfr-tiptap";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@codegouvfr/react-dsfr/Input.js";
import { yupResolver } from "@hookform/resolvers/yup";
import isMailto from "validator/lib/isMailtoURI.js";
import isURL from "validator/lib/isURL.js";
import * as yup from "yup";
import { useTranslation } from "@/i18n";

const schema = yup.object({
    label: yup.string().required(),
    href: yup
        .string()
        .test("check-url", "La chaîne doit être un mailto ou une url valide", (value) => isURL(value ?? "") || isMailto(value ?? ""))
        .required(),
});

interface ILinkForm {
    label: string;
    href: string;
}

export interface ExternalLinkFormRef {
    submit: () => void;
}

interface ICustomLinkFormProps {
    isOpened?: boolean;
}

function ExternalLinkForm(props: ICustomLinkFormProps, ref) {
    const { t } = useTranslation("ManageCommunity");
    const { isOpened } = props;
    const editor = useEditor();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ILinkForm>({
        mode: "onSubmit",
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (isOpened) {
            const { href } = editor.getAttributes("link");
            if (href) {
                setValue("href", href);
                editor.chain().focus().extendMarkRange("link").run();
            } else {
                setValue("href", "");
            }
            setValue("label", getSelectedText(editor));
        }
    }, [editor, isOpened, setValue]);

    const onSubmit = handleSubmit((values) => {
        const { href, label } = values;
        const external = true;

        editor.chain().focus().extendMarkRange("link").run();
        const { from } = editor.state.selection;
        editor
            .chain()
            .insertContent(label)
            .setTextSelection({ from, to: from + label.length })
            .setLink({ href, target: external ? "_blank" : null })
            .run();
    });

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
    }));

    return (
        <form onSubmit={onSubmit}>
            <Input
                label={t("tiptap.url")}
                state={errors.href ? "error" : "default"}
                stateRelatedMessage={errors?.href?.message?.toString()}
                nativeInputProps={{
                    ...register("href"),
                    placeholder: "http://www.example.com, mailto:name@email.com",
                }}
            />
            <Input
                label={"tiptap.label"}
                state={errors.label ? "error" : "default"}
                stateRelatedMessage={errors?.label?.message?.toString()}
                nativeInputProps={{
                    ...register("label"),
                }}
            />
            <input type="submit" hidden />
        </form>
    );
}

export default forwardRef(ExternalLinkForm);
