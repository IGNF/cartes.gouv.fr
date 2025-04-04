import { PermissionLevel, PermissionResponseDTO } from "@/@types/espaceco";

class Permission {
    id: number;
    level: PermissionLevel;

    constructor(id: number, level: PermissionLevel) {
        this.id = id;
        this.level = level === "EXPORT" ? "VIEW" : level;
    }

    setlevel(level: PermissionLevel) {
        // TODO
        this.level = level;
    }
}

class Column extends Permission {
    parent: Table;
    constructor(id: number, level: PermissionLevel, parent: Table) {
        super(id, level);
        this.parent = parent;
    }
}

class Table extends Permission {
    parent: Database;
    columns: Column[];

    constructor(id: number, level: PermissionLevel, parent: Database) {
        super(id, level);
        this.parent = parent;
        this.columns = [];
    }

    getColumns() {
        return this.columns;
    }

    setColumns(columns: Column[]) {
        this.columns = columns;
    }
}

class Database extends Permission {
    private tables: Table[];

    constructor(id: number, level: PermissionLevel) {
        super(id, level);
        this.tables = [];
    }

    getTables() {
        return this.tables;
    }

    setlevel(level: PermissionLevel) {
        super.setlevel(level);

        // On supprime les colonnes d'abord de meme "level" que level
        /* const tables = Array.from(this.tables, (table) => {
            const columns = table.getColumns().filter((c) => c.level !== level);
            if (columns) {
                table.setColumns(columns);
            }
        });*/
    }

    addTable(tableId: number, level: PermissionLevel) {
        const table = this.findTable(tableId);
        if (table) {
            table.setlevel(level);
        } else this.tables.push(new Table(tableId, level, this));
    }

    findTable(tableId: number) {
        const tables = this.tables.filter((t) => t.id === tableId);
        return tables.length === 1 ? tables[0] : null;
    }
}

export class Permissions {
    databases: Database[];

    constructor(permissions: PermissionResponseDTO[]) {
        this.databases = [];
        permissions.forEach((permission) => {
            this.addPermission(permission);
        });
    }

    addPermission(permission: PermissionResponseDTO) {
        if (permission.database) {
            if (permission.table === null) {
                this.addDBPermission(permission.database, permission.level);
            } else if (permission.column === null) {
                this.addTablePermission(permission.database, permission.table, permission.level);
            } else {
                // TODO
            }
        }
    }

    private addDBPermission(id: number, level: PermissionLevel) {
        const db = this.findDatabase(id);
        if (db) {
            db.setlevel(level);
        } else {
            this.databases.push(new Database(id, level));
        }
    }

    private addTablePermission(databaseId: number, tableId: number, level: PermissionLevel) {
        const db = this.findDatabase(databaseId);
        if (db) {
            const table = db.findTable(tableId);
            if (table) {
                table.setlevel(level);
            } else db.addTable(tableId, level);
        }
    }

    private findDatabase(databaseId: number): Database | null {
        const db = this.databases.filter((d) => d.id === databaseId);
        return db.length === 1 ? db[0] : null;
    }
}
