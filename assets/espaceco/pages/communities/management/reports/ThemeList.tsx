import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { CSSProperties, FC, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { TableResponseDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AddThemeDialog, AddThemeDialogModal } from "./AddThemeDialog";
import { EditThemeDialog, EditThemeDialogModal } from "./EditThemeDialog";
import normalizeTheme from "./ThemeUtils";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

const customStyle: CSSProperties = {
    border: "solid 1.5px",
    borderColor: fr.colors.decisions.border.actionHigh.blueFrance.default,
};

const themeStyle: CSSProperties = {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
};

type ThemeListProps = {
    form: UseFormReturn;
    tables: Partial<TableResponseDTO>[];
};

const ThemeList: FC<ThemeListProps> = ({ form, tables }) => {
    const { t } = useTranslation("ManageCommunity");
    const { t: tTheme } = useTranslation("Theme");

    const { watch, setValue: setFormValue, getValues: getFormValues } = form;
    const attributes: ThemeDTO[] = watch("attributes");

    const [currentTheme, setCurrentTheme] = useState<ThemeDTO>();

    // Supression d'un theme
    const handleRemoveTheme = (theme: string) => {
        const a = attributes.filter((a) => a.theme !== theme);
        setFormValue("attributes", a);
    };

    // Suppression d'un attribut de theme
    const handleRemoveAttribute = (theme: string, attribute: string) => {
        const a = Array.from(attributes, (t) => {
            if (t.theme === theme) {
                const attr = t.attributes.filter((a) => a.name !== attribute);
                return { ...t, attributes: attr };
            }
            return t;
        });
        setFormValue("attributes", a);
    };

    return (
        <div>
            <h3>{t("report.configure_themes")}</h3>
            <span className={fr.cx("fr-hint-text")}>{t("report.configure_themes.explain")}</span>
            <div>
                <Button className={fr.cx("fr-mt-2v")} size="small" onClick={() => AddThemeDialogModal.open()}>
                    {tTheme("add_theme")}
                </Button>
                {attributes.map((t) => (
                    <div key={t.theme} style={customStyle} className={fr.cx("fr-my-2v", "fr-p-1v")}>
                        <div className={fr.cx("fr-grid-row", "fr-p-2v")} style={themeStyle}>
                            <div className={fr.cx("fr-col-10")}>
                                <span>{t.theme}</span>
                                {t.table && (
                                    <span className={fr.cx("fr-ml-2v")}>
                                        <i className={cx(fr.cx("fr-icon--sm"), "ri-table-line")} />
                                    </span>
                                )}
                                {t.global !== undefined && t.global === true && (
                                    <span className={fr.cx("fr-ml-2v")}>
                                        <i className={fr.cx("fr-icon-earth-line", "fr-icon--sm")} />
                                    </span>
                                )}
                            </div>
                            <div className={fr.cx("fr-col-2")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                    <Button
                                        title={tTheme("modify_theme", { text: t.theme })}
                                        priority="secondary"
                                        iconId="fr-icon-edit-line"
                                        size="small"
                                        onClick={() => {
                                            setCurrentTheme(t);
                                            EditThemeDialogModal.open();
                                        }}
                                    />
                                    <Button
                                        title={tTheme("delete_theme", { text: t.theme })}
                                        className={fr.cx("fr-ml-2v")}
                                        priority="secondary"
                                        iconId="fr-icon-delete-line"
                                        size="small"
                                        onClick={() => handleRemoveTheme(t.theme)}
                                    />
                                </div>
                            </div>
                        </div>
                        {t.table === undefined && (
                            <div className={fr.cx("fr-grid-row")}>
                                <div className={fr.cx("fr-col-offset-1", "fr-col-11")}>
                                    <ul className={fr.cx("fr-raw-list")}>
                                        {t.attributes.map((a) => (
                                            <li key={a.name}>
                                                <div className={fr.cx("fr-grid-row", "fr-my-2v", "fr-px-2v")}>
                                                    <div className={fr.cx("fr-col-10")}>{a.name}</div>
                                                    <div className={fr.cx("fr-col-2")}>
                                                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                                            <Button
                                                                title={tTheme("modify_attribute", { text: a.name })}
                                                                priority="secondary"
                                                                iconId="fr-icon-edit-line"
                                                                size="small"
                                                                onClick={() => {
                                                                    setCurrentTheme(t);
                                                                    EditThemeDialogModal.open();
                                                                }}
                                                            />
                                                            <Button
                                                                title={tTheme("delete_attribute", { text: a.name })}
                                                                className={fr.cx("fr-ml-2v")}
                                                                priority="secondary"
                                                                iconId="fr-icon-delete-line"
                                                                size="small"
                                                                onClick={() => handleRemoveAttribute(t.theme, a.name)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button size="small" onClick={() => console.log("CLICKED")}>
                                        {tTheme("add_attribute")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <AddThemeDialog
                themes={attributes}
                tables={tables}
                onAdd={(theme) => {
                    const attributes = getFormValues("attributes");
                    if (attributes) {
                        attributes.push(theme);
                    }
                    setFormValue("attributes", attributes);
                }}
            />
            <EditThemeDialog
                themes={attributes}
                currentTheme={currentTheme}
                // tables={tables}
                onModify={(oldName, newTheme) => {
                    const a = getFormValues("attributes").map((t) => (oldName === t.theme ? normalizeTheme({ ...t, ...newTheme }) : t));
                    setFormValue("attributes", a);
                }}
            />
        </div>
    );
};

export default ThemeList;
