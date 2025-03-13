import { HitStatisticsDto, IBarChartData, Stats, StatsAggregation, StatsType } from "@/@types/stats";

import { formatDate, formatDateTime } from "./format";

export function formatStats(stats: HitStatisticsDto): Stats {
    return {
        total: {
            ...stats.total,
            begin_date: new Date(stats.total.begin_date),
            end_date: new Date(stats.total.end_date),
        },
        details: stats.details.map((detail) => ({
            ...detail,
            begin_date: new Date(detail.begin_date),
            end_date: new Date(detail.end_date),
        })),
    };
}

export function getDate(date: Date, aggregation = StatsAggregation.DAY): number {
    if (aggregation === StatsAggregation.DAY) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), Math.floor(date.getMinutes() / 5) * 5).getTime();
}

export function formatBarChartData(
    data: Stats,
    type = StatsType.DATA_TRANSFERT,
    aggregation = StatsAggregation.DAY,
    startDate?: Date,
    endDate?: Date
): IBarChartData {
    const dataEntries: [number, number][] = data.details.map((detail) => {
        const date = getDate(detail.begin_date, aggregation);
        return [date, detail[type]];
    });
    const dataMap = new Map(dataEntries);

    const startTime = startDate ? startDate.getTime() : dataEntries.at(0)?.[0];
    const endTime = endDate ? endDate.getTime() : dataEntries.at(-1)?.[0];
    if (!endTime || !startTime) {
        return { x: [[]], y: [[]] };
    }

    const range = (endTime - startTime) / aggregation + (endDate ? 0 : 1);
    const dates = Array.from({ length: range }, (_, i) => new Date(startTime + i * aggregation));
    const x = dates.map((date) => (aggregation === StatsAggregation.DAY ? formatDate(date) : formatDateTime(date)));
    const y = dates.map((date) => dataMap.get(date.getTime()) ?? 0);

    return { x: [x], y: [y] };
}
