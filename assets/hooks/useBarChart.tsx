import { useEffect, useMemo, useRef, useState } from "react";
import { BarChartProps } from "@codegouvfr/react-dsfr/Chart/BarChart";

import { HitStatisticsDto, StatsType } from "@/@types/stats";
import { formatBarChartData, formatStats } from "@/utils/stats";

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
    const barChartProps = useMemo(() => formatBarChartData(formatStats(data), type, startDate, endDate), [data, type, startDate, endDate]);
    const totalItems = barChartProps.x[0].length;

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

    return { barChartProps: { ...rest, ...barChartProps, barsize }, ref };
}
