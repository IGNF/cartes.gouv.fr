import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import Button, { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { getLink, RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Menu, MenuItem } from "@mui/material";
import { MouseEvent, PropsWithChildren, useId, useState } from "react";
import { tss } from "tss-react";

type ItemCommon = PropsWithChildren<{
    iconId?: FrIconClassName | RiIconClassName;
    disabled?: boolean;
}>;

type ItemWithOnClick = {
    onClick?: React.MouseEventHandler<HTMLElement>;
    linkProps?: never;
};

type ItemWithLinkProps = {
    onClick?: never;
    linkProps?: RegisteredLinkProps;
};

export type Item = ItemCommon &
    // onClick et linkProps sont mutuellement exclusifs
    (ItemWithOnClick | ItemWithLinkProps);

type HeaderMenuProps = {
    openButtonProps: Omit<ButtonProps, "linkProps" | "onClick" | "type">;
    actionButtonProps?: ButtonProps;
    items: Item[];
    disabled?: boolean;
};
export default function HeaderMenu({ openButtonProps: openButtonProps, actionButtonProps, items, disabled }: HeaderMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    const openBtnId = useId();
    const menuId = useId();

    const handleBtnOpenClick = (e: MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
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
                disabled={disabled}
            >
                {openButtonProps.children}
                <span className={fr.cx(isMenuOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line", "fr-ml-2v")} aria-hidden="true" />
            </Button>
            <MuiDsfrThemeProvider>
                <Menu
                    id={menuId}
                    slotProps={{
                        list: {
                            "aria-labelledby": openBtnId,
                            className: cx(classes.list, classes.noMarginPadding),
                        },
                        root: {
                            className: classes.noMarginPadding,
                        },
                        paper: {
                            className: cx(classes.paper, classes.noMarginPadding),
                        },
                    }}
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleClose}
                    elevation={0}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    {items.map(({ onClick, linkProps, disabled, iconId, children }, i) => {
                        const isUnclickable = !onClick && !linkProps;
                        const itemContent = (
                            <MenuItem
                                key={i}
                                className={cx(classes.menuItem, isUnclickable && classes.menuItemUnclickable, fr.cx("fr-text--sm"))}
                                disableRipple
                                onClick={
                                    onClick
                                        ? (e: MouseEvent<HTMLElement>) => {
                                              onClick?.(e);
                                              handleClose();
                                          }
                                        : undefined
                                }
                                disabled={disabled}
                            >
                                {iconId && <span className={fr.cx("fr-icon--sm", iconId)} />}
                                {children}
                            </MenuItem>
                        );

                        if (linkProps && !disabled) {
                            return (
                                <Link key={i} {...linkProps}>
                                    {itemContent}
                                </Link>
                            );
                        }

                        return itemContent;
                    })}

                    {actionButtonProps !== undefined && (
                        <Button
                            {...actionButtonProps}
                            priority="tertiary"
                            className={cx(classes.actionButton, fr.cx("fr-m-4v"), actionButtonProps.className)}
                        />
                    )}
                </Menu>
            </MuiDsfrThemeProvider>
        </>
    );
}

const useStyles = tss.withName({ HeaderMenu }).create({
    noMarginPadding: {
        padding: 0,
        margin: 0,
    },
    paper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        filter: "drop-shadow(var(--overlap-shadow))",
    },
    list: {
        width: "18rem",
    },
    menuItem: {
        display: "flex",
        gap: fr.spacing("2v"),
        padding: `${fr.spacing("3v")} ${fr.spacing("4v")}`,
        backgroundColor: "white",
        boxShadow: `0 -1px 0 0 ${fr.colors.decisions.border.default.grey.default}`,
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
    },
    actionButton: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
    },
});
