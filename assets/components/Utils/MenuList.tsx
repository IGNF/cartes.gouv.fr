import { fr, type FrIconClassName, type RiIconClassName } from "@codegouvfr/react-dsfr";
import Button, { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import Typography from "@mui/material/Typography";
import { FC, memo, MouseEvent, useId, useMemo, useState } from "react";
import { symToStr } from "tsafe/symToStr";

type MenuListItemCommon = {
    disabled?: boolean;
    text: string;
    iconId?: FrIconClassName | RiIconClassName;
};

type MenuListItemWithOnClick = {
    onClick: React.MouseEventHandler<HTMLElement>;
    linkProps?: never;
};

type MenuListItemWithLinkProps = {
    onClick?: never;
    linkProps: RegisteredLinkProps;
};

type MenuListItem = MenuListItemCommon &
    // onClick et linkProps sont mutuellement exclusifs
    (MenuListItemWithOnClick | MenuListItemWithLinkProps);

type MenuListProps = {
    menuOpenButtonProps?: Omit<ButtonProps, "linkProps" | "onClick" | "type" | "disabled">;
    items: MenuListItem[];
    disabled?: boolean;
};

const MenuList: FC<MenuListProps> = ({ menuOpenButtonProps, items = [], disabled = false }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    const otherActionsBtnId = useId();
    const otherActionsMenuId = useId();

    const handleBtnOpenClick = (e: MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // props du bouton ouvrir menu
    const _menuOpenBtnProps = useMemo<ButtonProps>(() => {
        const _props: ButtonProps = menuOpenButtonProps ? { ...(menuOpenButtonProps as ButtonProps) } : ({} as ButtonProps);
        _props.title = menuOpenButtonProps?.title ?? "Autres actions";
        _props.iconId = menuOpenButtonProps?.iconId ?? "fr-icon-menu-2-fill";
        _props.nativeButtonProps = {
            ...(menuOpenButtonProps?.nativeButtonProps ?? {}),
            "aria-controls": isMenuOpen ? otherActionsMenuId : undefined,
            "aria-haspopup": "true",
            "aria-expanded": isMenuOpen ? "true" : undefined,
        };
        _props.id = otherActionsBtnId;
        _props.onClick = handleBtnOpenClick;
        _props.type = "button";
        _props.disabled = disabled;
        return _props;
    }, [menuOpenButtonProps, disabled, isMenuOpen, otherActionsBtnId, otherActionsMenuId]);

    const atLeastOneIcon = useMemo<boolean>(() => items.filter((item) => item.iconId !== undefined).length > 0, [items]);

    return (
        <>
            <Button {..._menuOpenBtnProps} />
            <MuiDsfrThemeProvider>
                <Menu
                    id={otherActionsMenuId}
                    MenuListProps={{
                        "aria-labelledby": otherActionsBtnId,
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
                    {disabled === false &&
                        items.map((item, i) => {
                            const itemContent = (
                                <MenuItem
                                    key={i}
                                    onClick={(e: MouseEvent<HTMLElement>) => {
                                        handleClose();
                                        item.onClick?.(e);
                                    }}
                                    disabled={item.disabled}
                                >
                                    {item.iconId && (
                                        <ListItemIcon>
                                            <i className={fr.cx(item.iconId)} />
                                        </ListItemIcon>
                                    )}
                                    {item.text && (
                                        <ListItemText inset={atLeastOneIcon && !item.iconId}>
                                            <Typography noWrap>{item.text}</Typography>
                                        </ListItemText>
                                    )}
                                </MenuItem>
                            );

                            if (item.linkProps && !item.disabled) {
                                return (
                                    <a key={i} {...item.linkProps}>
                                        {itemContent}
                                    </a>
                                );
                            }

                            return itemContent;
                        })}
                </Menu>
            </MuiDsfrThemeProvider>
        </>
    );
};

MenuList.displayName = symToStr({ MenuList });

export default memo(MenuList);
