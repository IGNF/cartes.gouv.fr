import { fr } from "@codegouvfr/react-dsfr";
import { type InputProps } from "@codegouvfr/react-dsfr/Input";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { FC } from "react";
import { ControlImage, ControlLink, ControlUnlink } from "react-dsfr-tiptap/dialog";
import { MarkdownEditor as TiptapEditor } from "react-dsfr-tiptap/markdown";

import "react-dsfr-tiptap/index.css";
import "../../sass/components/tiptap.scss";

type MarkdownEditorProps = {
    className?: string;
    label?: string;
    hintText?: string;
    value: string;
    onChange: (values: string) => void;
    onBlur?: () => void;
    state?: InputProps["state"];
    stateRelatedMessage?: string;
    placeholder?: string;
};

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
    const { className, label, hintText, value, state, stateRelatedMessage, placeholder = "", onChange, onBlur } = props;
    const { isDark } = useIsDark();

    return (
        <div
            className={cx(
                fr.cx("fr-input-group", {
                    "fr-input-group--error": state === "error",
                }),
                className
            )}
            data-color-mode={isDark ? "dark" : "light"}
        >
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
                    StarterKit.configure({ link: false, underline: false }),
                    Image,
                    Link,
                    Placeholder.configure({
                        placeholder,
                    }),
                    Markdown,
                ]}
                onContentUpdate={onChange}
                onBlur={onBlur}
            />
            <div className={fr.cx("fr-messages-group")} aria-live="polite">
                {state !== "default" && (
                    <p
                        className={fr.cx(
                            (() => {
                                switch (state) {
                                    case "error":
                                        return "fr-error-text";
                                    case "success":
                                        return "fr-valid-text";
                                    case "info":
                                        return "fr-info-text";
                                }
                            })()
                        )}
                    >
                        {stateRelatedMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MarkdownEditor;
