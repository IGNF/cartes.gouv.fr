import { type DataDetailsUpload, type PyramidRaster, type PyramidVector, type StoredDataDetails, StoredDataTypeEnum, type VectorDb } from "@/@types/app";
import { niceBytes } from "@/utils";

export type DataKind = "vector_db" | "pyramid_vector" | "pyramid_raster" | "upload";

export type DescriptionField =
    "technical_name" | "size" | "id" | "srs" | "tms" | "levels" | "channels_format" | "channels_number" | "compression" | "nodata_value";

/** valeur absente : affichée « Non renseigné » */
export type DescriptionRow = [DescriptionField, string | undefined];

export type DetailsData =
    | { kind: "upload"; data: DataDetailsUpload }
    | { kind: "vector_db"; data: VectorDb }
    | { kind: "pyramid_vector"; data: PyramidVector }
    | { kind: "pyramid_raster"; data: PyramidRaster };

export function storedDataDetailsData(storedData: StoredDataDetails["stored_data"]): DetailsData {
    switch (storedData.type) {
        case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
            return { kind: "pyramid_raster", data: storedData };
        case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
            return { kind: "pyramid_vector", data: storedData };
        default:
            return { kind: "vector_db", data: storedData };
    }
}

// niveaux non contigus possibles : liste complète, triée numériquement
const sortLevels = (levels: string[] | undefined) =>
    levels
        ?.map(Number)
        .sort((a, b) => a - b)
        .join(", ");

export function descriptionRows(details: DetailsData): DescriptionRow[] {
    const { data } = details;
    const rows: DescriptionRow[] = [
        ["technical_name", data.name],
        ["size", data.size ? niceBytes(String(data.size)) : undefined],
        ["id", data._id],
    ];

    if (details.kind === "upload") {
        rows.push(["srs", details.data.srs]);
    } else if (details.kind !== "vector_db") {
        rows.push(["tms", details.data.type_infos?.tms], ["levels", sortLevels(details.data.type_infos?.levels)]);
    }

    if (details.kind === "pyramid_raster") {
        const typeInfos = details.data.type_infos;
        rows.push(
            ["channels_format", typeInfos?.channels_format],
            ["channels_number", typeInfos?.channels_number?.toString()],
            ["compression", typeInfos?.compression],
            ["nodata_value", typeInfos?.nodata_value]
        );
    }

    return rows;
}

/** date saisie au dépôt, sinon l’année des données plus anciennes */
export const productionDate = (tags: { date?: string; production_year?: string }): string | undefined => tags.date || tags.production_year || undefined;
