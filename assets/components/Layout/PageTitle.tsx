import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup, { ButtonsGroupProps } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { ReactNode } from "react";
import { useStyles } from "tss-react";

interface IPageTitleProps {
    buttons?: ButtonsGroupProps.Common["buttons"];
    children?: ReactNode;
    showButtons?: boolean;
    title: ReactNode;
}

function PageTitle(props: IPageTitleProps) {
    const { buttons, children, showButtons, title } = props;
    const { css } = useStyles();

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={fr.cx("fr-col-12", buttons && "fr-col-lg-8")}>
                <h1
                    className={css({
                        color: fr.colors.decisions.text.title.blueFrance.default,
                    })}
                >
                    {title}
                </h1>
                {children}
            </div>
            <div
                className={fr.cx("fr-col-12", "fr-col-lg-4", "fr-col--top")}
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {showButtons && buttons && (
                    <div
                        className={css({
                            marginLeft: "inherit",
                            [fr.breakpoints.up("lg")]: {
                                marginLeft: "auto",
                            },
                        })}
                    >
                        <ButtonsGroup buttons={buttons} inlineLayoutWhen="sm and up" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PageTitle;
