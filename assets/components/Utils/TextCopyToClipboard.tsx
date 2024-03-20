import { fr, type FrCxArg } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { CSSProperties, FC, memo } from "react";

import { useSnackbarStore } from "../../stores/SnackbarStore";

type TextCopyToClipboardProps = {
    text: string;
    className?: FrCxArg;
    successMessage?: string;
    disabled?: boolean;
};

const TextCopyToClipboard: FC<TextCopyToClipboardProps> = ({ text, successMessage, className, disabled = false }) => {
    const setMessage = useSnackbarStore((state) => state.setMessage);

    const styleBoxCopyData: CSSProperties = {
        backgroundColor: disabled ? fr.colors.decisions.background.disabled.grey.default : fr.colors.decisions.background.alt.blueFrance.default,
        padding: fr.spacing("1w"),
        overflow: disabled ? "hidden" : "auto",
        width: "80%",
        whiteSpace: "nowrap",
        color: disabled ? fr.colors.decisions.text.disabled.grey.default : fr.colors.decisions.text.default.grey.default,
        userSelect: disabled ? "none" : "auto",
        cursor: disabled ? "not-allowed" : "auto",
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(text);

        setMessage(successMessage ?? "URL copiée");
    };

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", className)}>
            <span style={styleBoxCopyData}>{text}</span>
            <Button
                iconId="ri-file-copy-2-line"
                priority="tertiary no outline"
                title="Copier dans le presse-papier"
                onClick={copyToClipboard}
                disabled={disabled}
            />
        </div>
    );
};

export default memo(TextCopyToClipboard);
