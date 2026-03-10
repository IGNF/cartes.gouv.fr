import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup, { ButtonsGroupProps } from "@codegouvfr/react-dsfr/ButtonsGroup";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { ReactNode } from "react";

interface DataCardProps {
    name: ReactNode;
    type: ReactNode;
    size?: ReactNode;
    tags?: ReactNode;
    buttons?: ButtonsGroupProps["buttons"];
}
export default function DataCard(props: DataCardProps) {
    const { name, type, size, buttons, tags } = props;

    return (
        <div
            className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-p-1v", "fr-m-0", "fr-my-4v")}
            style={{
                border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                borderRadius: fr.spacing("1v"),
            }}
        >
            <div
                className={fr.cx("fr-col")}
                style={{
                    display: "flex",
                    flex: "1 1 auto",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        color: fr.colors.decisions.text.title.blueFrance.default,
                    }}
                >
                    <strong>{name}</strong>
                </div>
                <div
                    className={fr.cx("fr-text--xs", "fr-m-0", "fr-mb-3v")}
                    style={{
                        color: fr.colors.decisions.text.mention.grey.default,
                    }}
                >
                    {type}
                </div>
                {(size || tags) && (
                    <div className={fr.cx("fr-tags-group")}>
                        {size && <Tag small>{size}</Tag>}
                        {tags}
                    </div>
                )}
            </div>
            <div
                className={fr.cx("fr-col", "fr-col--bottom")}
                style={{
                    display: "flex",
                    flex: "0 0 auto",
                    justifyContent: "flex-end",
                }}
            >
                {buttons && <ButtonsGroup buttons={buttons} buttonsSize="small" inlineLayoutWhen="md and up" />}
            </div>
        </div>
    );
}
