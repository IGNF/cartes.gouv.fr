import { DatabaseResponseDTO, PermissionResponseDTO } from "@/@types/espaceco";
import LoadingText from "@/components/Utils/LoadingText";
import api from "@/espaceco/api";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import Permissions from "./Permissions";
import { GroupByPermission } from "@/@types/app_espaceco";

const DatabasesPermissions: FC = () => {
    const { t } = useTranslation("Databases");

    const context = useCommunityContext();
    const community = context.community!;

    const {
        data: permissions,
        isError,
        error,
        isLoading,
    } = useQuery<GroupByPermission>({
        queryKey: RQKeys.permissions(community.id),
        queryFn: ({ signal }) => api.permission.get(community.id, signal),
        staleTime: 3600000,
    });
    console.log("PERMISSIONS : ", permissions);

    /* const dbIds = useMemo(() => {
        const ids: number[] = [];
        usedPermissions?.reduce((accumulator, p) => {
            accumulator.push(p.database);
            return accumulator;
        }, ids);
        return Array.from(new Set(ids));
    }, [usedPermissions]); */

    /*const dbQuery = useQuery<DatabaseResponseDTO[]>({
        queryKey: RQKeys.databases(dbIds),
        queryFn: ({ signal }) => api.database.get(dbIds, signal),
        staleTime: 3600000,
        enabled: dbIds.length > 0,
    });
    console.log("DBQUERY.DATA", dbQuery.data); */
    /* const queries = useQueries({
        queries: Array.from(dbIds, (id) => ({
            queryKey: RQKeys.databases([id]),
            queryFn: ({ signal }) => api.database.get([id], signal),
            staleTime: 3600000,
        })),
    });
    console.log(queries); */

    /* const {
        data: databases,
        isError: isErrorDBs,
        error: errorDBs,
        isLoading: isLoadingDBs,
    } = useQuery<DatabaseResponseDTO[]>({
        queryKey: RQKeys.databases(dbIds),
        queryFn: ({ signal }) => api.database.
        staleTime: 3600000,
        enabled: dbIds.length > 0
    }); */

    return (
        <div>
            {isLoading ? (
                <LoadingText as={"h6"} message={t("loading_permissions")} />
            ) : isError ? (
                <Alert severity="error" closable title={error?.message} />
            ) : (
                permissions && (permissions.length === 0 ? <div /> : <div />)
            )}
        </div>
    );
};

export default DatabasesPermissions;
