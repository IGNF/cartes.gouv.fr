import { IDatabasePermission, IPermission, ITablePermission } from "@/@types/app_espaceco";
import { FieldPath } from "react-hook-form";

export type DBItem = {
    permission: IDatabasePermission | ITablePermission | IPermission;
    registeredName: FieldPath<{ permissions: IDatabasePermission[] }>;
};

const getDatabaseIndex = (permissions: IDatabasePermission[], databaseId?: number) => {
    return databaseId ? permissions.findIndex((p) => p.id === databaseId) : -1;
};

const getTableIndex = (permission: IDatabasePermission, tableId?: number) => {
    return tableId ? permission.tables.findIndex((t) => t.id === tableId) : -1;
};

const getPermission = (permissions: IDatabasePermission[], databaseId: number, tableId?: number, columnId?: number): DBItem => {
    const idxDB = getDatabaseIndex(permissions, databaseId);
    if (idxDB === -1) {
        throw new Error(`Permission on database [${databaseId}] not found.`);
    }

    // permission sur une base de données
    if (!tableId && !columnId) {
        return { permission: permissions[idxDB], registeredName: `permissions.${idxDB}.level` };
    }

    const idxTable = permissions[idxDB].tables.findIndex((t) => t.id === tableId);
    if (idxTable === -1) {
        throw new Error(`Permission on table [${databaseId} ${tableId}] not found.`);
    }

    if (!columnId) {
        // permission sur une table
        return { permission: permissions[idxDB].tables[idxTable], registeredName: `permissions.${idxDB}.tables.${idxTable}.level` };
    }

    // Permission sur une colonne
    const idxColumn = permissions[idxDB].tables[idxTable].columns.findIndex((c) => c.id === columnId);
    if (idxColumn === -1) {
        throw new Error(`Permission on column [${databaseId}, ${tableId}, ${columnId}] not found.`);
    }

    return {
        permission: permissions[idxDB].tables[idxTable].columns[idxColumn],
        registeredName: `permissions.${idxDB}.tables.${idxTable}.columns.${idxColumn}.level`,
    };
};

const removePermission = (permissions: IDatabasePermission[], databaseId: number, tableId?: number, columnId?: number): IDatabasePermission[] => {
    const newPermissions = [...permissions];

    const idxDB = permissions.findIndex((p) => p.id === databaseId);
    if (idxDB === -1) {
        throw new Error(`Permission on database [${databaseId}] not found.`);
    }

    // Permission sur une base de données
    if (!tableId && !columnId) {
        newPermissions.splice(idxDB, 1);
    } else {
        const idxTable = getTableIndex(permissions[idxDB], tableId);
        if (idxTable === -1) {
            throw new Error(`Permission on table [${databaseId} ${tableId}] not found.`);
        }

        if (!columnId) {
            // Permission sur une table
            newPermissions[idxDB].tables.splice(idxTable, 1);
        } else {
            // Permission sur une colonne
            const idxColumn = permissions[idxDB].tables[idxTable].columns.findIndex((c) => c.id === columnId);
            if (idxColumn === -1) {
                throw new Error(`Permission on column [${databaseId}, ${tableId}, ${columnId}] not found.`);
            }
            newPermissions[idxDB].tables[idxTable].columns.splice(idxColumn, 1);
        }
    }

    return newPermissions;
};

export { getDatabaseIndex, getTableIndex, getPermission, removePermission };
