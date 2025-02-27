import { useEditor } from "react-dsfr-tiptap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { DocumentDTO } from "@/@types/espaceco";

const schema = yup.object({
    id: yup.string().required(),
});

interface IImageForm {
    id: string;
}

export interface DocumentsImageFormRef {
    submit: () => void;
}

export interface DocumentControlImage extends DocumentDTO {
    src: string;
}

interface IDocumentsImageFormProps {
    isOpened?: boolean;
    images: DocumentControlImage[];
}

function DocumentsImageForm(props: IDocumentsImageFormProps, ref) {
    const { isOpened, images } = props;
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
            const { src } = editor.getAttributes("image");
            const image = images.find((img) => img.src === src);
            if (image) {
                setValue("id", String(image.id));
            } else {
                setValue("id", "");
            }
        }
    }, [editor, images, isOpened, setValue]);

    const onSubmit = handleSubmit((values) => {
        const { id } = values;
        const image = images.find((img) => img.id === Number(id));
        if (image) {
            editor.chain().focus().setImage({ src: image.src, alt: image.title, title: image.title }).run();
        }
    });

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
    }));

    return (
        <form onSubmit={onSubmit}>
            <RadioButtons
                legend="Sélectionnez une image"
                name="radio"
                options={images.map((image) => ({
                    illustration: <img alt={image.title} src={image.src} />,
                    label: image.title,
                    nativeInputProps: {
                        value: image.id,
                        ...register("id"),
                    },
                }))}
                state={errors.id?.message !== undefined ? "error" : "default"}
                stateRelatedMessage={errors.id?.message}
            />
            <input type="submit" hidden />
        </form>
    );
}

export default forwardRef(DocumentsImageForm);
