import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { CSSProperties, FC, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ReportFormType } from "../../../../../@types/app_espaceco";
import { AttributeAutofillDTO, TableResponseDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AddThemeDialog, AddThemeDialogModal } from "./AddThemeDialog";
import AttributeList from "./AttributeList";
import { EditThemeDialog, EditThemeDialogModal } from "./EditThemeDialog";
import ThemesHelper from "./ThemesHelper";
import { AutofillDialog, AutofillDialogModal } from "./AutofillDialog";

const customStyle: CSSProperties = {
    border: "solid 1.5px",
    borderColor: fr.colors.decisions.border.actionHigh.blueFrance.default,
};

const themeStyle: CSSProperties = {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
};

type ThemeListProps = {
    form: UseFormReturn<ReportFormType>;
    tables: Partial<TableResponseDTO>[];
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
};

const ThemeList: FC<ThemeListProps> = ({ form, tables, state, stateRelatedMessage }) => {
    const { t } = useTranslation("ManageCommunity");
    const { t: tTheme } = useTranslation("Theme");

    const { watch, setValue: setFormValue } = form;
    const themes: ThemeDTO[] = watch("attributes");

    const [currentTheme, setCurrentTheme] = useState<ThemeDTO | undefined>();

    // Supression d'un theme
    const handleRemoveTheme = (theme: string) => {
        const th = ThemesHelper.removeTheme(theme, themes);
        setFormValue("attributes", th);
    };

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
            <h3>{t("report.configure_themes")}</h3>
            <span className={fr.cx("fr-hint-text")}>{t("report.configure_themes.explain")}</span>
            <div>
                <Button className={fr.cx("fr-mt-2v")} priority="secondary" size="small" onClick={() => AddThemeDialogModal.open()}>
                    {tTheme("add_theme")}
                </Button>
                {themes.map((t) => {
                    return (
                        <div key={t.theme} style={customStyle} className={fr.cx("fr-my-2v", "fr-p-1v")}>
                            <div className={fr.cx("fr-grid-row", "fr-p-2v")} style={themeStyle}>
                                <div className={fr.cx("fr-col-10")}>
                                    <span>{t.theme}</span>
                                    {t.table && (
                                        <span className={fr.cx("fr-ml-2v")}>
                                            <i className={cx(fr.cx("fr-icon--sm"), "ri-table-line")} />
                                        </span>
                                    )}
                                    {t.global === true && (
                                        <span className={fr.cx("fr-ml-2v")}>
                                            <i className={fr.cx("fr-icon-earth-line", "fr-icon--sm")} />
                                        </span>
                                    )}
                                </div>
                                <div className={fr.cx("fr-col-2")}>
                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                        {t.table && (
                                            <Button
                                                title={tTheme("configure_autofill")}
                                                priority="secondary"
                                                iconId={"ri-settings-2-line"}
                                                size={"small"}
                                                onClick={() => {
                                                    setCurrentTheme(t);
                                                    AutofillDialogModal.open();
                                                }}
                                            />
                                        )}
                                        <Button
                                            title={tTheme("modify_theme", { text: t.theme })}
                                            className={t.table ? fr.cx("fr-ml-2v") : ""}
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
                            {!t.table && <AttributeList form={form} theme={t} />}
                        </div>
                    );
                })}
            </div>
            {state !== "default" && (
                <p
                    className={fr.cx(
                        (() => {
                            switch (state) {
                                case "error":
                                    return "fr-error-text";
                                case "success":
                                    return "fr-valid-text";
                            }
                        })()
                    )}
                >
                    {stateRelatedMessage ? stateRelatedMessage : tTheme("attributes_not_conform")}
                </p>
            )}
            <EditThemeDialog
                themes={themes}
                currentTheme={currentTheme}
                onModify={(oldName, newTheme) => {
                    const th = ThemesHelper.updateTheme(oldName, newTheme, themes);
                    setFormValue("attributes", th);
                }}
            />
            <AddThemeDialog
                themes={themes}
                tables={tables}
                onAdd={(theme) => {
                    const th = ThemesHelper.addTheme(themes, theme);
                    setFormValue("attributes", th);
                }}
            />
            <AutofillDialog
                theme={currentTheme}
                onRecord={(autofilled: AttributeAutofillDTO[]) => {
                    if (currentTheme) {
                        const th = ThemesHelper.updateTheme(currentTheme.theme, { autofilled_attributes: autofilled }, themes);
                        setFormValue("attributes", th);
                    }
                }}
            />
        </div>
    );
};

export default ThemeList;
