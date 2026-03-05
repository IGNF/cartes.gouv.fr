/**
 * Utilities for transforming quota check data for visualization
 */

import { StorageType } from "@/@types/entrepot";
import { QuotaCheckSnapshot, EndpointChartDataPoint, StorageChartDataPoint, EndpointSummary, StorageSummary } from "./types";

const BYTES_PER_MB = 1_000_000;

/**
 * Format bytes to MB with 2 decimal places
 */
export function bytesToMB(bytes: number): number {
    return Math.round((bytes / BYTES_PER_MB) * 100) / 100;
}

/**
 * Calculate percentage: (use / quota) * 100
 */
export function calculatePercentage(use: number, quota: number): number {
    if (quota === 0) return 0;
    return Math.round((use / quota) * 100 * 100) / 100; // 2 decimal places
}

/**
 * Transform quota snapshots into endpoint trend chart data
 * Groups by top endpoint types and their usage over time
 */
export function transformEndpointTrends(snapshots: QuotaCheckSnapshot[], limit: number = 8): EndpointChartDataPoint[] {
    if (snapshots.length === 0) return [];

    // Get all unique endpoints from latest snapshot
    const latestSnapshot = snapshots[snapshots.length - 1];
    const allEndpoints = latestSnapshot?.data?.endpoints;

    if (!allEndpoints || allEndpoints.length === 0) return [];

    // Sort by usage and take top N
    const topEndpoints = allEndpoints.sort((a, b) => b.use - a.use).slice(0, limit);

    const topEndpointIds = new Set(topEndpoints.map((e) => e.endpoint._id));

    // Build chart data for each timestamp
    return snapshots.map((snapshot) => {
        const point: EndpointChartDataPoint = {
            timestamp: formatTimestamp(snapshot.timestamp),
        };

        snapshot.data?.endpoints?.forEach((endpoint) => {
            if (topEndpointIds.has(endpoint.endpoint._id)) {
                // Use technical_name as key for unique identification
                point[endpoint.endpoint.technical_name] = endpoint.use;
            }
        });

        return point;
    });
}

/**
 * Transform quota snapshots into storage trend chart data
 * Shows usage over time for each storage category
 */
export function transformStorageTrends(snapshots: QuotaCheckSnapshot[]): StorageChartDataPoint[] {
    if (snapshots.length === 0) return [];

    return snapshots.map((snapshot) => {
        const storages = snapshot.data?.storages;

        if (!storages) {
            return {
                timestamp: formatTimestamp(snapshot.timestamp),
                postgresql: 0,
                s3Data: 0,
                s3Uploads: 0,
                s3Annexes: 0,
            };
        }

        // Get PostgreSQL storage by type (resilient to ordering)
        const postgresStorage = storages.data?.find((s) => s.storage?.type === StorageType.POSTGRESQL);
        const postgresMB = postgresStorage ? bytesToMB(postgresStorage.use) : 0;

        // Get S3 Data storage by type (resilient to ordering)
        const s3DataStorage = storages.data?.find((s) => s.storage?.type === StorageType.S3);
        const s3DataMB = s3DataStorage ? bytesToMB(s3DataStorage.use) : 0;

        const s3UploadsMB = storages.uploads ? bytesToMB(storages.uploads.use) : 0;
        const s3AnnexesMB = storages.annexes ? bytesToMB(storages.annexes.use) : 0;

        return {
            timestamp: formatTimestamp(snapshot.timestamp),
            postgresql: postgresMB,
            s3Data: s3DataMB,
            s3Uploads: s3UploadsMB,
            s3Annexes: s3AnnexesMB,
        };
    });
}

/**
 * Get endpoint summary statistics for KPI display
 */
export function getEndpointSummaries(snapshots: QuotaCheckSnapshot[]): EndpointSummary[] {
    if (snapshots.length === 0) return [];

    const latestSnapshot = snapshots[snapshots.length - 1];
    const previousSnapshot = snapshots[snapshots.length - 2];

    const endpoints = latestSnapshot?.data?.endpoints;
    if (!endpoints) return [];

    return endpoints
        .map((endpoint) => {
            const prevEndpoint = previousSnapshot?.data?.endpoints?.find((e) => e.endpoint._id === endpoint.endpoint._id);

            const percentage = calculatePercentage(endpoint.use, endpoint.quota);

            let trend: "up" | "down" | "stable" = "stable";
            let trendPercent = 0;

            if (endpoint.use > (prevEndpoint?.use ?? 0)) {
                trend = "up";
                trendPercent = endpoint.use - (prevEndpoint?.use ?? 0);
            } else if (endpoint.use < (prevEndpoint?.use ?? 0)) {
                trend = "down";
                trendPercent = (prevEndpoint?.use ?? 0) - endpoint.use;
            }

            return {
                name: endpoint.endpoint.name,
                technical_name: endpoint.endpoint.technical_name,
                type: endpoint.endpoint.type,
                latestUsage: endpoint.use,
                latestQuota: endpoint.quota,
                percentage,
                trend,
                trendPercent,
            };
        })
        .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Get storage summary statistics for KPI display
 */
export function getStorageSummaries(snapshots: QuotaCheckSnapshot[]): StorageSummary[] {
    if (snapshots.length === 0) return [];

    const latestSnapshot = snapshots[snapshots.length - 1];
    const previousSnapshot = snapshots[snapshots.length - 2];

    const summaries: StorageSummary[] = [];

    // Process data storages
    const dataStorages = latestSnapshot?.data?.storages?.data;
    if (dataStorages) {
        // Process PostgreSQL storage
        const postgresStorage = dataStorages.find((s) => s.storage?.type === StorageType.POSTGRESQL);
        if (postgresStorage) {
            const prevStorage = previousSnapshot?.data?.storages?.data?.find((s) => s.storage?.type === StorageType.POSTGRESQL);

            const usageMB = bytesToMB(postgresStorage.use);
            const quotaMB = bytesToMB(postgresStorage.quota);
            const percentage = calculatePercentage(postgresStorage.use, postgresStorage.quota);
            const prevUsageMB = prevStorage ? bytesToMB(prevStorage.use) : usageMB;

            let trend: "up" | "down" | "stable" = "stable";
            let trendPercent = 0;

            if (usageMB > prevUsageMB) {
                trend = "up";
                trendPercent = Math.round((usageMB - prevUsageMB) * 100) / 100;
            } else if (usageMB < prevUsageMB) {
                trend = "down";
                trendPercent = Math.round((prevUsageMB - usageMB) * 100) / 100;
            }

            summaries.push({
                name: postgresStorage.storage.name,
                type: `${postgresStorage.storage.type} (Data)`,
                latestUsage: usageMB,
                latestQuota: quotaMB,
                percentage,
                trend,
                trendPercent,
            });
        }

        // Process S3 Data storage
        const s3DataStorage = dataStorages.find((s) => s.storage?.type === StorageType.S3);
        if (s3DataStorage) {
            const prevStorage = previousSnapshot?.data?.storages?.data?.find((s) => s.storage?.type === StorageType.S3);

            const usageMB = bytesToMB(s3DataStorage.use);
            const quotaMB = bytesToMB(s3DataStorage.quota);
            const percentage = calculatePercentage(s3DataStorage.use, s3DataStorage.quota);
            const prevUsageMB = prevStorage ? bytesToMB(prevStorage.use) : usageMB;

            let trend: "up" | "down" | "stable" = "stable";
            let trendPercent = 0;

            if (usageMB > prevUsageMB) {
                trend = "up";
                trendPercent = Math.round((usageMB - prevUsageMB) * 100) / 100;
            } else if (usageMB < prevUsageMB) {
                trend = "down";
                trendPercent = Math.round((prevUsageMB - usageMB) * 100) / 100;
            }

            summaries.push({
                name: s3DataStorage.storage.name,
                type: `${s3DataStorage.storage.type} (Data)`,
                latestUsage: usageMB,
                latestQuota: quotaMB,
                percentage,
                trend,
                trendPercent,
            });
        }
    }

    // Process uploads storage
    const uploadsStorage = latestSnapshot?.data?.storages?.uploads;
    if (uploadsStorage) {
        const storage = uploadsStorage;
        const prevStorage = previousSnapshot?.data?.storages?.uploads;

        const usageMB = bytesToMB(storage.use);
        const quotaMB = bytesToMB(storage.quota);
        const percentage = calculatePercentage(storage.use, storage.quota);
        const prevUsageMB = prevStorage ? bytesToMB(prevStorage.use) : usageMB;

        let trend: "up" | "down" | "stable" = "stable";
        let trendPercent = 0;

        if (usageMB > prevUsageMB) {
            trend = "up";
            trendPercent = Math.round((usageMB - prevUsageMB) * 100) / 100;
        } else if (usageMB < prevUsageMB) {
            trend = "down";
            trendPercent = Math.round((prevUsageMB - usageMB) * 100) / 100;
        }

        summaries.push({
            name: "Upload Storage",
            type: "S3 (Uploads)",
            latestUsage: usageMB,
            latestQuota: quotaMB,
            percentage,
            trend,
            trendPercent,
        });
    }

    // Process annexes storage
    const annexesStorage = latestSnapshot?.data?.storages?.annexes;
    if (annexesStorage) {
        const storage = annexesStorage;
        const prevStorage = previousSnapshot?.data?.storages?.annexes;

        const usageMB = bytesToMB(storage.use);
        const quotaMB = bytesToMB(storage.quota);
        const percentage = calculatePercentage(storage.use, storage.quota);
        const prevUsageMB = prevStorage ? bytesToMB(prevStorage.use) : usageMB;

        let trend: "up" | "down" | "stable" = "stable";
        let trendPercent = 0;

        if (usageMB > prevUsageMB) {
            trend = "up";
            trendPercent = Math.round((usageMB - prevUsageMB) * 100) / 100;
        } else if (usageMB < prevUsageMB) {
            trend = "down";
            trendPercent = Math.round((prevUsageMB - usageMB) * 100) / 100;
        }

        summaries.push({
            name: "Annexes Storage",
            type: "S3 (Annexes)",
            latestUsage: usageMB,
            latestQuota: quotaMB,
            percentage,
            trend,
            trendPercent,
        });
    }

    return summaries.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Get highest usage endpoints for quick stats
 */
export function getHighestUsageEndpoints(snapshots: QuotaCheckSnapshot[], limit: number = 3): EndpointSummary[] {
    return getEndpointSummaries(snapshots).slice(0, limit);
}

/**
 * Format ISO timestamp to readable format (HH:mm:ss)
 */
export function formatTimestamp(isoTimestamp: string): string {
    try {
        const date = new Date(isoTimestamp);
        return date.toLocaleTimeString("fr-FR", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    } catch {
        return isoTimestamp;
    }
}

/**
 * Format ISO timestamp to full date-time (YYYY-MM-DD HH:mm:ss)
 */
export function formatFullTimestamp(isoTimestamp: string): string {
    try {
        const date = new Date(isoTimestamp);
        return date.toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    } catch {
        return isoTimestamp;
    }
}

/**
 * Get the time span of quota data (earliest to latest)
 */
export function getQuotaDataTimeSpan(snapshots: QuotaCheckSnapshot[]): { start: string; end: string; duration: string } | null {
    if (snapshots.length < 2) return null;

    const start = snapshots[0].timestamp;
    const end = snapshots[snapshots.length - 1].timestamp;

    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const durationMs = endDate - startDate;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    let durationStr = "";
    if (hours > 0) durationStr += `${hours}h `;
    if (minutes > 0) durationStr += `${minutes}m`;

    return {
        start: formatFullTimestamp(start),
        end: formatFullTimestamp(end),
        duration: durationStr.trim(),
    };
}

/**
 * Get color for percentage-based visualization
 */
export function getColorForPercentage(percentage: number): string {
    if (percentage >= 75) return "#d32f2f"; // Red
    if (percentage >= 50) return "#f57c00"; // Orange
    return "#388e3c"; // Green
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}
