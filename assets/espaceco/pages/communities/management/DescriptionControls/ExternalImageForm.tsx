import { useEditor } from "react-dsfr-tiptap";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@codegouvfr/react-dsfr/Input.js";
import { yupResolver } from "@hookform/resolvers/yup";
import isURL from "validator/lib/isURL.js";
import * as yup from "yup";

const schema = yup.object({
    src: yup
        .string()
        .test("check-url", "La chaîne doit être une url valide", (value) => isURL(value ?? ""))
        .required(),
    alt: yup.string(),
    title: yup.string(),
});

interface IImageForm {
    src: string;
    alt?: string;
    title?: string;
}

export interface ExternalImageFormRef {
    submit: () => void;
}

interface ICustomImageFormProps {
    isOpened?: boolean;
}

function ExternalImageForm(props: ICustomImageFormProps, ref) {
    const { isOpened } = props;
    const editor = useEditor();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<IImageForm>({
        mode: "onSubmit",
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (isOpened) {
            const { src, alt, title } = editor.getAttributes("image");
            if (src) {
                setValue("src", src);
                setValue("alt", alt);
                setValue("title", title);
            } else {
                setValue("src", "");
                setValue("alt", "");
                setValue("title", "");
            }
        }
    }, [editor, isOpened, setValue]);

    const onSubmit = handleSubmit((values) => {
        const { src, alt, title } = values;
        editor.chain().focus().setImage({ src, alt, title }).run();
    });

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
    }));

    return (
        <form onSubmit={onSubmit}>
            <Input
                label={"URL"}
                state={errors.src ? "error" : "default"}
                stateRelatedMessage={errors?.src?.message?.toString()}
                nativeInputProps={{
                    ...register("src"),
                    placeholder: "https://www.example.com/image.jpg",
                }}
            />
            <Input
                label={"Alt"}
                state={errors.alt ? "error" : "default"}
                stateRelatedMessage={errors?.alt?.message?.toString()}
                nativeInputProps={{
                    ...register("alt"),
                }}
            />
            <Input
                label={"Titre"}
                state={errors.title ? "error" : "default"}
                stateRelatedMessage={errors?.title?.message?.toString()}
                nativeInputProps={{
                    ...register("title"),
                }}
            />
            <input type="submit" hidden />
        </form>
    );
}

export default forwardRef(ExternalImageForm);
