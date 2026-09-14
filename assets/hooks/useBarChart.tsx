import { useEffect, useMemo, useRef, useState } from "react";
import { BarChartProps } from "@codegouvfr/react-dsfr/Chart/BarChart";

import { HitStatisticsDto, StatsType } from "@/@types/stats";
import { aggregateByUtcDay, toBarChartData } from "@/utils/stats";

export interface IUseBarChartOptions extends Omit<BarChartProps, "x" | "y"> {
    data: HitStatisticsDto;
    type?: StatsType;
    startDate?: Date;
    endDate?: Date;
}

export function useBarChart(options: IUseBarChartOptions) {
    const { data, type = StatsType.DATA_TRANSFER, startDate, endDate, ...rest } = options;
    const ref = useRef<HTMLDivElement>(null);
    const [barsize, setBarsize] = useState(24);
    const series = useMemo(() => aggregateByUtcDay(data, type, startDate, endDate), [data, type, startDate, endDate]);
    const barChartProps = useMemo(() => toBarChartData(series), [series]);
    const totalItems = series.days.length;

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const computeBarSize = (width: number) => {
            if (!totalItems) return;
            const barSize = Math.max(Math.floor(width / totalItems) - 4, 2);
            setBarsize(barSize < 24 ? barSize : 24);
        };

        const observer = new ResizeObserver(([entry]) => {
            computeBarSize(entry.contentRect.width);
        });

        observer.observe(element);
        computeBarSize(element.getBoundingClientRect().width);

        return () => observer.disconnect();
    }, [totalItems]);

    return { barChartProps: { ...rest, ...barChartProps, barsize }, series, type, ref };
}
