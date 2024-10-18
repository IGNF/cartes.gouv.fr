import { format as datefnsFormat } from "date-fns";

import { EndpointTypeEnum, Metadata, MetadataFormValuesType, Service, StoredData } from "../../../@types/app";
import { ConfigurationWfsDetailsContent, ConfigurationWmsVectorDetailsContent, ConfigurationWmtsTmsDetailsContent } from "../../../@types/entrepot";
import { getProjectionCode, removeDiacritics } from "../../../utils";
import { PyramidVectorTmsServiceFormValuesType } from "./tms/PyramidVectorTmsServiceForm";
import { WfsServiceFormValuesType, WfsTableInfos } from "./wfs/WfsServiceForm";
import { WmsVectorServiceFormValuesType } from "./wms-vector/WmsVectorServiceForm";

const DEFAULT_CHARSET = "utf8";
const DEFAULT_LANGUAGE = { language: "français", code: "fre" };

export const getEndpointSuffix = (endpointType: EndpointTypeEnum) => {
    switch (endpointType) {
        case EndpointTypeEnum.WFS:
            return "wfs";
        case EndpointTypeEnum.WMSVECTOR:
            return "wmsv";
        case EndpointTypeEnum.WMSRASTER:
            return "wmsr";
        case EndpointTypeEnum.WMTSTMS:
            return "tms";
        default:
            return "other"; // TODO
    }
};

const getMetadataFormDefaultValues = (metadata?: Metadata): MetadataFormValuesType => {
    return {
        languages: metadata?.csw_metadata?.language ? [metadata?.csw_metadata?.language] : [DEFAULT_LANGUAGE],
        creation_date: metadata?.csw_metadata?.creation_date,
        resource_genealogy: metadata?.csw_metadata?.hierarchy_level,
        email_contact: metadata?.csw_metadata?.contact_email,
        organization: metadata?.csw_metadata?.organisation_name,
        organization_email: metadata?.csw_metadata?.organisation_email,
        category: metadata?.csw_metadata?.topic_categories ?? [],
        keywords: metadata?.csw_metadata?.inspire_keywords ?? [],
        free_keywords: metadata?.csw_metadata?.free_keywords ?? [],
        public_name: metadata?.csw_metadata?.title,
        description: metadata?.csw_metadata?.abstract,
        identifier: metadata?.csw_metadata?.file_identifier?.replaceAll("sandbox.", ""),
        charset: metadata?.csw_metadata?.charset ?? DEFAULT_CHARSET,
        resolution: metadata?.csw_metadata?.resolution ?? "",
        frequency_code: metadata?.csw_metadata?.frequency_code ?? "unknown",
    };
};

const getProjUrl = (srs?: string) => {
    let projUrl = "";
    const projCode = getProjectionCode(srs);
    if (projCode) {
        projUrl = `http://www.opengis.net/def/crs/EPSG/0/${projCode}`;
    }

    return projUrl;
};

export const getWfsServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    vectorDb?: StoredData,
    metadata?: Metadata
): WfsServiceFormValuesType => {
    let defValues: WfsServiceFormValuesType;
    const now = datefnsFormat(new Date(), "yyyy-MM-dd");

    if (editMode) {
        const share_with = offering?.open === true ? "all_public" : "your_community";
        const typeInfos = offering?.configuration?.type_infos as ConfigurationWfsDetailsContent | undefined;

        const tableInfos: Record<string, WfsTableInfos> = {};
        typeInfos?.used_data?.[0].relations?.forEach((rel) => {
            tableInfos[rel.native_name] = {
                title: rel.title,
                description: rel.abstract,
                keywords: rel.keywords ?? [],
                public_name: rel.public_name,
            };
        });

        // valeurs récupérées depuis anciens config et offering existants
        defValues = {
            selected_tables: typeInfos?.used_data?.[0].relations?.map((rel) => rel.native_name) ?? [],
            table_infos: tableInfos,
            technical_name: offering?.configuration.layer_name,
            public_name: offering?.configuration.name,
            share_with,
            attribution_text: offering?.configuration.attribution?.title,
            attribution_url: offering?.configuration.attribution?.url,
        };
    } else {
        const suffix = getEndpointSuffix(EndpointTypeEnum.WFS);
        const storedDataName = vectorDb?.name ?? "";
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

        // valeurs par défaut lors de la création de nouveaux config et offering
        defValues = {
            selected_tables: [],
            table_infos: {},
            technical_name: `${nice}_${suffix}`,
            public_name: storedDataName,
            creation_date: now,
            resource_genealogy: "",
        };
    }

    defValues = {
        ...defValues,
        projection: getProjUrl(vectorDb?.srs),
        ...getMetadataFormDefaultValues(metadata),
    };

    return defValues;
};

export const getWmsVectorServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    vectorDb?: StoredData,
    metadata?: Metadata
): WmsVectorServiceFormValuesType => {
    let defValues: WmsVectorServiceFormValuesType;
    const now = datefnsFormat(new Date(), "yyyy-MM-dd");

    if (editMode) {
        const share_with = offering?.open === true ? "all_public" : "your_community";
        const typeInfos = offering?.configuration?.type_infos as ConfigurationWmsVectorDetailsContent | undefined;

        // valeurs récupérées depuis anciens config et offering existants
        defValues = {
            selected_tables: typeInfos?.used_data?.[0].relations?.map((rel) => rel.name) ?? [],
            technical_name: offering?.configuration.layer_name,
            public_name: typeInfos?.title,
            share_with,
            attribution_text: offering?.configuration.attribution?.title,
            attribution_url: offering?.configuration.attribution?.url,
        };
    } else {
        const suffix = getEndpointSuffix(EndpointTypeEnum.WMSVECTOR);
        const storedDataName = vectorDb?.name ?? "";
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

        // valeurs par défaut lors de la création de nouveaux config et offering
        defValues = {
            selected_tables: [],
            technical_name: `${nice}_${suffix}`,
            public_name: storedDataName,
            creation_date: now,
            resource_genealogy: "",
        };
    }

    defValues = {
        ...defValues,
        projection: getProjUrl(vectorDb?.srs),
        ...getMetadataFormDefaultValues(metadata),
    };

    return defValues;
};

export const getPyramidVectorTmsServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    pyramid?: StoredData,
    metadata?: Metadata
): PyramidVectorTmsServiceFormValuesType => {
    let defValues: PyramidVectorTmsServiceFormValuesType;
    const now = datefnsFormat(new Date(), "yyyy-MM-dd");

    if (editMode) {
        const share_with = offering?.open === true ? "all_public" : "your_community";
        const typeInfos = offering?.configuration?.type_infos as ConfigurationWmtsTmsDetailsContent | undefined;

        // valeurs récupérées depuis anciens config et offering existants
        defValues = {
            technical_name: offering?.configuration.layer_name,
            public_name: typeInfos?.title,
            share_with,
            attribution_text: offering?.configuration.attribution?.title,
            attribution_url: offering?.configuration.attribution?.url,
        };
    } else {
        const suffix = getEndpointSuffix(EndpointTypeEnum.WMTSTMS);
        const storedDataName = pyramid?.name ?? "";
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

        // valeurs par défaut lors de la création de nouveaux config et offering
        defValues = {
            technical_name: `${nice}_${suffix}`,
            public_name: storedDataName,
            creation_date: now,
            resource_genealogy: "",
        };
    }

    defValues = {
        ...defValues,
        projection: getProjUrl(pyramid?.srs),
        ...getMetadataFormDefaultValues(metadata),
    };

    return defValues;
};

export const getPyramidRasterWmsRasterServiceFormDefaultValues = (offering?: Service | null, editMode?: boolean, pyramid?: StoredData, metadata?: Metadata) => {
    // NOTE : a priori à peu près la même chose que la publication d'une pyramide vecteur en tms
    const suffix = getEndpointSuffix(EndpointTypeEnum.WMSRASTER);
    const storedDataName = pyramid?.name ?? "";
    const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

    return {
        ...getPyramidVectorTmsServiceFormDefaultValues(offering, editMode, pyramid, metadata),
        technical_name: `${nice}_${suffix}`,
    };
};
