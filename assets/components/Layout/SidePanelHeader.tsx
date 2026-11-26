import { fr, type FrIconClassName, type RiIconClassName } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { tss } from "tss-react";

type SidePanelHeaderProps = {
    iconId: FrIconClassName | RiIconClassName;
    title: string;
    description: string;
};

export default function SidePanelHeader({ iconId, title, description }: SidePanelHeaderProps) {
    const { classes } = useStyles();

    return (
        <div className={classes.root}>
            <div className={classes.titleRow}>
                <span className={fr.cx(iconId, "fr-icon--md")} aria-hidden="true" />
                <h1 className={fr.cx("fr-text--xl", "fr-m-0")}>{title}</h1>
            </div>
            <p className={cx(fr.cx("fr-text--xs", "fr-mb-4v"), classes.description)}>{description}</p>
        </div>
    );
}

const useStyles = tss.withName({ SidePanelHeader }).create({
    root: {
        margin: `${fr.spacing("6v")} ${fr.spacing("8v")} ${fr.spacing("4v")} 0`,
        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    },
    titleRow: {
        display: "flex",
        gap: fr.spacing("2v"),
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "stretch",
    },
    description: {
        color: fr.colors.decisions.text.mention.grey.default,
        fontWeight: "normal",
    },
});
