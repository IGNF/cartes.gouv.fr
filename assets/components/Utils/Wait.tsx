import { fr } from "@codegouvfr/react-dsfr";
import { useColors } from "@codegouvfr/react-dsfr/useColors";
import { FC, PropsWithChildren } from "react";
import { createPortal } from "react-dom";

const Wait: FC<PropsWithChildren> = ({ children }) => {
    const theme = useColors();

    return createPortal(
        <div
            style={{
                position: "fixed",
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 1000,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.decisions.background.default.grey.default,
                    color: theme.decisions.text.default.grey.default,
                }}
            >
                <div className={fr.cx("fr-container", "fr-p-2w")}>{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Wait;
