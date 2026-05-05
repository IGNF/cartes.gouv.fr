import { HitStatisticsDto, IBarChartData, Stats, StatsType } from "@/@types/stats";
import { delta } from "./delta";
import { formatDate } from "./format";

const DAY_MS = delta.hours(24);

export function formatStats(stats: HitStatisticsDto): Stats {
    return {
        total: {
            ...stats.total,
            begin_date: stats.total?.begin_date ? new Date(stats.total.begin_date) : undefined,
            end_date: stats.total?.end_date ? new Date(stats.total.end_date) : undefined,
        },
        details:
            stats.details?.map((detail) => ({
                ...detail,
                begin_date: detail.begin_date ? new Date(detail.begin_date) : undefined,
                end_date: detail.end_date ? new Date(detail.end_date) : undefined,
            })) ?? [],
    };
}

export function getDate(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatBarChartData(data: Stats, type = StatsType.DATA_TRANSFER, startDate?: Date, endDate?: Date): IBarChartData {
    const dataEntries: [number, number][] = data.details
        .map((detail) => {
            const date = detail.begin_date ? getDate(detail.begin_date) : undefined;
            return [date, detail[type]];
        })
        .filter(([date, detail]) => date !== undefined && detail !== undefined) as [number, number][];
    const dataMap = new Map(dataEntries);

    const startTime = startDate ? startDate.getTime() : dataEntries.at(0)?.[0];
    const endTime = endDate ? endDate.getTime() : dataEntries.at(-1)?.[0];
    if (!endTime || !startTime) {
        return { x: [[]], y: [[]] };
    }

    const range = (endTime - startTime) / DAY_MS + (endDate ? 0 : 1);
    const dates = Array.from({ length: range }, (_, i) => new Date(startTime + i * DAY_MS));
    const x = dates.map((date) => formatDate(date));
    const y = dates.map((date) => dataMap.get(date.getTime()) ?? 0);

    return { x: [x], y: [y] };
}
