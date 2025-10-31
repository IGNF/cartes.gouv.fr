import { useQueries, UseQueryOptions } from "@tanstack/react-query";

import { StaticFile } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";

export type useTableStylesReturn = {
    data?: Record<string, string>;
    isLoading: boolean;
    isError: boolean;
    errors: string[];
};

export const useTableStyles = (editMode: boolean, datastoreId: string, staticFiles: StaticFile[] = []): useTableStylesReturn => {
    // TODO A SUPPRIMER PEUT-ETRE - staticFiles est parfois un objet ???
    const sFiles = Array.isArray(staticFiles) ? [...staticFiles] : [];

    const enabled = Boolean(staticFiles && editMode);
    const styleQueries = useQueries({
        queries: sFiles.map<UseQueryOptions<string, CartesApiException>>((staticFile) => ({
            queryKey: RQKeys.datastore_statics_download(datastoreId, staticFile._id),
            queryFn: () => api.statics.download(datastoreId, staticFile._id),
            enabled,
            staleTime: 60000,
        })),
    });

    const isLoading = styleQueries.some((q) => q.isLoading);
    const isError = styleQueries.some((q) => q.isError);
    const errors = styleQueries.reduce<string[]>((acc, q) => {
        if (q.isError && q.error?.message) acc.push(q.error.message);
        return acc;
    }, []);

    const data = styleQueries.length
        ? staticFiles.reduce((accumulator, staticFile, index) => {
              const filename = staticFile.name;
              const regex = /config_[a-z0-9-]+_style_wmsv_(\w+)/;
              const tableName = regex.exec(filename)?.[1]; // Extract table name from filename

              if (tableName) {
                  accumulator[tableName] = styleQueries[index].data;
              }
              return accumulator;
          }, {})
        : undefined;

    return {
        data,
        isLoading,
        isError,
        errors,
    };
};
