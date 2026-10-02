import { DatasheetDetailed } from "@/@types/app";

/** nombre de publications (données stockées) d’une fiche, tous types confondus */
export const getDatasheetPublicationsCount = (datasheet: DatasheetDetailed | undefined): number =>
    (datasheet?.vector_db_list?.length ?? 0) + (datasheet?.pyramid_vector_list?.length ?? 0) + (datasheet?.pyramid_raster_list?.length ?? 0);
