import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { FC, useCallback, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { ReportFormType } from "../../../../../@types/app_espaceco";
import { ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AddAttributeDialog } from "./AddAttributeDialog";
import EditAttributeDialog from "./EditAttributeDialog";
import ThemesHelper from "./ThemesHelper";

type AttributeListProps = {
    form: UseFormReturn<ReportFormType>;
    theme: ThemeDTO;
};

const AttributeList: FC<AttributeListProps> = ({ form, theme }) => {
    const { t } = useTranslation("Theme");

    const { watch, setValue: setFormValue } = form;
    const themes: ThemeDTO[] = watch("attributes");

    // Suppression d'un attribut de theme
    const handleRemoveAttribute = (attribute: string) => {
        const tm = ThemesHelper.removeAttribute(theme.theme, attribute, themes);
        setFormValue("attributes", tm);
    };

    const AddAttributeDialogModal: ReturnType<typeof createModal> = useMemo(
        () =>
            createModal({
                id: `add-attribute-${uuidv4()}`,
                isOpenedByDefault: false,
            }),
        []
    );

    const getEditModal = useCallback((): ReturnType<typeof createModal> => {
        return createModal({
            id: `edit-attribute-${uuidv4()}`,
            isOpenedByDefault: false,
        });
    }, []);

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={fr.cx("fr-col-offset-1", "fr-col-11")}>
                <ul className={fr.cx("fr-raw-list")}>
                    {theme?.attributes.map((a) => {
                        const modal = getEditModal();

                        return (
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
                                                    modal.open();
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
                                <EditAttributeDialog
                                    modal={modal}
                                    theme={theme}
                                    attribute={a}
                                    onModify={(newAttribute) => {
                                        const tm = ThemesHelper.updateAttribute(theme.theme, a.name, newAttribute, themes);
                                        setFormValue("attributes", tm);
                                    }}
                                />
                            </li>
                        );
                    })}
                </ul>
                {/* Pas d'ajout d'attributs pour les thèmes liés à des tables */}
                {!theme.table && (
                    <Button className={fr.cx("fr-mt-2v")} priority="secondary" size="small" onClick={() => AddAttributeDialogModal.open()}>
                        {t("add_attribute")}
                    </Button>
                )}
            </div>
            <AddAttributeDialog
                modal={AddAttributeDialogModal}
                attributes={theme.attributes}
                onAdd={(attribute) => {
                    const tm = ThemesHelper.addAttribute(theme.theme, attribute, themes);
                    setFormValue("attributes", tm);
                }}
            />
        </div>
    );
};

export default AttributeList;
