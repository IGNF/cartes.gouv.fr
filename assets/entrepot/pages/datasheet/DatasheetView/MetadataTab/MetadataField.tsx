import { fr } from "@codegouvfr/react-dsfr";
import { CSSProperties, FC, ReactNode } from "react";
import "react-dsfr-tiptap/index.css";

import MarkdownRenderer from "../../../../../components/Utils/MarkdownRenderer";

type MetadataFieldProps = {
    title?: ReactNode;
    content: string | ReactNode;
    hintText?: ReactNode;
    markdown?: boolean;
};

const customStyle: CSSProperties = {
    backgroundColor: fr.colors.decisions.background.default.grey.default,
    color: fr.colors.decisions.text.default.grey.default,
    borderRadius: `${fr.spacing("1v")} ${fr.spacing("1v")} 0 0`,
    boxShadow: `inset 0 -2px 0 0 var(${fr.colors.decisions.border.plain.grey.default})`,
    marginTop: fr.spacing("1v"),
    fontFamily: "Marianne, arial, sans-serif",
    padding: "10px 20px",
};

const MetadataField: FC<MetadataFieldProps> = ({ title, content, hintText, markdown }) => {
    return (
        <div className={fr.cx("fr-mb-3w")}>
            {title && (
                <>
                    <p className={fr.cx("fr-m-0", "fr-text--lg")}>
                        <strong>{title}</strong>
                    </p>
                    {hintText && <p className={fr.cx("fr-m-0", "fr-text--sm", "fr-text--light")}>{hintText}</p>}
                </>
            )}

            {markdown && typeof content === "string" ? (
                <MarkdownRenderer content={content} style={customStyle} />
            ) : typeof content === "string" ? (
                <p className={fr.cx("fr-m-0")}>{content}</p>
            ) : (
                content
            )}
        </div>
    );
};

export default MetadataField;
