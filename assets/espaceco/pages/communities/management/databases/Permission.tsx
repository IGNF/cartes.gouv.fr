import { IDatabasePermission, IPermission, ITablePermission } from "@/@types/app_espaceco";
import { arrPermissionLevel } from "@/@types/espaceco";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC, useCallback, useMemo } from "react";
import { FieldPath, useFormContext } from "react-hook-form";
import { getPermission, removePermission } from "./PermissionUtils";

type PermissionProps = {
    databaseId: number;
    tableId?: number;
    columnId?: number;
};

type Item = {
    permission: IDatabasePermission | ITablePermission | IPermission;
    registeredName: FieldPath<{ permissions: IDatabasePermission[] }>;
};

const Permission: FC<PermissionProps> = ({ databaseId, tableId, columnId }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Databases");

    const { register, watch, setValue: setFormValue } = useFormContext<{ permissions: IDatabasePermission[] }>();
    const permissions = watch("permissions");

    const item: Item = useMemo(() => {
        return getPermission(permissions, databaseId, tableId, columnId);
    }, [permissions, databaseId, tableId, columnId]);

    /* Suppression de la permission */
    const handleRemove = useCallback(() => {
        const newPermissions = removePermission(permissions, databaseId, tableId, columnId);
        setFormValue("permissions", newPermissions);
    }, [permissions, databaseId, tableId, columnId, setFormValue]);

    return (
        <RadioButtons
            legend={
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    {item.permission.title}
                    <Button
                        className={fr.cx("fr-ml-1w")}
                        title={tCommon("delete")}
                        priority={"tertiary no outline"}
                        iconId={"fr-icon-delete-line"}
                        onClick={() => handleRemove()}
                    />
                </div>
            }
            orientation={"horizontal"}
            small
            options={arrPermissionLevel.map((p) => ({
                label: t("get_level", { level: p }),
                nativeInputProps: {
                    ...register(item.registeredName),
                    value: p,
                },
            }))}
        />
    );
};

export default Permission;
