import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AddAttributeDialog, AddAttributeDialogModal } from "./AddAttributeDialog";

type AttributeListProps = {
    form: UseFormReturn;
    theme?: ThemeDTO;
};

const AttributeList: FC<AttributeListProps> = ({ form, theme }) => {
    const { t } = useTranslation("Theme");

    const { watch, setValue: setFormValue } = form;

    const themes: ThemeDTO[] = watch("attributes");

    // Suppression d'un attribut de theme
    const handleRemoveAttribute = (attribute: string) => {
        const a = Array.from(themes, (t) => {
            if (t.theme === theme?.theme) {
                const attr = t.attributes.filter((a) => a.name !== attribute);
                return { ...t, attributes: attr };
            }
            return t;
        });
        setFormValue("attributes", a);
    };

    if (!theme?.attributes.length) {
        return null;
    }

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={fr.cx("fr-col-offset-1", "fr-col-11")}>
                <ul className={fr.cx("fr-raw-list")}>
                    {theme?.attributes.map((a) => (
                        <li key={a.name}>
                            <div className={fr.cx("fr-grid-row", "fr-my-2v", "fr-px-2v")}>
                                <div className={fr.cx("fr-col-10")}>{a.name}</div>
                                <div className={fr.cx("fr-col-2")}>
                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                        <Button
                                            title={t("modify_attribute", { text: a.name })}
                                            priority="secondary"
                                            iconId="fr-icon-edit-line"
                                            size="small"
                                            onClick={() => {
                                                // TODO
                                            }}
                                        />
                                        <Button
                                            title={t("delete_attribute", { text: a.name })}
                                            className={fr.cx("fr-ml-2v")}
                                            priority="secondary"
                                            iconId="fr-icon-delete-line"
                                            size="small"
                                            onClick={() => handleRemoveAttribute(a.name)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                {/* Pas d'ajout d'attributs pour les thèmes liés à des tables */}
                {!theme.table && (
                    <Button priority="secondary" size="small" onClick={() => AddAttributeDialogModal.open()}>
                        {t("add_attribute")}
                    </Button>
                )}
            </div>
            <AddAttributeDialog attributes={theme?.attributes} onAdd={(attribute) => console.log(attribute)} />
        </div>
    );
};

export default AttributeList;
