// generated
export interface HitsDto {
    /** @format date-time */
    begin_date?: string;
    /** @format date-time */
    end_date?: string;
    /** @format int64 */
    data_transfer?: number;
    /** @format int64 */
    hits?: number;
}

export interface HitStatisticsDto {
    total?: HitsDto;
    details?: HitsDto[];
}
// generated

export interface StatsRequestDto {
    start?: string;
    end?: string;
    details?: boolean;
    page?: number;
    limit?: number;
}

export interface StatsHits extends Omit<HitsDto, "begin_date" | "end_date"> {
    begin_date?: Date;
    end_date?: Date;
    // data_transfer?: number;
    // hits?: number;
}

export interface Stats {
    total: StatsHits;
    details: StatsHits[];
}

export interface IBarChartData {
    x: [string[]];
    y: [number[]];
}

export enum StatsType {
    DATA_TRANSFERT = "data_transfer",
    HITS = "hits",
}

export enum StatsAggregation {
    DAY = 24 * 60 * 60 * 1000, // 1 day
    MINUTES = 5 * 60 * 1000, // 5 minutes
}

export enum StatsDataRange {
    MONTH = "month",
    DAY = "day",
    PAGINATED = "paginated",
}
