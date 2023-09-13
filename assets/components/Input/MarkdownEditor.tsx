import { fr } from "@codegouvfr/react-dsfr";
import { useColors } from "@codegouvfr/react-dsfr/useColors";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import MDEditor from "@uiw/react-md-editor";
import { CSSProperties, FC, useState } from "react";

import getLocaleCommands from "../../modules/react-md/react-md-commands";
import Translator from "../../modules/Translator";

type MarkdownEditorProps = {
    label?: string;
    hintText?: string;
    defaultValue?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    placeholder?: string;
    onChange?: (values: string) => void;
};

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
    const { label, hintText, defaultValue = "", state, stateRelatedMessage, placeholder, onChange } = props;
    const { isDark } = useIsDark();
    const theme = useColors();

    const [value, setValue] = useState<string>(defaultValue);

    const customStyle: CSSProperties = {
        backgroundColor: theme.decisions.background.contrast.grey.default,
        borderRadius: `${fr.spacing("1v")} ${fr.spacing("1v")} 0 0`,
        boxShadow: `inset 0 -2px 0 0 var(${theme.decisions.border.plain.grey.default})`,
        marginTop: fr.spacing("1v"),
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
                    placeholder: placeholder ?? Translator.trans("service.wfs.new.description_form.markdown_placeholder"),
                }}
                onChange={(newValue = "") => {
                    setValue(newValue);
                    if (onChange) {
                        onChange(newValue);
                    }
                }}
                style={customStyle}
                previewOptions={{ style: customStyle }}
            />
            {state === "error" && stateRelatedMessage !== undefined && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
        </div>
    );
};

export default MarkdownEditor;
