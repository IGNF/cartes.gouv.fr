import { fr } from "@codegouvfr/react-dsfr";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import MDEditor from "@uiw/react-md-editor";
import { CSSProperties, FC } from "react";

import getLocaleCommands from "../../modules/react-md/react-md-commands";

type MarkdownEditorProps = {
    label?: string;
    hintText?: string;
    value: string;
    onChange: (values: string) => void;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    placeholder?: string;
};

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
    const { label, hintText, value, state, stateRelatedMessage, placeholder, onChange } = props;
    const { isDark } = useIsDark();

    const customStyle: CSSProperties = {
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
        borderRadius: `${fr.spacing("1v")} ${fr.spacing("1v")} 0 0`,
        boxShadow: `inset 0 -2px 0 0 var(${fr.colors.decisions.border.plain.grey.default})`,
        marginTop: fr.spacing("1v"),
        fontFamily: "Marianne, arial, sans-serif",
    };

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")} data-color-mode={isDark ? "dark" : "light"}>
            {label && (
                <label className={fr.cx("fr-label")}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>
            )}
            <MDEditor
                value={value}
                height={200}
                commands={getLocaleCommands("fr")}
                extraCommands={[]}
                textareaProps={{
                    placeholder: placeholder,
                }}
                onChange={(newValue = "") => onChange(newValue)}
                style={customStyle}
                previewOptions={{ style: customStyle }}
            />
            {state === "error" && stateRelatedMessage !== undefined && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
        </div>
    );
};

export default MarkdownEditor;
