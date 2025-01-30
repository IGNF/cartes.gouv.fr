import { fr } from "@codegouvfr/react-dsfr";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { FC } from "react";
import { MarkdownEditor as TiptapEditor } from "react-dsfr-tiptap/markdown";
import { ControlImage, ControlLink, ControlUnlink } from "react-dsfr-tiptap/dialog";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";

import "../../sass/components/tiptap.scss";

type MarkdownEditorProps = {
    className?: string;
    label?: string;
    hintText?: string;
    value: string;
    onChange: (values: string) => void;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    placeholder?: string;
};

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
    const { className, label, hintText, value, state, stateRelatedMessage, placeholder = "", onChange } = props;
    const { isDark } = useIsDark();

    const classNames = [fr.cx("fr-input-group")];
    if (state === "error") {
        classNames.push("fr-input-group--error");
    }
    if (className) {
        classNames.push(className);
    }

    return (
        <div className={classNames.join(" ")} data-color-mode={isDark ? "dark" : "light"}>
            {label && (
                <label className={fr.cx("fr-label")}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>
            )}
            <TiptapEditor
                content={value}
                controls={[
                    ["Bold", "Italic", "Strike", "Code", "ClearFormatting"],
                    ["H1", "H2", "H3", "H4", "H5", "H6", "Paragraph"],
                    ["BulletList", "OrderedList", "CodeBlock", "Blockquote", "HorizontalRule"],
                    [ControlLink, ControlUnlink, ControlImage],
                    ["Undo", "Redo"],
                ]}
                extensions={[
                    StarterKit,
                    Image,
                    Link,
                    Placeholder.configure({
                        placeholder,
                    }),
                    Markdown,
                ]}
                onContentUpdate={onChange}
            />
            {state === "error" && stateRelatedMessage !== undefined && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
        </div>
    );
};

export default MarkdownEditor;
