import { format as datefnsFormat } from "date-fns";

import { Datastore, EndpointTypeEnum, Metadata, MetadataFormValuesType, MetadataHierarchyLevel, Service, StoredData } from "../../../../@types/app";
import { ConfigurationWfsDetailsContent, ConfigurationWmsVectorDetailsContent } from "../../../../@types/entrepot";
import { getProjectionCode, removeDiacritics } from "../../../../utils";
import { PyramidVectorTmsServiceFormValuesType } from "../tms/PyramidVectorTmsServiceForm/PyramidVectorTmsServiceForm";
import { WfsServiceFormValuesType, WfsTableInfos } from "../wfs/WfsServiceForm";
import { WmsVectorServiceFormValuesType } from "../wms-vector/WmsVectorServiceForm";
// import { thematicCategories } from "../metadata/Description";

const DEFAULT_CHARSET = "utf8";
const DEFAULT_LANGUAGE = { language: "français", code: "fre" };

const getEndpointSuffix = (endpointType: EndpointTypeEnum | string) => {
    switch (endpointType) {
        case EndpointTypeEnum.WFS:
            return "wfs";
        case EndpointTypeEnum.WMSVECTOR:
            return "wmsv";
        case EndpointTypeEnum.WMSRASTER:
            return "wmsr";
        case "tms":
            return "tms";
        case "wmts":
            return "wmts";
        default:
            return "other"; // TODO
    }
};

const getMetadataFormDefaultValues = (metadata?: Metadata, datastore?: Datastore): MetadataFormValuesType => {
    const defaultValues: MetadataFormValuesType = {
        language: metadata?.csw_metadata?.language ? metadata?.csw_metadata?.language : DEFAULT_LANGUAGE,
        creation_date: metadata?.csw_metadata?.date_creation,
        resource_genealogy: metadata?.csw_metadata?.resource_genealogy ?? "",
        hierarchy_level: metadata?.csw_metadata?.hierarchy_level ?? MetadataHierarchyLevel.Dataset,
        email_contact: metadata?.csw_metadata?.producers?.[0]?.organization_email,
        organization: metadata?.csw_metadata?.producers?.[0]?.organization_name,
        organization_email: metadata?.csw_metadata?.producers?.[0]?.organization_email,
        category: metadata?.csw_metadata?.themes ?? [],
        keywords: metadata?.csw_metadata?.keywords_inspire ?? [],
        free_keywords: metadata?.csw_metadata?.keywords_additional ?? [],
        public_name: metadata?.csw_metadata?.name,
        description: metadata?.csw_metadata?.description,
        identifier:
            metadata?.csw_metadata?.file_identifier ??
            metadata?.file_identifier ??
            (datastore?.metadata_file_identifier_prefix ? datastore.metadata_file_identifier_prefix + "." : undefined),
        charset: metadata?.csw_metadata?.charset ?? DEFAULT_CHARSET,
        resolution: metadata?.csw_metadata?.resolution ?? "",
        frequency_code: metadata?.csw_metadata?.update_frequency ?? "unknown",
    };

    // NOTE : migration des anciennes valeurs de l'identifiant (préfixe en minuscule) vers la valeur telle qu'elle fournie par l'API sans transformation
    if (datastore?.metadata_file_identifier_prefix && defaultValues.identifier) {
        const prefix = datastore.metadata_file_identifier_prefix;
        const identifier = defaultValues.identifier;
        const prefixLength = prefix.length;
        const startsWithPrefix = identifier.slice(0, prefixLength).toLowerCase() === prefix.toLowerCase();
        const hasValidBoundary = identifier.length === prefixLength || identifier.charAt(prefixLength) === ".";

        if (startsWithPrefix && hasValidBoundary) {
            defaultValues.identifier = prefix + identifier.slice(prefixLength);
        }
    }

    return defaultValues;
};

const getProjUrl = (srs?: string) => {
    let projUrl = "";
    const projCode = getProjectionCode(srs);
    if (projCode) {
        projUrl = `http://www.opengis.net/def/crs/EPSG/0/${projCode}`;
    }

    return projUrl;
};

function suggestServiceTechnicalName(storedDataName: string, endpointType: EndpointTypeEnum | string, configLayerNamePrefix?: string) {
    const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");
    const suffix = getEndpointSuffix(endpointType);

    let technicalName = `${nice}_${suffix}`;
    if (configLayerNamePrefix) {
        technicalName = `${configLayerNamePrefix}.${technicalName}`;
    }

    return technicalName;
}

export const getWfsServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    vectorDb?: StoredData,
    metadata?: Metadata,
    datastore?: Datastore
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
            service_name: offering?.configuration.name,
            share_with,
            attribution_text: offering?.configuration.attribution?.title,
            attribution_url: offering?.configuration.attribution?.url,
        };
    } else {
        const storedDataName = vectorDb?.name ?? "";

        // valeurs par défaut lors de la création de nouveaux config et offering
        defValues = {
            selected_tables: [],
            table_infos: {},
            technical_name: suggestServiceTechnicalName(storedDataName, EndpointTypeEnum.WFS, datastore?.configuration_layer_name_prefix),
            service_name: metadata?.csw_metadata?.name ?? storedDataName,
            creation_date: now,
            resource_genealogy: "",
            allow_view_data: false,
        };
    }

    defValues = {
        ...defValues,
        projection: getProjUrl(vectorDb?.srs),
        ...getMetadataFormDefaultValues(metadata, datastore),
    };

    return defValues;
};

export const getWmsVectorServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    vectorDb?: StoredData,
    metadata?: Metadata,
    styles?: Record<string, string>,
    datastore?: Datastore
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
            service_name: offering?.configuration.name,
            share_with,
            attribution_text: offering?.configuration.attribution?.title,
            attribution_url: offering?.configuration.attribution?.url,
            allow_view_data: false,
            style_files: styles,
        };
    } else {
        const storedDataName = vectorDb?.name ?? "";

        // valeurs par défaut lors de la création de nouveaux config et offering
        defValues = {
            selected_tables: [],
            technical_name: suggestServiceTechnicalName(storedDataName, EndpointTypeEnum.WMSVECTOR, datastore?.configuration_layer_name_prefix),
            service_name: metadata?.csw_metadata?.name ?? storedDataName,
            creation_date: now,
            resource_genealogy: "",
            allow_view_data: false,
        };
    }

    defValues = {
        ...defValues,
        projection: getProjUrl(vectorDb?.srs),
        ...getMetadataFormDefaultValues(metadata, datastore),
    };

    return defValues;
};

export const getPyramidVectorTmsServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    pyramid?: StoredData,
    metadata?: Metadata,
    datastore?: Datastore
): PyramidVectorTmsServiceFormValuesType => {
    let defValues: PyramidVectorTmsServiceFormValuesType;
    const now = datefnsFormat(new Date(), "yyyy-MM-dd");

    if (editMode) {
        const share_with = offering?.open === true ? "all_public" : "your_community";

        // valeurs récupérées depuis anciens config et offering existants
        defValues = {
            technical_name: offering?.configuration.layer_name,
            service_name: offering?.configuration.name,
            share_with,
            attribution_text: offering?.configuration.attribution?.title,
            attribution_url: offering?.configuration.attribution?.url,
            allow_view_data: false,
        };
    } else {
        const storedDataName = pyramid?.name ?? "";

        // valeurs par défaut lors de la création de nouveaux config et offering
        defValues = {
            technical_name: suggestServiceTechnicalName(storedDataName, "tms", datastore?.configuration_layer_name_prefix),
            service_name: metadata?.csw_metadata?.name ?? storedDataName,
            creation_date: now,
            resource_genealogy: "",
            allow_view_data: false,
        };
    }

    defValues = {
        ...defValues,
        projection: getProjUrl(pyramid?.srs),
        ...getMetadataFormDefaultValues(metadata, datastore),
    };

    return defValues;
};

export const getPyramidRasterWmsRasterServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    pyramid?: StoredData,
    metadata?: Metadata,
    datastore?: Datastore
) => {
    // NOTE : a priori à peu près la même chose que la publication d'une pyramide vecteur en tms

    let technicalName: string | undefined;

    if (editMode) {
        technicalName = offering?.configuration.layer_name;
    } else {
        const storedDataName = pyramid?.name ?? "";
        technicalName = suggestServiceTechnicalName(storedDataName, EndpointTypeEnum.WMSRASTER, datastore?.configuration_layer_name_prefix);
    }

    return {
        ...getPyramidVectorTmsServiceFormDefaultValues(offering, editMode, pyramid, metadata, datastore),
        technical_name: technicalName,
    };
};

export const getPyramidRasterWmtsServiceFormDefaultValues = (
    offering?: Service | null,
    editMode?: boolean,
    pyramid?: StoredData,
    metadata?: Metadata,
    datastore?: Datastore
) => {
    // NOTE : a priori à peu près la même chose que la publication d'une pyramide vecteur en tms

    let technicalName: string | undefined;

    if (editMode) {
        technicalName = offering?.configuration.layer_name;
    } else {
        const storedDataName = pyramid?.name ?? "";
        technicalName = suggestServiceTechnicalName(storedDataName, "wmts", datastore?.configuration_layer_name_prefix);
    }

    return {
        ...getPyramidVectorTmsServiceFormDefaultValues(offering, editMode, pyramid, metadata, datastore),
        technical_name: technicalName,
    };
};
