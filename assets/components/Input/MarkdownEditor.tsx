import { fr } from "@codegouvfr/react-dsfr";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import MDEditor, { ICommand } from "@uiw/react-md-editor";
import { CSSProperties, FC, ReactNode } from "react";

import { getLocaleCommands } from "../../modules/react-md/commands";
import Translator from "../../modules/Translator";
import { useLang } from "../../i18n/i18n";

type MarkdownEditorProps = {
    label?: string;
    hintText?: ReactNode;
    /* Les commandes supplémentaires standard peuvent être récupérées via 
    getExtraCommands dans @uiw/react-md-editor */
    extraCommands?: ICommand[];
    value: string;
    onChange: (values: string) => void;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    placeholder?: string;
};

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
    const { label, hintText, extraCommands, value, state, stateRelatedMessage, placeholder, onChange } = props;
    const { isDark } = useIsDark();
    const { lang } = useLang();

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
                commands={getLocaleCommands(lang)}
                extraCommands={extraCommands ?? []}
                textareaProps={{
                    placeholder: placeholder ?? Translator.trans("service.wfs.new.description_form.markdown_placeholder"),
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
