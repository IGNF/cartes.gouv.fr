import { CSSProperties, FC } from "react";
import { useColors } from "@codegouvfr/react-dsfr/useColors";
import { type FrCxArg, fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";

type TextCopyToClipboardProps = {
    text: string;
    className?: FrCxArg;
};

const TextCopyToClipboard: FC<TextCopyToClipboardProps> = ({ text, className }) => {
    const theme = useColors();
    const styleBoxCopyData: CSSProperties = {
        backgroundColor: theme.decisions.background.alt.blueFrance.default,
        padding: fr.spacing("1w"),
        overflow: "auto",
        width: "80%",
        whiteSpace: "nowrap",
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", className)}>
            <span style={styleBoxCopyData}>{text}</span>
            <Button iconId="ri-file-copy-2-line" priority="tertiary no outline" title="Copier dans le presse-papier" onClick={copyToClipboard} />
        </div>
    );
};

export default TextCopyToClipboard;
