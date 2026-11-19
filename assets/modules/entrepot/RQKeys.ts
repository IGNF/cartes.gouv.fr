import { ConfigurationTypeEnum } from "../../@types/app";
import { type QueryParams } from "../Routing";
import { withQueryKeyNamespace } from "../withQueryKeyNamespace";

/** Factory des query keys react-query du domaine Entrepôt, toutes préfixées par "entrepot" */
const RQKeys = {
    datastore: (datastoreId: string): string[] => ["datastore", datastoreId],
    datastore_endpoints: (datastoreId: string): string[] => ["datastore", datastoreId, "endpoints"],
    datastore_permissions: (datastoreId: string): string[] => ["datastore", datastoreId, "permissions"],
    datastore_permission: (datastoreId: string, permissionId: string): string[] => ["datastore", datastoreId, "permission", permissionId],

    datastore_upload_list: (datastoreId: string, queryParams?: QueryParams): string[] => {
        const keys = ["datastore", datastoreId, "upload"];
        if (queryParams) keys.push(JSON.stringify(queryParams));
        return keys;
    },
    datastore_upload_integration: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId, "integration"],
    datastore_upload_report: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId, "report"],

    datastore_stored_data_list: (datastoreId: string, queryParams?: QueryParams): string[] => {
        const keys = ["datastore", datastoreId, "stored_data"];
        if (queryParams) keys.push(JSON.stringify(queryParams));
        return keys;
    },
    datastore_stored_data: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId],
    datastore_stored_data_uses: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId, "uses"],
    datastore_stored_data_report: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId, "report"],

    datastore_processing_execution_list: (datastoreId: string, queryParams?: QueryParams): string[] => {
        const keys = ["datastore", datastoreId, "processing", "executions"];
        if (queryParams) keys.push(JSON.stringify(queryParams));
        return keys;
    },

    datastore_datasheet_list: (datastoreId: string): string[] => ["datastore", datastoreId, "datasheet"],
    datastore_datasheet: (datastoreId: string, datasheetName: string): string[] => ["datastore", datastoreId, "datasheet", datasheetName],
    search_territories: (search: string): string[] => ["geocoding", "territories", search],
    search_addresses: (search: string): string[] => ["geocoding", "addresses", search],
    datastore_metadata_file_identifier_availability: (datastoreId: string, fileIdentifier: string): string[] => [
        "datastore",
        datastoreId,
        "metadata",
        "file_identifier",
        fileIdentifier,
    ],
    datastore_datasheet_metadata: (datastoreId: string, datasheetName: string): string[] => ["datastore", datastoreId, "datasheet", datasheetName, "metadata"],
    datastore_datasheet_service_list: (datastoreId: string, datasheetName: string) => ["datastore", datastoreId, "datasheet", datasheetName, "services"],

    datastore_offering_list: (datastoreId: string, queryParams?: QueryParams): string[] => {
        const keys = ["datastore", datastoreId, "offering"];
        if (queryParams) keys.push(JSON.stringify(queryParams));
        return keys;
    },
    // préfixe des listes de noms de couches pris, tous types de flux
    datastore_layernames: (datastoreId: string): string[] => ["datastore", datastoreId, "layernames"],
    datastore_layernames_list: (datastoreId: string, configurationType: ConfigurationTypeEnum): string[] => [
        "datastore",
        datastoreId,
        "layernames",
        configurationType,
    ],

    datastore_datasheet_documents_list: (datastoreId: string, datasheetName: string) => ["datastore", datastoreId, "datasheet", datasheetName, "documents"],

    datastore_offering: (datastoreId: string, offeringId: string): string[] => ["datastore", datastoreId, "offering", offeringId],

    datastore_annexe_list: (datastoreId: string, queryParams?: QueryParams): string[] => {
        const keys = ["datastore", datastoreId, "annexe"];
        if (queryParams) keys.push(JSON.stringify(queryParams));
        return keys;
    },
    datastore_annexe: (datastoreId: string, annexeId: string): string[] => ["datastore", datastoreId, "annexe", annexeId],

    datastore_metadata_list: (datastoreId: string): string[] => ["datastore", datastoreId, "metadata"],

    datastore_statics_list: (datastoreId: string, query?: QueryParams): string[] => {
        const keys = ["datastore", datastoreId, "statics"];
        if (query) keys.push(JSON.stringify(query));
        return keys;
    },

    datastore_cleanup_content: (datastoreId: string): string[] => ["datastore", datastoreId, "cleanup", "content"],

    community: (communityId: string): string[] => ["community", communityId],
    community_members: (communityId: string): string[] => ["community", communityId, "members"],

    catalogs_communities: (): string[] => ["catalogs", "communities"],
    catalogs_communities_join_schema: (techName: string): string[] => ["catalogs", "communities", techName, "schema"],
    catalogs_organizations: (): string[] => ["catalogs", "organizations"],

    user_me: (): string[] => ["user", "me"],
    my_keys: (): string[] => ["user", "me", "keys"],
    my_keys_with_accesses: (): string[] => ["user", "me", "keys", "accesses"],
    my_key: (keyId: string): string[] => ["user", "me", "keys", keyId],
    my_permissions: (query?: QueryParams): string[] => {
        const keys = ["user", "me", "permissions"];
        if (query) keys.push(JSON.stringify(query));
        return keys;
    },
    get_permission: (permissionId: string): string[] => ["user", "me", "permissions", permissionId],
    my_documents: (query?: unknown): string[] => ["user", "me", "documents", JSON.stringify(query)],

    accesses_request: (fileIdentifier: string): string[] => ["accesses_request", fileIdentifier],

    alerts: (): string[] => ["alerts"],
};

export default withQueryKeyNamespace("entrepot", RQKeys);
