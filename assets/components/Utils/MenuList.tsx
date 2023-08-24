import Button, { ButtonProps as DsfrButtonProps } from "@codegouvfr/react-dsfr/Button";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { Divider, Menu, MenuItem } from "@mui/material";
import React, { FC, MouseEvent, useId, useState } from "react";
import { symToStr } from "tsafe/symToStr";
import Typography from "@mui/material/Typography";

type MenuListProps = {
    menuOpenButtonProps: typeof Button;
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

    return (
        <>
            <Button
                // {...menuOpenButtonProps}
                iconId="fr-icon-menu-2-fill"
                title="Autres actions"
                onClick={handleBtnOpenClick}
                id={otherActionsBtnId}
                nativeButtonProps={{
                    "aria-controls": open ? otherActionsMenuId : undefined,
                    "aria-haspopup": "true",
                    "aria-expanded": open ? "true" : undefined,
                }}
                // eslint-disable-next-line react/no-children-prop
                children="ssdqsd"
            />
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
