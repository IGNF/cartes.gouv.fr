import { fr } from "@codegouvfr/react-dsfr";
import { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { ReactNode } from "react";
import { tss } from "tss-react";

interface DataCardProps {
    name: ReactNode;
    type: ReactNode;
    size?: ReactNode;
    buttons?: (ButtonProps | null | undefined | false)[];
}
export default function DataCard(props: DataCardProps) {
    const { name, type, size, buttons } = props;

    const { classes, cx } = useStyles();
    const _buttons = buttons?.filter((btn): btn is ButtonProps => Boolean(btn));

    return (
        <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-1v", "fr-m-0", "fr-my-4v"), classes.row)}>
            <div className={cx(fr.cx("fr-col"), classes.colInfo)}>
                <div className={classes.name}>
                    <strong>{name}</strong>
                </div>
                <div className={cx(fr.cx("fr-text--xs", "fr-m-0", "fr-mb-3v"), classes.type)}>{type}</div>
                {size && (
                    <ul className={fr.cx("fr-tags-group")}>
                        <li>
                            <Tag small>{size}</Tag>
                        </li>
                    </ul>
                )}
            </div>
            {_buttons && isNonEmptyButtonsArray(_buttons) && (
                <div className={cx(fr.cx("fr-col", "fr-col--bottom"), classes.colButtons)}>
                    <ButtonsGroup buttons={_buttons} buttonsSize="small" buttonsIconPosition="right" inlineLayoutWhen="md and up" />
                </div>
            )}
        </div>
    );
}

function isNonEmptyButtonsArray(buttons: (ButtonProps | null | undefined | false)[]): buttons is [ButtonProps, ...ButtonProps[]] {
    return buttons.length > 0;
}

const useStyles = tss.withName("DataCard").create({
    row: {
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        borderRadius: fr.spacing("1v"),
    },
    colInfo: {
        display: "flex",
        flex: "1 1 auto",
        flexDirection: "column",
        marginBottom: "-1rem",
    },
    name: {
        color: fr.colors.decisions.text.title.blueFrance.default,
        wordBreak: "break-all",
    },
    type: {
        color: fr.colors.decisions.text.mention.grey.default,
    },
    colButtons: {
        display: "flex",
        flex: "1 0 auto",
        justifyContent: "flex-end",
        marginBottom: "-1rem",
    },
});
