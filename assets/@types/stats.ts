export interface StatsRequestDto {
    start: string;
    end: string;
    details: boolean;
    page: number;
    limit: number;
}

export interface HitsDto {
    begin_date: string;
    end_date: string;
    data_transfer: number;
    hits: number;
}

export interface HitStatisticsDto {
    total: HitsDto;
    details: HitsDto[];
}

export interface StatsHits {
    begin_date: Date;
    end_date: Date;
    data_transfer: number;
    hits: number;
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
