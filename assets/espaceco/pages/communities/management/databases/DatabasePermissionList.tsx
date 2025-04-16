import { IDatabasePermission } from "@/@types/app_espaceco";
import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import AddDatabasePermissionDialog, { AddDatabasePermissionDialogModal } from "./dialogs/AddDatabasePermissionDialog";
import Permission from "./Permission";
import TablePermissionList from "./TablePermissionList";

const DatabasePermissionList: FC = () => {
    const { t } = useTranslation("Databases");

    const { watch } = useFormContext<{ permissions: IDatabasePermission[] }>();
    const permissions = watch("permissions");

    const databases = useMemo<number[]>(() => {
        return permissions.map((p) => p.id);
    }, [permissions]);

    return (
        <div>
            <Button className={fr.cx("fr-my-2w")} iconId={"fr-icon-add-line"} onClick={() => AddDatabasePermissionDialogModal.open()}>
                {t("add_database_permission")}
            </Button>
            {permissions.length > 0 ? (
                permissions.map((db) => (
                    <>
                        <Permission databaseId={db.id} />
                        {/* Gestion des tables de la base */}
                        <TablePermissionList databaseId={db.id} />
                    </>
                ))
            ) : (
                <div className={fr.cx("fr-h6", "fr-mb-1w")}>{t("no_databases")}</div>
            )}
            <AddDatabasePermissionDialog databases={databases} />
        </div>
    );
};

export default DatabasePermissionList;
