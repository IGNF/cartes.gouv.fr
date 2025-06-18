import { StoredDataRelation } from "@/@types/app";
import { StaticFileListResponseDto } from "@/@types/entrepot";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { useQueries, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";

export type useTableStylesReturn = {
    data?: Record<string, string>;
    isLoading: boolean;
    isError: boolean;
    errors: string[];
};

export const useTableStyles = (
    editMode: boolean,
    datastoreId: string,
    selectedTables: StoredDataRelation[],
    staticFiles?: StaticFileListResponseDto[],
    configId?: string
): useTableStylesReturn => {
    const queries = useMemo(() => {
        const enabled = configId && selectedTables.length && staticFiles;
        return (
            selectedTables.map<UseQueryOptions<string, CartesApiException>>((sdRel) => {
                const filename = `config_${configId}_style_wmsv_${sdRel.name}`;
                const fileId = staticFiles?.find((file) => file.name === filename)?._id;
                return {
                    queryKey: RQKeys.datastore_statics_download(datastoreId, fileId ?? ""),
                    queryFn: () => api.statics.download(datastoreId, fileId!),
                    enabled: Boolean(enabled && fileId && editMode),
                };
            }) || []
        );
    }, [editMode, datastoreId, configId, staticFiles, selectedTables]);

    const styleQueries = useQueries({
        queries: queries,
    });

    const isLoading = styleQueries.some((q) => q.isLoading);
    const isError = styleQueries.some((q) => q.isError);
    const errors = useMemo(() => {
        return styleQueries.filter((q) => q.isError).map((q) => q.error.message);
    }, [styleQueries]);

    const data = styleQueries.length
        ? selectedTables.reduce((accumulator, srRel, index) => ({ ...accumulator, [srRel.name]: styleQueries[index].data }), {})
        : undefined;

    return {
        data,
        isLoading,
        isError,
        errors,
    };
};
