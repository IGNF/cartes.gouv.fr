import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, memo, ReactNode } from "react";
import { symToStr } from "tsafe/symToStr";
import { tss } from "tss-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useTranslation } from "@/i18n";

type TextCopyToClipboardProps = {
    label?: string;
    text: string;
    title?: string;
    className?: string;
    successMessage?: string;
    disabled?: boolean;
    children?: ReactNode;
};

const TextCopyToClipboard: FC<TextCopyToClipboardProps> = (props) => {
    const { t: tCommon } = useTranslation("Common");
    const { children, label, text, title = tCommon("copy_to_clipboard"), successMessage, className, disabled = false } = props;
    const copy = useCopyToClipboard();
    const { classes, cx } = useStyles({ disabled });

    function copyToClipboard() {
        copy(text, successMessage);
    }

    return (
        <div className={cx(classes.root, className)}>
            {label && (
                <span>
                    <strong>{label}</strong> :
                </span>
            )}
            <span className={classes.textBox}>{text}</span>
            <Button iconId="ri-file-copy-line" priority="tertiary no outline" title={title} onClick={copyToClipboard} disabled={disabled} />
            {children}
        </div>
    );
};

TextCopyToClipboard.displayName = symToStr({ TextCopyToClipboard });

export default memo(TextCopyToClipboard);

const useStyles = tss
    .withName(TextCopyToClipboard.displayName)
    .withParams<{ disabled: boolean }>()
    .create(({ disabled }) => ({
        root: {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            position: "relative",
            gap: fr.spacing("2v"),
            flexWrap: "nowrap",
            alignItems: "center",
        },
        textBox: {
            display: "block",
            flex: "1",
            borderRadius: "0.25rem 0.25rem 0 0",
            color: disabled ? fr.colors.decisions.text.disabled.grey.default : fr.colors.decisions.text.default.grey.default,
            userSelect: disabled ? "none" : "auto",
            cursor: disabled ? "not-allowed" : "auto",
            overflow: disabled ? "hidden" : "auto",
            backgroundColor: disabled ? fr.colors.decisions.background.disabled.grey.default : fr.colors.decisions.background.alt.blueFrance.default,
            padding: fr.spacing("2v"),
            whiteSpace: "pre",
        },
    }));
