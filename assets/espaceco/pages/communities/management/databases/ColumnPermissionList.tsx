import { IDatabasePermission, ITablePermission } from "@/@types/app_espaceco";
import { TableDetailedDTO } from "@/@types/espaceco";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/espaceco/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useQuery } from "@tanstack/react-query";
import { FC, useId, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import AddColumnPermissionDialog from "./dialogs/AddColumnPermissionDialog";
import Permission from "./Permission";
import { getPermission } from "./PermissionUtils";

type ColumnPermissionListProps = {
    databaseId: number;
    tableId: number;
};

function getAvailableColumns(permission: ITablePermission, table: TableDetailedDTO) {
    const permissionColumns = permission.columns.map((c) => c.id);
    return table.columns.filter((t) => !permissionColumns.includes(t.id));
}

const ColumnPermissionList: FC<ColumnPermissionListProps> = ({ databaseId, tableId }) => {
    const { t } = useTranslation("Databases");

    const { watch } = useFormContext<{ permissions: IDatabasePermission[] }>();
    const permissions = watch("permissions");

    const permission = useMemo(() => {
        const p = getPermission(permissions, databaseId, tableId);
        return p.permission as ITablePermission;
    }, [permissions, databaseId, tableId]);

    const {
        data: table,
        refetch,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: RQKeys.table(databaseId, tableId),
        queryFn: ({ signal }) => api.database.getTable(databaseId, tableId, [], signal),
        enabled: false,
    });

    const id = useId();
    const modal = useMemo(
        () =>
            createModal({
                id: `add-column-permission-${id}`,
                isOpenedByDefault: false,
            }),
        [id]
    );

    const availableColumns = useMemo(() => {
        if (table) {
            return getAvailableColumns(permission, table);
        }
        return [];
    }, [permission, table]);

    const handleAddColumn = async () => {
        let t = table;
        if (!t) {
            try {
                const result = await refetch({ throwOnError: true });
                if (!result.error && result.data) {
                    t = result.data;
                }
            } catch (e) {
                /* */
            }
        }

        if (t) {
            const avColumns = getAvailableColumns(permission, t);
            if (avColumns.length > 0) {
                modal.open();
            }
        }
    };

    return (
        <div
            className={fr.cx("fr-col-offset-1", "fr-mb-2w", "fr-p-2w")}
            style={{
                borderLeft: `solid 1.5px ${fr.colors.decisions.border.actionHigh.blueFrance.default}`,
            }}
        >
            <Button className={fr.cx("fr-mb-2w")} priority={"secondary"} size={"small"} iconId={"fr-icon-add-line"} onClick={() => handleAddColumn()}>
                {t("add_column_permission")}
            </Button>
            {table && availableColumns.length === 0 && <Alert severity={"info"} closable title={t("all_columns_have_permissions")} />}
            {isLoading && <LoadingText as={"h6"} withSpinnerIcon message={t("loading_table", { title: permission.title })} />}
            {isError && <Alert severity="error" closable title={error.message} />}
            {permission.columns.length > 0 ? (
                <Accordion label={t("columns")} titleAs={"h6"}>
                    {permission.columns.map((column) => (
                        <div key={column.id}>
                            <Permission databaseId={databaseId} tableId={tableId} columnId={column.id} />
                        </div>
                    ))}
                </Accordion>
            ) : (
                <div className={fr.cx("fr-h6", "fr-mb-1w")}>{t("no_columns")}</div>
            )}
            <AddColumnPermissionDialog modal={modal} table={table} availableColumns={availableColumns} />
        </div>
    );
};

export default ColumnPermissionList;
