import { FC } from "react";
import { CartesStyle } from "../../../../types/app";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { getTranslation } from "../../../../i18n/i18n";

type StyleLabelProps = {
    style: CartesStyle;
    onRemove: (name: string) => void;
};

const { t } = getTranslation("Style");

const StyleLabel: FC<StyleLabelProps> = ({ style, onRemove }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col-5")}>{style.name}</div>
            <div className={fr.cx("fr-col-7", "fr-mx-0")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button
                        title={t("remove_style")}
                        priority={"tertiary"}
                        iconId={"fr-icon-delete-line"}
                        onClick={() => {
                            onRemove(style.name);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
export default StyleLabel;
