import { PermissionLevel, PermissionResponseDTO } from "@/@types/espaceco";

class Permission {
    id: number;
    level?: PermissionLevel;

    constructor(id: number, level?: PermissionLevel) {
        this.id = id;
        this.level = level === "EXPORT" ? "VIEW" : level; // TODO A VOIR
    }

    setlevel(level?: PermissionLevel) {
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

    constructor(id: number, level: PermissionLevel | undefined, parent: Database) {
        super(id, level);
        this.parent = parent;
        this.columns = [];
    }

    addColumn(columnId: number, level: PermissionLevel): Column {
        const column = this.findColumn(columnId);

        if (column) {
            column.setlevel(level);
            return column;
        }

        const newColumn = new Column(columnId, level, this);
        this.columns.push(newColumn);
        return newColumn;
    }

    findColumn(columnId: number) {
        const cols = this.columns.filter((t) => t.id === columnId);
        return cols.length === 1 ? cols[0] : null;
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

    constructor(id: number, level?: PermissionLevel) {
        super(id, level);
        this.tables = [];
    }

    getTables() {
        return this.tables;
    }

    setlevel(level?: PermissionLevel) {
        super.setlevel(level);
    }

    addTable(tableId: number, level?: PermissionLevel): Table {
        const table = this.findTable(tableId);
        if (table) {
            table.setlevel(level);
            return table;
        }

        const newTable = new Table(tableId, level, this);
        this.tables.push(newTable);
        return newTable;
    }

    findTable(tableId: number) {
        const tables = this.tables.filter((t) => t.id === tableId);
        return tables.length === 1 ? tables[0] : null;
    }
}

export default class Permissions {
    databases: Database[];

    constructor() {
        this.databases = [];
    }

    setUp(permissions: PermissionResponseDTO[]) {
        this.databases = [];
        permissions.forEach((permission) => {
            this.addPermission(permission);
        });

        return this.json();
    }

    json() {
        return this.databases.reduce((accumulator, db) => {
            // Les tables
            const tables = db.getTables().reduce((acc1, table) => {
                // Les colonnes
                const columns = table.getColumns().reduce((acc2, column) => {
                    // Les colonnes
                    acc2 = { ...acc2, ...{ [column.id]: { level: column.level } } };
                    return acc2;
                }, {});
                acc1 = { ...acc1, ...{ [table.id]: { level: table.level, columns: columns } } };
                return acc1;
            }, {});
            accumulator = { ...accumulator, ...{ [db.id]: { level: db.level, tables: tables } } };
            return accumulator;
        }, {});
    }

    addPermission(permission: PermissionResponseDTO) {
        if (!["VIEW", "EDIT"].includes(permission.level)) {
            return;
        }

        if (permission.database) {
            if (permission.table === null) {
                this.addDBPermission(permission.database, permission.level);
            } else if (permission.column === null) {
                this.addTablePermission(permission.database, permission.table, permission.level);
            } else {
                this.addColumnPermission(permission.database, permission.table, permission.column, permission.level);
            }
        }
    }

    private addDBPermission(id: number, level?: PermissionLevel): Database {
        let db = this.findDatabase(id);
        if (db) {
            db.setlevel(level);
        } else {
            db = new Database(id, level);
        }
        this.databases.push(db);

        return db;
    }

    private addTablePermission(databaseId: number, tableId: number, level: PermissionLevel) {
        const db = this.findDatabase(databaseId);
        if (db) {
            let table = db.findTable(tableId);
            if (table) {
                table.setlevel(level);
            } else {
                table = db.addTable(tableId, level);
            }
            return table;
        }

        const newDb = this.addDBPermission(databaseId);
        return newDb.addTable(tableId, level);
    }

    private addColumnPermission(databaseId: number, tableId: number, columnId: number, level: PermissionLevel) {
        let db = this.findDatabase(databaseId);
        if (!db) {
            db = this.addDBPermission(databaseId);
        }

        let table = db.findTable(tableId);
        if (!table) {
            table = db.addTable(tableId);
        }

        let column = table.findColumn(columnId);
        if (!column) {
            column = table.addColumn(columnId, level);
        }

        return column;
    }

    private findDatabase(databaseId: number): Database | null {
        const db = this.databases.filter((d) => d.id === databaseId);
        return db.length === 1 ? db[0] : null;
    }
}
