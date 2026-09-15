import { afterEach, describe, expect, it, vi } from "vitest";

import { HitsDto, HitStatisticsDto, StatsType } from "@/@types/stats";
import { aggregateByUtcDay, calendarDayToUtc, formatStatValue, listUtcDays, statsPeriodQuery, utcDayKey } from "./stats";

// Node relit TZ à chaud : les tests s’exécutent comme un navigateur à Paris, sauf mention contraire.
const DEFAULT_TZ = "Europe/Paris";
vi.stubEnv("TZ", DEFAULT_TZ);

function inTimeZone<T>(tz: string, fn: () => T): T {
    vi.stubEnv("TZ", tz);
    try {
        return fn();
    } finally {
        vi.stubEnv("TZ", DEFAULT_TZ);
    }
}

function row(beginIso: string, hits: number, dataTransfer = hits * 1000): HitsDto {
    return { begin_date: beginIso, end_date: beginIso, hits, data_transfer: dataTransfer };
}

// Une ligne par jour UTC, begin_date au premier hit du jour (jamais minuit exact, comme l’API).
function dailyRows(firstDay: string, lastDay: string): HitsDto[] {
    const rows: HitsDto[] = [];
    const start = new Date(`${firstDay}T00:00:00.000Z`);
    const end = new Date(`${lastDay}T00:00:00.000Z`);
    for (let i = 0; ; i++) {
        const day = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
        if (day > end) break;
        rows.push(row(`${utcDayKey(day)}T00:04:55.771Z`, 100 + i));
    }
    return rows;
}

function stats(details: HitsDto[]): HitStatisticsDto {
    const hits = details.reduce((acc, r) => acc + (r.hits ?? 0), 0);
    const data_transfer = details.reduce((acc, r) => acc + (r.data_transfer ?? 0), 0);
    return { total: { begin_date: details[0]?.begin_date, end_date: details.at(-1)?.end_date, hits, data_transfer }, details };
}

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

describe("calendarDayToUtc / utcDayKey", () => {
    it("convertit un jour calendaire local en minuit UTC du même jour", () => {
        const utc = calendarDayToUtc(new Date(2026, 2, 27));
        expect(utc.toISOString()).toBe("2026-03-27T00:00:00.000Z");
        expect(utcDayKey(utc)).toBe("2026-03-27");
    });
});

describe("statsPeriodQuery", () => {
    it("inclut le jour de fin : end est le lendemain à minuit UTC", () => {
        expect(statsPeriodQuery(new Date(2026, 0, 14), new Date(2026, 8, 14))).toEqual({
            start: "2026-01-14T00:00:00.000Z",
            end: "2026-09-15T00:00:00.000Z",
        });
    });
});

describe("listUtcDays", () => {
    it("énumère des jours consécutifs à travers le passage à l’heure d’été", () => {
        expect(listUtcDays(new Date(2026, 2, 27), new Date(2026, 3, 1))).toEqual([
            "2026-03-27",
            "2026-03-28",
            "2026-03-29",
            "2026-03-30",
            "2026-03-31",
            "2026-04-01",
        ]);
    });
});

describe("aggregateByUtcDay", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("remplit chaque jour d’une période contenant le 29 mars 2026", () => {
        const data = stats(dailyRows("2026-01-14", "2026-09-13"));
        const series = aggregateByUtcDay(data, StatsType.HITS, new Date(2026, 0, 14), new Date(2026, 8, 13));

        expect(series.days).toHaveLength(243);
        expect(series.values.every((v) => v > 0)).toBe(true);
        expect(sum(series.values)).toBe(data.total?.hits);
    });

    it("remplit chaque jour d’une période contenant le 25 octobre 2026", () => {
        const data = stats(dailyRows("2026-10-20", "2026-10-30"));
        const series = aggregateByUtcDay(data, StatsType.DATA_TRANSFER, new Date(2026, 9, 20), new Date(2026, 9, 30));

        expect(series.days).toHaveLength(11);
        expect(series.values.every((v) => v > 0)).toBe(true);
        expect(sum(series.values)).toBe(data.total?.data_transfer);
    });

    it("somme les tranches de 5 minutes par jour", () => {
        const details: HitsDto[] = [];
        for (const day of ["2026-09-01", "2026-09-02"]) {
            for (let minute = 0; minute < 24 * 60; minute += 5) {
                const h = String(Math.floor(minute / 60)).padStart(2, "0");
                const m = String(minute % 60).padStart(2, "0");
                details.push(row(`${day}T${h}:${m}:09.000Z`, 3));
            }
        }
        const data = stats(details);
        const series = aggregateByUtcDay(data, StatsType.HITS, new Date(2026, 8, 1), new Date(2026, 8, 2));

        expect(series.days).toEqual(["2026-09-01", "2026-09-02"]);
        expect(series.values).toEqual([288 * 3, 288 * 3]);
        expect(sum(series.values)).toBe(data.total?.hits);
    });

    it("met à zéro les jours sans ligne et ignore les lignes hors période", () => {
        const data = stats([row("2026-09-01T00:04:00.000Z", 5), row("2026-09-03T00:04:00.000Z", 7), row("2026-09-09T00:04:00.000Z", 11)]);
        const series = aggregateByUtcDay(data, StatsType.HITS, new Date(2026, 8, 1), new Date(2026, 8, 3));

        expect(series.days).toEqual(["2026-09-01", "2026-09-02", "2026-09-03"]);
        expect(series.values).toEqual([5, 0, 7]);
    });

    it("sans bornes, couvre du premier au dernier jour présent", () => {
        const series = aggregateByUtcDay(stats(dailyRows("2026-05-14", "2026-05-16")), StatsType.HITS);
        expect(series.days).toEqual(["2026-05-14", "2026-05-15", "2026-05-16"]);
    });

    it("donne la même série à Paris et à New York", () => {
        const data = stats(dailyRows("2026-03-20", "2026-04-05"));
        const compute = () => aggregateByUtcDay(data, StatsType.HITS, new Date(2026, 2, 20), new Date(2026, 3, 5));

        expect(inTimeZone("America/New_York", compute)).toEqual(inTimeZone("Europe/Paris", compute));
    });

    it("avertit en dev quand la somme des jours diffère du total", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const data = stats(dailyRows("2026-09-01", "2026-09-03"));
        data.total = { ...data.total, hits: 1 };

        const series = aggregateByUtcDay(data, StatsType.HITS, new Date(2026, 8, 1), new Date(2026, 8, 3));

        expect(series.values).toHaveLength(3);
        expect(warn).toHaveBeenCalledTimes(1);
    });
});

describe("formatStatValue", () => {
    it("formate les appels en nombre et les volumes en octets", () => {
        expect(formatStatValue(1500, StatsType.HITS)).toMatch(/^1.500$/);
        expect(formatStatValue(1500, StatsType.DATA_TRANSFER)).toBe("1.50 KB");
    });
});
