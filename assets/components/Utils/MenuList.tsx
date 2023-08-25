import Button, { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Divider, Menu, MenuItem } from "@mui/material";
import Typography from "@mui/material/Typography";
import { FC, MouseEvent, useId, useState } from "react";
import { symToStr } from "tsafe/symToStr";

type MenuListProps = {
    menuOpenButtonProps?: Omit<ButtonProps, "linkProps" | "onClick" | "type">;
};

const MenuList: FC<MenuListProps> = ({ menuOpenButtonProps }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const otherActionsBtnId = useId();
    const otherActionsMenuId = useId();

    const handleBtnOpenClick = (e: MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // props du bouton ouvrir menu
    const _menuOpenBtnProps: ButtonProps = menuOpenButtonProps ? { ...(menuOpenButtonProps as ButtonProps) } : ({} as ButtonProps);
    _menuOpenBtnProps.title = menuOpenButtonProps?.title ?? "Autres actions";
    _menuOpenBtnProps.iconId = menuOpenButtonProps?.iconId ?? "fr-icon-menu-2-fill";
    _menuOpenBtnProps.nativeButtonProps = {
        ...(menuOpenButtonProps?.nativeButtonProps ?? {}),
        "aria-controls": open ? otherActionsMenuId : undefined,
        "aria-haspopup": "true",
        "aria-expanded": open ? "true" : undefined,
    };
    _menuOpenBtnProps.id = otherActionsBtnId;
    _menuOpenBtnProps.onClick = handleBtnOpenClick;
    _menuOpenBtnProps.type = "button";

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
                    open={open}
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
                    <MenuItem onClick={handleClose}>
                        <Typography noWrap> Action 1</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Typography noWrap> Action 2</Typography>
                    </MenuItem>
                    <Divider
                        sx={{
                            mb: 0.1,
                        }}
                    />
                    <MenuItem onClick={handleClose}>
                        <Typography noWrap> Actionnnnnnnnnnnnn 3</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Typography noWrap> Actionnnnnnnnnnnnnnnnnnnnnn 4</Typography>
                    </MenuItem>
                </Menu>
            </MuiDsfrThemeProvider>
        </>
    );
};

MenuList.displayName = symToStr({ MenuList });

export default MenuList;
