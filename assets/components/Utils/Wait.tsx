import { fr } from "@codegouvfr/react-dsfr";
import { FC, PropsWithChildren } from "react";

const Wait: FC<PropsWithChildren> = ({ children }) => {
    return (
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
                    backgroundColor: "white",
                }}
            >
                <div className={fr.cx("fr-container", "fr-p-2w")}>{children}</div>
            </div>
        </div>
    );
};

export default Wait;
