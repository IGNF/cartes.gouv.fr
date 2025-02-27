import { fr } from "@codegouvfr/react-dsfr";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { FC, LazyExoticComponent, ReactNode } from "react";
import { Control, ControlComponent, RichTextEditor } from "react-dsfr-tiptap";
import { ControlImage, ControlLink, ControlUnlink, ControlYoutube } from "react-dsfr-tiptap/dialog";

type HtmlEditorEditorProps = {
    controlMap?: Partial<Record<Control, ControlComponent>>;
    label?: string;
    hintText?: ReactNode;
    removeEmptyParagraph?: boolean;
    extraControls?: (() => ReactNode)[];
    value: string;
    onChange: (values: string) => void;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
};

const extensionLoader = {
    color: () =>
        Promise.all([
            import("@tiptap/extension-color").then((module) => module.default),
            import("@tiptap/extension-text-style").then((module) => module.default),
        ]),
    highlight: () => import("@tiptap/extension-highlight").then((module) => module.default),
    image: () => import("@tiptap/extension-image").then((module) => module.default),
    link: () => import("@tiptap/extension-link").then((module) => module.default),
    subscript: () => import("@tiptap/extension-subscript").then((module) => module.default),
    superscript: () => import("@tiptap/extension-superscript").then((module) => module.default),
    textAlign: () => import("@tiptap/extension-text-align").then((module) => module.default),
    underline: () => import("@tiptap/extension-underline").then((module) => module.default),
    youtube: () => import("@tiptap/extension-youtube").then((module) => module.default),
};

const standardControls: (Control | (() => ReactNode) | LazyExoticComponent<() => ReactNode>)[][] = [
    ["Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript", "Code", "Highlight", "Color", "ClearFormatting"],
    ["H1", "H2", "H3", "H4", "H5", "H6", "Paragraph"],
    ["BulletList", "OrderedList", "CodeBlock", "Blockquote", "HorizontalRule"],
    ["AlignLeft", "AlignCenter", "AlignRight", "AlignJustify"],
    ["Undo", "Redo"],
    ["Link", "Unlink"],
    ["Image", "Youtube"],
];

const HtmlEditor: FC<HtmlEditorEditorProps> = (props) => {
    const { isDark } = useIsDark();

    const { controlMap, label, hintText, extraControls, value, state, stateRelatedMessage, removeEmptyParagraph = true, onChange } = props;

    const controls = [...standardControls];
    if (extraControls) {
        controls.push([...extraControls]);
    }

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")} data-color-mode={isDark ? "dark" : "light"}>
            {label && (
                <label className={fr.cx("fr-label")}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>
            )}
            <RichTextEditor
                content={value}
                removeEmptyParagraph={removeEmptyParagraph}
                controlMap={{ Link: ControlLink, Unlink: ControlUnlink, Image: ControlImage, Youtube: ControlYoutube, ...controlMap }}
                extensionLoader={extensionLoader}
                controls={controls}
                onContentUpdate={onChange}
            />
            {state === "error" && stateRelatedMessage !== undefined && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
        </div>
    );
};

export default HtmlEditor;
