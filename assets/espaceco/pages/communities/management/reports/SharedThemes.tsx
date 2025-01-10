import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { CSSProperties, FC } from "react";
import { UseFormReturn } from "react-hook-form";

import { ReportFormType } from "../../../../../@types/app_espaceco";
import { SharedThemesDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { SetSharedThemesDialog, SetSharedThemesDialogModal, SharedThemesType, UserSharedThemesType } from "./SetSharedThemesDialog";

type SharedThemesProps = {
    form: UseFormReturn<ReportFormType>;
    userSharedThemes: UserSharedThemesType;
};

const style: CSSProperties = {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
};

const SharedThemes: FC<SharedThemesProps> = ({ form, userSharedThemes }) => {
    const { t: tmc } = useTranslation("ManageCommunity");
    const { t } = useTranslation("SharedThemes");

    const { watch, setValue: setFormValue } = form;
    const sharedThemes = watch("shared_themes") ?? [];

    const workingSharedThemes: SharedThemesType = {};
    sharedThemes.forEach((st) => (workingSharedThemes[st.community_id] = st.themes));

    const handleRemoveCommunity = (communityId: number) => {
        const v = sharedThemes.filter((st) => st.community_id !== communityId);
        setFormValue("shared_themes", v);
    };

    const handleRemoveTheme = (communityId: number, theme: string) => {
        const result: SharedThemesDTO[] = [];
        sharedThemes.forEach((st) => {
            if (st.community_id === communityId) {
                const shTheme = { ...st, themes: st.themes.filter((th) => th !== theme) };
                if (shTheme.themes.length) {
                    result.push(shTheme);
                }
            } else result.push(st);
        });
        setFormValue("shared_themes", result);
    };

    return (
        <div className={fr.cx("fr-mt-2w")}>
            <h3>{tmc("report.configure_shared_themes")}</h3>
            <span className={fr.cx("fr-hint-text")}>{tmc("report.configure_shared_themes.explain")}</span>
            <div className={fr.cx("fr-mt-2v")}>
                <Button
                    className={fr.cx("fr-my-2v")}
                    iconId={"ri-settings-2-line"}
                    iconPosition={"left"}
                    size="small"
                    onClick={() => SetSharedThemesDialogModal.open()}
                >
                    {t("manage")}
                </Button>
                {sharedThemes?.map((st) => (
                    <div key={st.community_id}>
                        <div className={fr.cx("fr-grid-row", "fr-p-2v")} style={style}>
                            <div className={fr.cx("fr-col-10")}>{st.community_name}</div>
                            <div className={fr.cx("fr-col-2")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                    <Button
                                        title={t("delete_community", { text: st.community_name })}
                                        className={fr.cx("fr-ml-2v")}
                                        priority="secondary"
                                        iconId="fr-icon-delete-line"
                                        size="small"
                                        onClick={() => handleRemoveCommunity(st.community_id)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={fr.cx("fr-grid-row")}>
                            <div className={fr.cx("fr-col-offset-1", "fr-col-11")}>
                                <ul className={fr.cx("fr-raw-list")}>
                                    {st.themes.map((theme) => (
                                        <li key={theme}>
                                            <div className={fr.cx("fr-grid-row", "fr-my-2v", "fr-px-2v")}>
                                                <div className={fr.cx("fr-col-10")}>{theme}</div>
                                                <div className={fr.cx("fr-col-2")}>
                                                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                                        <Button
                                                            title={t("delete_theme", { text: theme })}
                                                            className={fr.cx("fr-ml-2v")}
                                                            priority="secondary"
                                                            iconId="fr-icon-delete-line"
                                                            size="small"
                                                            onClick={() => handleRemoveTheme(st.community_id, theme)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {workingSharedThemes && (
                <SetSharedThemesDialog
                    sharedThemes={workingSharedThemes}
                    userSharedThemes={userSharedThemes}
                    onApply={(sharedThemes) => setFormValue("shared_themes", sharedThemes)}
                />
            )}
        </div>
    );
};

export default SharedThemes;
