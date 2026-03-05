/**
 * Type definitions for quota checks data structure
 */

import { Datastore } from "@/@types/app";

export interface QuotaCheckSnapshot {
    timestamp: string;
    data: Datastore;
}

// Chart data structures
export interface EndpointChartDataPoint {
    timestamp: string;
    [key: string]: number | string; // endpoint name -> usage
}

export interface StorageChartDataPoint {
    timestamp: string;
    postgresql: number;
    s3Data: number;
    s3Uploads: number;
    s3Annexes: number;
}

export interface EndpointSummary {
    name: string;
    technical_name: string;
    type: string;
    latestUsage: number;
    latestQuota: number;
    percentage: number;
    trend: "up" | "down" | "stable";
    trendPercent: number;
}

export interface StorageSummary {
    name: string;
    type: string;
    latestUsage: number;
    latestQuota: number;
    percentage: number;
    trend: "up" | "down" | "stable";
    trendPercent: number;
}
