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

export interface StatsHits extends Omit<HitsDto, "begin_date" | "end_date"> {
    begin_date?: Date;
    end_date?: Date;
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
    DATA_TRANSFER = "data_transfer",
    HITS = "hits",
}
