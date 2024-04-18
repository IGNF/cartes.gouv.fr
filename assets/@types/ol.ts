import { Geometry } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";

export interface Capabilities {
    ServiceIdentification: ServiceIdentification;
    ServiceProvider: ServiceProvider;
    OperationsMetadata: OperationsMetadata;
    version: string;
    Contents: Contents;
}
export interface ServiceIdentification {
    Title: string;
    Abstract: string;
    ServiceType: string;
    ServiceTypeVersion: string;
    Fees: string;
    AccessConstraints: string;
}
export interface ServiceProvider {
    ProviderName: string;
    ProviderSite: string;
    ServiceContact: ServiceContact;
}
export interface ServiceContact {
    IndividualName: string;
    PositionName: string;
    ContactInfo: ContactInfo;
}
export interface ContactInfo {
    Phone: Phone;
    Address: Address;
}
export interface Phone {
    Voice: string;
    Facsimile: string;
}
export interface Address {
    DeliveryPoint: string;
    City: string;
    AdministrativeArea: string;
    PostalCode: string;
    Country: string;
    ElectronicMailAddress: string;
}
export interface OperationsMetadata {
    GetCapabilities: GetCapabilitiesOrGetTileOrGetFeatureInfo;
    GetTile: GetCapabilitiesOrGetTileOrGetFeatureInfo;
    GetFeatureInfo: GetCapabilitiesOrGetTileOrGetFeatureInfo;
}
export interface GetCapabilitiesOrGetTileOrGetFeatureInfo {
    DCP: DCP;
}
export interface DCP {
    HTTP: HTTP;
}
export interface HTTP {
    Get?: GetEntity[] | null;
}
export interface GetEntity {
    href: string;
    Constraint?: ConstraintEntity[] | null;
}
export interface ConstraintEntity {
    name: string;
    AllowedValues: AllowedValues;
}
export interface AllowedValues {
    Value?: string[] | null;
}
export interface Contents {
    Layer?: LayerEntity[] | null;
    TileMatrixSet?: TileMatrixSetEntity[] | null;
}
export interface LayerEntity {
    Title: string;
    Abstract: string;
    WGS84BoundingBox?: number[] | null;
    Identifier: string;
    Style?: StyleEntity[] | null;
    Format?: string[] | null;
    TileMatrixSetLink?: TileMatrixSetLinkEntity[] | null;
}
export interface StyleEntity {
    Title: string;
    Identifier: string;
    LegendURL?: LegendURLEntity[] | null;
    isDefault: boolean;
}
export interface LegendURLEntity {
    format: string;
    href: string;
}
export interface TileMatrixSetLinkEntity {
    TileMatrixSet: string;
    TileMatrixSetLimits?: TileMatrixSetLimitsEntity[] | null;
}
export interface TileMatrixSetLimitsEntity {
    TileMatrix: string;
    MinTileRow: number;
    MaxTileRow: number;
    MinTileCol: number;
    MaxTileCol: number;
}
export interface TileMatrixSetEntity {
    Identifier: string;
    SupportedCRS: string;
    TileMatrix?: TileMatrixEntity[] | null;
}
export interface TileMatrixEntity {
    Identifier: string;
    ScaleDenominator: number;
    TopLeftCorner?: number[] | null;
    TileWidth: number;
    TileHeight: number;
    MatrixWidth: number;
    MatrixHeight: number;
}

export type LayerTypes = VectorLayer<VectorSource<Geometry>> | VectorTileLayer | TileLayer<TileWMS>;
