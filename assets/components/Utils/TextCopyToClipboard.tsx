import { fr, type FrCxArg } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";
import { tss } from "tss-react";

import { useTranslation } from "../../i18n/i18n";
import { useSnackbarStore } from "../../stores/SnackbarStore";

type TextCopyToClipboardProps = {
    text: string;
    className?: FrCxArg;
    successMessage?: string;
    disabled?: boolean;
};

const TextCopyToClipboard: FC<TextCopyToClipboardProps> = ({ text, successMessage, className, disabled = false }) => {
    const { t: tCommon } = useTranslation("Common");

    const setMessage = useSnackbarStore((state) => state.setMessage);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(text);

        setMessage(successMessage ?? tCommon("url_copied"));
    };

    const { classes, cx } = useStyles({
        disabled,
    });

    return (
        <div className={cx(classes.root, className)}>
            <span className={classes.textBox}>{text}</span>
            <Button
                iconId="ri-file-copy-2-line"
                priority="tertiary no outline"
                title={tCommon("copy_to_clipboard")}
                onClick={copyToClipboard}
                disabled={disabled}
            />
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
        },
        textBox: {
            display: "block",
            width: "100%",
            borderRadius: "0.25rem 0.25rem 0 0",
            color: disabled ? fr.colors.decisions.text.disabled.grey.default : fr.colors.decisions.text.default.grey.default,
            userSelect: disabled ? "none" : "auto",
            cursor: disabled ? "not-allowed" : "auto",
            overflow: disabled ? "hidden" : "auto",
            backgroundColor: disabled ? fr.colors.decisions.background.disabled.grey.default : fr.colors.decisions.background.alt.blueFrance.default,
            padding: fr.spacing("2v"),
            whiteSpace: "nowrap",
        },
    }));
