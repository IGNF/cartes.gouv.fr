import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Select from "@codegouvfr/react-dsfr/Select";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { normalizeTheme } from "./ThemeUtils";

const AddThemeDialogModal = createModal({
    id: "add-theme",
    isOpenedByDefault: false,
});

type AddThemeDialogProps = {
    themes: ThemeDTO[];
    tables: string[];
    onAdd: (theme: ThemeDTO) => void;
};

type AddThemeFormType = {
    theme: string;
    fullname?: string;
    help?: string;
    global?: boolean;
};

const normalize = (theme: AddThemeFormType): ThemeDTO => {
    const result = { ...theme };

    result["attributes"] = [];
    if (theme.fullname) {
        const words = theme.fullname.split(":");
        result["database"] = words[0];
        result["table"] = words[1];
        delete result.fullname;
    }
    return normalizeTheme(result as ThemeDTO);
};

const defaultValues: AddThemeFormType = {
    theme: "",
    fullname: "",
    help: "",
    global: false,
};

const AddThemeDialog: FC<AddThemeDialogProps> = ({ themes, tables, onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Theme");

    const themeNames: string[] = useMemo(() => {
        return Array.from(themes, (a) => a.theme);
    }, [themes]);

    const tableOptions = useMemo(() => {
        const a = Array.from(tables, (t) => (
            <option key={t} value={t}>
                {t}
            </option>
        ));
        a.unshift(
            <option key={""} value={""}>
                {t("dialog.add_theme.not_link")}
            </option>
        );
        return a;
    }, [t, tables]);

    const schema = yup.object({
        theme: yup
            .string()
            .trim(t("trimmed_error"))
            .strict(true)
            .required(t("dialog.edit_theme.name_mandatory_error"))
            .test("is-unique", t("dialog.add_theme.name_unique_error"), (value) => {
                const v = value.trim();
                return !themeNames.includes(v);
            }),
        fullname: yup.string(),
        help: yup.string(),
        global: yup.boolean(),
    });

    const {
        register,
        watch,
        formState: { errors },
        setValue: setFormValue,
        getValues: getFormValues,
        reset,
        handleSubmit,
    } = useForm<AddThemeFormType>({
        mode: "onSubmit",
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    });

    const tableFullName = watch("fullname");
    const global = watch("global");

    useEffect(() => {
        if (tableFullName) {
            setFormValue("global", false);
        }
    }, [setFormValue, tableFullName]);

    const onSubmit = () => {
        AddThemeDialogModal.close();
        onAdd(normalize(getFormValues()));
        reset(defaultValues);
    };

    return (
        <>
            {createPortal(
                <AddThemeDialogModal.Component
                    title={t("add_theme")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: false,
                            onClick: () => {
                                reset(defaultValues);
                                AddThemeDialogModal.close();
                            },
                        },
                        {
                            priority: "primary",
                            children: tCommon("add"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                        },
                    ]}
                >
                    <div>
                        <p>{tCommon("mandatory_fields")}</p>
                        <Input
                            label={t("dialog.add_theme.name")}
                            state={errors.theme ? "error" : "default"}
                            stateRelatedMessage={errors?.theme?.message}
                            nativeInputProps={{
                                ...register("theme"),
                            }}
                        />
                        <Select
                            label={t("dialog.add_theme.link_to_table")}
                            hint={t("dialog.add_theme.link_to_table_hint")}
                            nativeSelectProps={{
                                ...register("fullname"),
                            }}
                        >
                            options={tableOptions}
                        </Select>
                        <Input
                            label={t("dialog.add_theme.help")}
                            hintText={t("dialog.add_theme.help_hint")}
                            state={errors.help ? "error" : "default"}
                            stateRelatedMessage={errors?.help?.message}
                            nativeInputProps={{
                                ...register("help"),
                            }}
                        />
                        <ToggleSwitch
                            className={fr.cx("fr-mb-3w")}
                            disabled={tableFullName !== ""}
                            helperText={t("dialog.edit_theme.global_hint")}
                            inputTitle={""}
                            label={t("dialog.edit_theme.global")}
                            showCheckedHint
                            defaultChecked={global}
                            onChange={(checked) => {
                                setFormValue("global", checked);
                            }}
                        />
                    </div>
                </AddThemeDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AddThemeDialog, AddThemeDialogModal };
