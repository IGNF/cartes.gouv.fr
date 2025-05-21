import { IDatabasePermission, IPermission } from "@/@types/app_espaceco";
import { arrPermissionLevel } from "@/@types/espaceco";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC, useState } from "react";
import { createPortal } from "react-dom";
import SearchDatabases from "../SearchDatabases";
import { useFormContext } from "react-hook-form";

const AddDatabasePermissionDialogModal = createModal({
    id: "add-database-permission-modal",
    isOpenedByDefault: false,
});

type AddDatabasePermissionDialogProps = {
    databases: number[];
};

const AddDatabasePermissionDialog: FC<AddDatabasePermissionDialogProps> = ({ databases }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Databases");

    const [permission, setPermission] = useState<IPermission>();

    const { watch, setValue: setFormValue } = useFormContext<{ permissions: IDatabasePermission[] }>();
    const permissions = watch("permissions");

    return createPortal(
        <AddDatabasePermissionDialogModal.Component
            title={t("dialog.add_database_permission.title")}
            size={"large"}
            buttons={[
                {
                    children: tCommon("cancel"),
                    doClosesModal: false,
                    onClick: () => {
                        AddDatabasePermissionDialogModal.close();
                    },
                    priority: "secondary",
                },
                {
                    children: tCommon("add"),
                    doClosesModal: false,
                    onClick: () => {
                        if (!permission) {
                            return;
                        }

                        const newPermissions = [...permissions];
                        newPermissions.push({ ...permission, tables: [] });
                        setFormValue("permissions", newPermissions);

                        setPermission(undefined);
                        AddDatabasePermissionDialogModal.close();
                    },
                    priority: "primary",
                },
            ]}
        >
            <div className={fr.cx("fr-grid-row")}>
                <SearchDatabases
                    filter={databases}
                    onChange={(db) => {
                        if (db) setPermission({ ...db, ...{ level: "NONE" } });
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
        </AddDatabasePermissionDialogModal.Component>,
        document.body
    );
};

export { AddDatabasePermissionDialog, AddDatabasePermissionDialogModal };
export default AddDatabasePermissionDialog;
