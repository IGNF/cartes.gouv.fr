import { IDatabasePermission, IPermission } from "@/@types/app_espaceco";
import { arrPermissionLevel, DatabaseDetailedResponseDTO, TableDTO } from "@/@types/espaceco";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "react-hook-form";
import { getDatabaseIndex } from "../PermissionUtils";
import SelectDBItem from "../SelectDBItem";

type AddTablePermissionDialogProps = {
    modal: ReturnType<typeof createModal>;
    database?: DatabaseDetailedResponseDTO;
    availableTables: TableDTO[];
};

/* AJOUT DE LA PERMISSION SUR UNE TABLE */
const AddTablePermissionDialog: FC<AddTablePermissionDialogProps> = ({ modal, database, availableTables }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Databases");

    const { watch, setValue: setFormValue } = useFormContext<{ permissions: IDatabasePermission[] }>();
    const permissions = watch("permissions");

    const [permission, setPermission] = useState<IPermission>();

    const title = useMemo(() => {
        if (database) {
            return database.title ? database.title : database.name;
        }
        return "";
    }, [database]);

    const items = useMemo(() => {
        return availableTables.map((t) => ({ id: t.id, title: t.title ? t.title : t.name }));
    }, [availableTables]);

    return createPortal(
        <modal.Component
            title={t("dialog.add_table_permission.title", { dbTitle: title })}
            buttons={[
                {
                    children: tCommon("cancel"),
                    priority: "secondary",
                    doClosesModal: false,
                    onClick: () => {
                        modal.close();
                    },
                },
                {
                    priority: "primary",
                    children: tCommon("add"),
                    doClosesModal: false,
                    onClick: () => {
                        if (!permission) {
                            return;
                        }
                        const newPermissions = [...permissions];

                        const idxDatabase = getDatabaseIndex(newPermissions, database?.id);
                        if (idxDatabase >= 0) {
                            newPermissions[idxDatabase].tables.push({ id: permission.id, title: permission.title, level: permission.level, columns: [] });
                            setFormValue("permissions", newPermissions);
                        }

                        setPermission(undefined);
                        modal.close();
                    },
                },
            ]}
        >
            <div className={fr.cx("fr-grid-row")}>
                {items ? (
                    <div className={fr.cx("fr-col-12")}>
                        <SelectDBItem
                            label={t("select_table_items")}
                            items={items}
                            onChange={(table) => {
                                if (table) {
                                    setPermission({ id: table.id, title: table.title, level: "NONE" });
                                }
                            }}
                        />
                        {permission && (
                            <RadioButtons
                                legend={<div className={fr.cx("fr-text--bold")}>{permission.title}</div>}
                                orientation={"horizontal"}
                                options={arrPermissionLevel.map((p) => ({
                                    label: t("get_level", { level: p }),
                                    nativeInputProps: {
                                        checked: permission.level === p,
                                        onChange: () => {
                                            setPermission({ ...permission, ...{ level: p } });
                                        },
                                    },
                                }))}
                            />
                        )}
                    </div>
                ) : null}
            </div>
        </modal.Component>,
        document.body
    );
};

export default AddTablePermissionDialog;
