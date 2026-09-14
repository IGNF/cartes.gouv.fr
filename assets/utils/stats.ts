import { HitStatisticsDto, IBarChartData, StatsType } from "@/@types/stats";
import { formatCount, formatDate, niceBytes } from "./format";

/** Jour UTC au format "YYYY-MM-DD". */
export type DayKey = string;

export interface DaySeries {
    days: DayKey[];
    values: number[];
}

// ~20 ans : large pour tout usage légitime
const MAX_RANGE_DAYS = 366 * 20;

// Le sélecteur de dates fournit des Date à minuit local qui représentent un jour calendaire.
export function calendarDayToUtc(day: Date): Date {
    return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
}

export function addCalendarDays(day: Date, n: number): Date {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() + n);
}

export function utcDayKey(date: Date): DayKey {
    return date.toISOString().slice(0, 10);
}

// Bornes envoyées à l’API : start inclus, end exclu, donc fin + 1 jour pour inclure le jour de fin.
export function statsPeriodQuery(startDay: Date, endDay: Date): { start: string; end: string } {
    return {
        start: calendarDayToUtc(startDay).toISOString(),
        end: calendarDayToUtc(addCalendarDays(endDay, 1)).toISOString(),
    };
}

export function listUtcDays(startDay: Date, endDay: Date): DayKey[] {
    const first = calendarDayToUtc(startDay);
    const lastKey = utcDayKey(calendarDayToUtc(endDay));
    const days: DayKey[] = [];

    for (let i = 0; i < MAX_RANGE_DAYS; i++) {
        const key = utcDayKey(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate() + i)));
        if (key > lastKey) break;
        days.push(key);
    }

    return days;
}

function dayKeyToLocalDate(day: DayKey): Date {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/**
 * Somme les lignes par jour UTC de begin_date, quelle que soit la granularité renvoyée par l’API
 * (tranches de quelques minutes sur les courtes périodes, une ligne par jour au-delà).
 * Sans bornes, la série couvre du premier au dernier jour présent dans les lignes.
 */
export function aggregateByUtcDay(stats: HitStatisticsDto, type: StatsType, startDay?: Date, endDay?: Date): DaySeries {
    const sums = new Map<DayKey, number>();
    for (const row of stats.details ?? []) {
        const value = row[type];
        if (!row.begin_date || value === undefined) continue;
        const key = utcDayKey(new Date(row.begin_date));
        sums.set(key, (sums.get(key) ?? 0) + value);
    }

    const sortedKeys = [...sums.keys()].sort();
    const start = startDay ?? (sortedKeys[0] ? dayKeyToLocalDate(sortedKeys[0]) : undefined);
    const end = endDay ?? (sortedKeys.at(-1) ? dayKeyToLocalDate(sortedKeys.at(-1)!) : undefined);
    if (!start || !end) {
        return { days: [], values: [] };
    }

    const days = listUtcDays(start, end);
    const values = days.map((day) => sums.get(day) ?? 0);

    if (import.meta.env.DEV) {
        const total = stats.total?.[type];
        const sum = values.reduce((acc, v) => acc + v, 0);
        if (total !== undefined && sum !== total) {
            console.warn(`Statistiques ${type} : somme des jours ${sum} différente du total ${total}`);
        }
    }

    return { days, values };
}

export function formatDayLabel(day: DayKey): string {
    return formatDate(dayKeyToLocalDate(day));
}

export function toBarChartData(series: DaySeries): IBarChartData {
    return { x: [series.days.map(formatDayLabel)], y: [series.values] };
}

export function formatStatValue(value: number, type: StatsType): string {
    return type === StatsType.HITS ? formatCount(value) : niceBytes(String(value));
}
