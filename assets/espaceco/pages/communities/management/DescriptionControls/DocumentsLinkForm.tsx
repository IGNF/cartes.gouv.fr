import { useEditor } from "react-dsfr-tiptap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { getThumbnailFromFileName } from "@/espaceco/esco_utils";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { DocumentDTO } from "@/@types/espaceco";
import { useTranslation } from "@/i18n";

const schema = yup.object({
    id: yup.string().required(),
});

interface ILinkForm {
    id: string;
}

export interface DocumentsLinkFormRef {
    submit: () => void;
}

interface IDocumentsLinkFormProps {
    documents: DocumentDTO[];
    isOpened?: boolean;
}

function DocumentsLinkForm(props: IDocumentsLinkFormProps, ref) {
    const { t } = useTranslation("ManageCommunity");
    const { documents, isOpened } = props;
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
            const document = documents.find((doc) => doc.download_uri === href);
            if (document) {
                setValue("id", String(document.id));
            } else {
                setValue("id", "");
            }
        }
    }, [documents, editor, isOpened, setValue]);

    const onSubmit = handleSubmit((values) => {
        const { id } = values;
        const document = documents.find((doc) => doc.id === Number(id));
        if (document) {
            const external = true;
            editor.chain().focus().extendMarkRange("link").run();
            const { from } = editor.state.selection;
            editor
                .chain()
                .insertContent(document.title)
                .setTextSelection({ from, to: from + document.title.length })
                .setLink({ href: document.download_uri, target: external ? "_blank" : null })
                .run();
        }
    });

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
    }));

    return (
        <form onSubmit={onSubmit}>
            <RadioButtons
                legend={t("tiptap.select_document")}
                name="radio"
                options={documents.map((document) => ({
                    illustration: document.mime_type.startsWith("image") ? (
                        <img alt={document.title} src={document.uri ?? getThumbnailFromFileName(document.short_fileName)} />
                    ) : undefined,
                    label: document.title,
                    nativeInputProps: {
                        value: document.id,
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

export default forwardRef(DocumentsLinkForm);
