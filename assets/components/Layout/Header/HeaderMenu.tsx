import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import Button, { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { getLink, RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { ClickAwayListener, Grow, Paper, Popper } from "@mui/material";
import { MouseEvent, PropsWithChildren, useId, useState } from "react";
import { tss } from "tss-react";

type Item = PropsWithChildren<{
    iconId?: FrIconClassName | RiIconClassName;
    linkProps?: RegisteredLinkProps;
}>;

type HeaderMenuProps = {
    openButtonProps: Omit<ButtonProps, "linkProps" | "onClick" | "type">;
    actionButtonProps?: ButtonProps;
    items?: Item[];
    disabled?: boolean;
};
export default function HeaderMenu({ openButtonProps, actionButtonProps, items, disabled }: HeaderMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    const openBtnId = useId();
    const menuId = useId();

    const handleBtnOpenClick = (e: MouseEvent<HTMLElement>) => {
        if (anchorEl) {
            setAnchorEl(null);
        } else {
            setAnchorEl(e.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const { classes, cx } = useStyles();

    const { Link } = getLink();

    return (
        <>
            <Button
                {...openButtonProps}
                iconId={openButtonProps?.iconId ?? "fr-icon-menu-2-fill"}
                nativeButtonProps={{
                    ...(openButtonProps?.nativeButtonProps ?? {}),
                    "aria-controls": isMenuOpen ? menuId : undefined,
                    "aria-haspopup": "true",
                    "aria-expanded": isMenuOpen ? "true" : undefined,
                }}
                className={cx(classes.openButton, fr.cx("fr-text--sm"), openButtonProps?.className)}
                id={openBtnId}
                onClick={handleBtnOpenClick}
                type="button"
                size="small"
                disabled={disabled}
            >
                {openButtonProps.children}
                <span className={fr.cx("fr-icon--sm", "ri-arrow-down-s-line", "fr-ml-2v")} aria-hidden="true" />
            </Button>
            <MuiDsfrThemeProvider>
                <Popper open={isMenuOpen} anchorEl={anchorEl} placement="bottom-end" disablePortal={false} sx={{ zIndex: 1500 }} transition={true}>
                    {({ TransitionProps }) => (
                        <ClickAwayListener onClickAway={handleClose}>
                            <Grow {...TransitionProps} style={{ transformOrigin: "top right" }}>
                                <Paper className={cx(classes.paper)}>
                                    <ul className={cx(fr.cx("fr-raw-list"))}>
                                        {items?.map(({ linkProps, iconId, children }, i) => {
                                            const content = (
                                                <>
                                                    {iconId && <span className={fr.cx("fr-icon--sm", iconId)} />}
                                                    {children}
                                                </>
                                            );

                                            const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                                                handleClose();
                                                linkProps?.onClick?.(e);
                                            };

                                            return (
                                                <li key={i} className={cx(classes.menuItem, !linkProps && classes.menuItemUnclickable)}>
                                                    {linkProps ? (
                                                        <Link {...linkProps} className={cx(fr.cx("fr-text--sm"))} onClick={handleLinkClick}>
                                                            {content}
                                                        </Link>
                                                    ) : (
                                                        <span className={cx(fr.cx("fr-text--sm"))}>{content}</span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {actionButtonProps !== undefined && (
                                        <Button
                                            {...actionButtonProps}
                                            priority="tertiary"
                                            size="small"
                                            className={cx(classes.actionButton, fr.cx("fr-m-4v"), actionButtonProps.className)}
                                        />
                                    )}
                                </Paper>
                            </Grow>
                        </ClickAwayListener>
                    )}
                </Popper>
            </MuiDsfrThemeProvider>
        </>
    );
}

const useStyles = tss.withName({ HeaderMenu }).create({
    paper: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        filter: "drop-shadow(var(--overlap-shadow))",
        width: "18rem",
    },
    menuItem: {
        boxShadow: `0 -1px 0 0 ${fr.colors.decisions.border.default.grey.default}`,
        padding: 0,
        margin: 0,

        "&:hover": {
            backgroundColor: fr.colors.decisions.background.default.grey.hover,
        },

        "& a, & div": {
            display: "flex",
            gap: fr.spacing("2v"),
            margin: 0,
            padding: `${fr.spacing("3v")} ${fr.spacing("4v")}`,
            textDecoration: "none",
            boxShadow: "none",
            backgroundImage: "none",
        },
        "& a": {
            alignItems: "center",
        },
        "& a::after": {
            marginLeft: "auto",
        },
    },
    menuItemUnclickable: {
        cursor: "default",
        "&:hover": {
            backgroundColor: fr.colors.decisions.background.default.grey.default,
        },
    },
    openButton: {
        '&[aria-expanded="true"]': {
            backgroundColor: fr.colors.decisions.background.open.blueFrance.default,
        },
        "& span": {
            transition: "transform 0.3s",
        },
        '&[aria-expanded="true"] span': {
            transform: "rotate(-180deg)",
        },
    },
    actionButton: {
        width: "auto",
        display: "flex",
        justifyContent: "center",
    },
});
