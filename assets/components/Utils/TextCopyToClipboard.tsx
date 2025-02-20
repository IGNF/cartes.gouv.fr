import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input, { InputProps } from "@codegouvfr/react-dsfr/Input";
import { FC, memo } from "react";
import { symToStr } from "tsafe/symToStr";
import { tss } from "tss-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useTranslation } from "@/i18n";

interface TextCopyToClipboardProps extends InputProps.Common {
    disabled?: boolean;
    nativeInputProps?: InputProps.RegularInput["nativeInputProps"];
    nativeTextAreaProps?: InputProps.TextArea["nativeTextAreaProps"];
    text: string;
    textArea?: boolean;
    title?: string;
}

const TextCopyToClipboard: FC<TextCopyToClipboardProps> = (props) => {
    const { t } = useTranslation("Common");
    const { disabled = false, label, nativeInputProps, nativeTextAreaProps, text, textArea, title = t("copy_to_clipboard"), ...inputProps } = props;
    const { classes } = useStyles({ disabled });
    const { copied, copy } = useCopyToClipboard();

    return (
        <Input
            {...inputProps}
            {...(textArea
                ? {
                      textArea: true,
                      nativeTextAreaProps: {
                          ...nativeTextAreaProps,
                          readOnly: true,
                          value: text,
                      },
                  }
                : {
                      textArea: false,
                      nativeInputProps: {
                          ...nativeInputProps,
                          readOnly: true,
                          value: text,
                      },
                  })}
            label={
                <div className={classes.label}>
                    {label}
                    <Button
                        className={classes.button}
                        disabled={disabled}
                        iconId={copied ? "fr-icon-check-line" : "ri-file-copy-line"}
                        iconPosition="right"
                        priority="tertiary"
                        title={title}
                        onClick={() => copy(text)}
                    >
                        <span>{copied ? t("alert_copied") : t("copy")}</span>
                    </Button>
                </div>
            }
            disabled={disabled}
        />
    );
};

TextCopyToClipboard.displayName = symToStr({ TextCopyToClipboard });

export default memo(TextCopyToClipboard);

const useStyles = tss.withName(TextCopyToClipboard.displayName).create(() => ({
    label: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    button: {
        [fr.breakpoints.down("lg")]: {
            maxWidth: "2.5rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            "& span": {
                display: "none",
            },
            "&::after": {
                "--icon-size": "1.5rem  !important",
                margin: "0  !important",
            },
        },
    },
}));
