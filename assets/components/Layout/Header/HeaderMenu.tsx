import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import Button, { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { getLink, RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import { keyframes } from "@emotion/react";
import { PropsWithChildren, useEffect, useId, useRef, useState } from "react";
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
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const openBtnId = useId();
    const menuId = useId();

    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const { classes, cx } = useStyles();

    const { Link } = getLink();

    return (
        <div className={classes.container} ref={containerRef}>
            <Button
                {...openButtonProps}
                iconId={openButtonProps?.iconId ?? "fr-icon-menu-2-fill"}
                nativeButtonProps={{
                    ...(openButtonProps?.nativeButtonProps ?? {}),
                    "aria-controls": isOpen ? menuId : undefined,
                    "aria-haspopup": "true",
                    "aria-expanded": isOpen ? "true" : undefined,
                }}
                className={cx(classes.openButton, fr.cx("fr-text--sm"), openButtonProps?.className)}
                id={openBtnId}
                onClick={toggleMenu}
                type="button"
                size="small"
                disabled={disabled}
            >
                {openButtonProps.children}
                <span className={fr.cx("fr-icon--sm", "ri-arrow-down-s-line", "fr-ml-2v")} aria-hidden="true" />
            </Button>

            {isOpen && (
                <div className={classes.menuPositioner}>
                    <div className={classes.paper} id={menuId}>
                        <ul className={cx(fr.cx("fr-raw-list"))}>
                            {items?.map(({ linkProps, iconId, children }, i) => {
                                const content = (
                                    <>
                                        {iconId && <span className={fr.cx("fr-icon--sm", iconId)} />}
                                        {children}
                                    </>
                                );

                                const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                                    closeMenu();
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
                    </div>
                </div>
            )}
        </div>
    );
}

const grow = keyframes`
    from { transform: scale(0.7); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
`;

const useStyles = tss.withName({ HeaderMenu }).create({
    container: {
        position: "relative",
        display: "inline-block",
    },
    menuPositioner: {
        position: "absolute",
        top: "100%",
        right: 0,
        zIndex: 1500,
        transformOrigin: "top right",
        animation: `${grow} 0.2s ease-out forwards`,

        [fr.breakpoints.down("lg")]: {
            position: "relative",
        },
    },
    paper: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        filter: "drop-shadow(var(--overlap-shadow))",
        width: "18rem",
        maxWidth: "calc(100vw - 2rem)",
        backgroundColor: fr.colors.decisions.background.default.grey.default,
    },
    menuItem: {
        boxShadow: `0 -1px 0 0 ${fr.colors.decisions.border.default.grey.default}`,
        padding: 0,
        margin: 0,
        maxWidth: "100%",

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

        "& span": {
            display: "flex",
        },
    },
    openButton: {
        margin: "0 !important",

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
        justifyContent: "center !important",
    },
});
