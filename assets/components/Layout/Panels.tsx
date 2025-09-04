import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import React, { Key, useState } from "react";
import { tss } from "tss-react";

interface PanelProps {
    title: string;
    titleAs?: `h${2 | 3 | 4 | 5 | 6}`;
    iconId?: FrIconClassName | RiIconClassName;
    children: React.ReactNode;
    className?: string;
    key?: Key;
    expandable?: boolean;
    expandBtnPosition?: "left" | "right";
}

interface PanelsProps {
    panels: PanelProps[];
}

function Panels(props: PanelsProps) {
    const { panels } = props;

    const { classes, cx } = useStyles();

    const [enlargedPanel, setEnlargedPanel] = useState<React.Key | undefined>(undefined);

    // ri-expand-left-fill
    // ri-expand-right-fill

    return (
        <div className={cx(fr.cx("fr-grid-row"), classes.root)}>
            {panels.map(({ key, children, title, titleAs: HtmlTitleTag = "h2", iconId, className, expandable = false, expandBtnPosition = "right" }, i) => {
                const showContent = enlargedPanel === undefined || key === enlargedPanel;
                return (
                    <div
                        key={key ?? i}
                        className={cx(
                            classes.panel,
                            enlargedPanel === undefined
                                ? [fr.cx("fr-col-12"), className]
                                : key === enlargedPanel
                                  ? classes.panelEnlarged
                                  : classes.panelNotEnlarged
                        )}
                    >
                        <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-text--lg"), classes.heading)}>
                            {iconId && <i className={cx(fr.cx("fr-mr-1v"), iconId)} />}
                            {showContent && <HtmlTitleTag className={fr.cx("fr-text--lg", "fr-m-0")}>{title}</HtmlTitleTag>}

                            {expandBtnPosition === "right" && Boolean(key) && expandable && (
                                <Button
                                    iconId="ri-expand-right-fill"
                                    title="Elargir"
                                    size="small"
                                    priority="tertiary no outline"
                                    onClick={() => setEnlargedPanel(enlargedPanel ? undefined : key)}
                                />
                            )}
                        </div>
                        {showContent && <div className={classes.content}>{children}</div>}
                    </div>
                );
            })}
        </div>
    );
}

export default Panels;

const useStyles = tss.create(() => ({
    root: {
        borderRadius: "2px",
        // border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    },
    panel: {
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    },
    panelEnlarged: {
        flex: 1,
        maxWidth: "100%",
    },
    panelNotEnlarged: {
        flex: "0 0 auto",
        maxWidth: "50%",
    },
    heading: {
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
        padding: fr.spacing("2v"),
    },
    content: {
        padding: fr.spacing("4v"),
    },
}));
