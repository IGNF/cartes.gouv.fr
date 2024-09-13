import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";

export type EditTheme = {
    theme: string;
    table?: string;
    global?: boolean;
    help?: string;
};

const EditThemeDialogModal = createModal({
    id: "edit-theme",
    isOpenedByDefault: false,
});

type EditThemeDialogProps = {
    themes: ThemeDTO[];
    currentTheme?: ThemeDTO;
    // tables: Partial<TableResponseDTO>[];
    onModify: (oldName: string, newTheme: EditTheme) => void;
};

const EditThemeDialog: FC<EditThemeDialogProps> = ({ themes, currentTheme, onModify }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Theme");

    const themeNames: string[] = useMemo(() => {
        return Array.from(
            themes.filter((t) => t.theme !== currentTheme?.theme),
            (t) => t.theme
        );
    }, [themes, currentTheme]);

    const schema = yup.object({
        theme: yup
            .string()
            .required(t("name_mandatory_error"))
            .test("is-unique", t("name_unique_error"), (value) => !themeNames.includes(value)),
        table: yup.string(),
        help: yup.string(),
        global: yup.boolean(),
    });

    const {
        register,
        formState: { errors },
        setValue: setFormValue,
        getValues: getFormValues,
        handleSubmit,
    } = useForm<EditTheme>({
        mode: "onSubmit",
        values: {
            theme: currentTheme?.theme ?? "",
            table: currentTheme?.database ? `${currentTheme?.database}:${currentTheme?.table}` : "",
            global: currentTheme?.global === undefined ? false : currentTheme?.global,
            help: currentTheme?.help,
        },
        resolver: yupResolver(schema),
    });

    const onSubmit = () => {
        EditThemeDialogModal.close();
        if (currentTheme) {
            const values = getFormValues();
            onModify(currentTheme?.theme, values);
        }
    };

    return (
        <>
            {createPortal(
                <EditThemeDialogModal.Component
                    title={t("modify_theme", { text: currentTheme?.theme ?? "" })}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("modify"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                            priority: "primary",
                        },
                    ]}
                >
                    <div>
                        <p>{tCommon("mandatory_fields")}</p>
                        <Input
                            label={t("name")}
                            hintText={t("name_hint")}
                            state={errors.theme ? "error" : "default"}
                            stateRelatedMessage={errors?.theme?.message}
                            nativeInputProps={{
                                ...register("theme"),
                            }}
                        />
                        {currentTheme?.table ? (
                            <div />
                        ) : (
                            <ToggleSwitch
                                className={fr.cx("fr-mb-3w")}
                                helperText={t("global_hint")}
                                inputTitle={""}
                                label={t("global")}
                                showCheckedHint
                                defaultChecked={getFormValues("global")}
                                onChange={(checked) => {
                                    setFormValue("global", checked);
                                }}
                            />
                        )}
                        <Input
                            label={t("description")}
                            state={errors.help ? "error" : "default"}
                            stateRelatedMessage={errors?.help?.message}
                            nativeInputProps={{
                                ...register("help"),
                            }}
                        />
                    </div>
                </EditThemeDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { EditThemeDialog, EditThemeDialogModal };
