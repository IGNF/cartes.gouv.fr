import { IDatabasePermission, IPermission } from "@/@types/app_espaceco";
import { arrPermissionLevel, ColumnDetailedDTO, TableDetailedDTO } from "@/@types/espaceco";
import { useTranslation } from "@/i18n/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "react-hook-form";
import { getDatabaseIndex, getTableIndex } from "../PermissionUtils";
import SelectDBItem from "../SelectDBItem";

type AddColumnPermissionDialogProps = {
    modal: ReturnType<typeof createModal>;
    table?: TableDetailedDTO;
    availableColumns: ColumnDetailedDTO[];
};

const AddColumnPermissionDialog: FC<AddColumnPermissionDialogProps> = ({ modal, table, availableColumns }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Databases");

    const { watch, setValue: setFormValue } = useFormContext<{ permissions: IDatabasePermission[] }>();
    const permissions = watch("permissions");

    const [permission, setPermission] = useState<IPermission>();

    const title = useMemo(() => {
        if (table) {
            return table.title ? table.title : table.name;
        }
        return "";
    }, [table]);

    const items = useMemo(() => {
        return availableColumns.map((c) => ({ id: c.id, title: c.title ? c.title : c.name }));
    }, [availableColumns]);

    return createPortal(
        <modal.Component
            title={t("dialog.add_column_permission.title", { tableTitle: title })}
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

                        const idxDatabase = getDatabaseIndex(newPermissions, table?.database_id);
                        if (idxDatabase >= 0) {
                            const idxTable = getTableIndex(newPermissions[idxDatabase], table?.id);
                            if (idxTable >= 0) {
                                newPermissions[idxDatabase].tables[idxTable].columns.push({
                                    id: permission.id,
                                    title: permission.title,
                                    level: permission.level,
                                });
                                setFormValue("permissions", newPermissions);
                            }
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
                            label={t("select_column_items")}
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

export default AddColumnPermissionDialog;
