import { IDatabasePermission } from "@/@types/app_espaceco";
import { DatabaseDetailedResponseDTO } from "@/@types/espaceco";
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
import ColumnPermissionList from "./ColumnPermissionList";
import AddTablePermissionDialog from "./dialogs/AddTablePermissionDialog";
import Permission from "./Permission";
import { getPermission } from "./PermissionUtils";

function getAvailableTables(permission: IDatabasePermission, database: DatabaseDetailedResponseDTO) {
    const permissionTables = permission.tables.map((t) => t.id);
    return database.tables.filter((t) => !permissionTables.includes(t.id));
}

type TablePermissionListProps = {
    databaseId: number;
};

const TablePermissionList: FC<TablePermissionListProps> = ({ databaseId }) => {
    const { t } = useTranslation("Databases");

    const { watch } = useFormContext<{ permissions: IDatabasePermission[] }>();
    const permissions = watch("permissions");

    const permission = useMemo(() => {
        const p = getPermission(permissions, databaseId);
        return p.permission as IDatabasePermission;
    }, [permissions, databaseId]);

    const {
        data: database,
        refetch,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: RQKeys.database(databaseId),
        queryFn: ({ signal }) => api.database.get(databaseId, [], signal),
        enabled: false,
    });

    const id = useId();
    const modal = useMemo(
        () =>
            createModal({
                id: `add-table-permission-${id}`,
                isOpenedByDefault: false,
            }),
        [id]
    );

    const availableTables = useMemo(() => {
        if (database) {
            return getAvailableTables(permission, database);
        }
        return [];
    }, [permission, database]);

    const handleAddTable = async () => {
        let db = database;
        if (!db) {
            try {
                const result = await refetch({ throwOnError: true });
                if (!result.error && result.data) {
                    db = result.data;
                }
            } catch (_) {
                /* */
            }
        }
        if (db) {
            const avTables = getAvailableTables(permission, db);
            if (avTables.length > 0) {
                modal.open();
            }
        }
    };

    return (
        <div
            className={fr.cx("fr-col-offset-1", "fr-my-2w", "fr-p-2w")}
            style={{
                borderLeft: `solid 1.5px ${fr.colors.decisions.border.actionHigh.blueFrance.default}`,
            }}
        >
            <Button className={fr.cx("fr-mb-2w")} priority={"secondary"} size={"medium"} iconId={"fr-icon-add-line"} onClick={() => handleAddTable()}>
                {t("add_table_permission")}
            </Button>
            {database && availableTables.length === 0 && <Alert severity={"info"} closable title={t("all_tables_have_permissions")} />}
            {isLoading && <LoadingText as={"h6"} withSpinnerIcon message={t("loading_database", { title: permission.title })} />}
            {isError && <Alert severity="error" closable title={error.message} />}
            {permission.tables.length > 0 ? (
                <Accordion label={t("tables")} titleAs={"h5"}>
                    {permission.tables.map((table) => (
                        <div key={table.id}>
                            <Permission databaseId={databaseId} tableId={table.id} />
                            <ColumnPermissionList databaseId={databaseId} tableId={table.id} />
                        </div>
                    ))}
                </Accordion>
            ) : (
                <div className={fr.cx("fr-h6", "fr-mb-1w")}>{t("no_tables")}</div>
            )}
            <AddTablePermissionDialog modal={modal} database={database} availableTables={availableTables} />
        </div>
    );
};

export default TablePermissionList;
