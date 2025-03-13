import { useEffect, useMemo, useRef, useState } from "react";
import { BarChartProps } from "@codegouvfr/react-dsfr/Chart/BarChart";

import { HitStatisticsDto, StatsAggregation, StatsType } from "@/@types/stats";
import { formatBarChartData, formatStats } from "@/utils/stats";

export interface IUseBarChartOptions extends Omit<BarChartProps, "x" | "y"> {
    data: HitStatisticsDto;
    type?: StatsType;
    aggregation?: StatsAggregation;
    startDate?: Date;
    endDate?: Date;
}

export function useBarChart(options: IUseBarChartOptions) {
    const { data, type = StatsType.DATA_TRANSFERT, aggregation = StatsAggregation.DAY, startDate, endDate, ...rest } = options;
    const ref = useRef<HTMLDivElement>(null);
    const [barsize, setBarsize] = useState(24);
    const barChartProps = useMemo(
        () => formatBarChartData(formatStats(data), type, aggregation, startDate, endDate),
        [data, type, aggregation, startDate, endDate]
    );
    const totalItems = barChartProps.x[0].length;

    useEffect(() => {
        const element = ref.current;
        if (element && totalItems) {
            const { width } = element.getBoundingClientRect();
            const barSize = Math.max(Math.floor(width / totalItems) - 4, 2);
            if (barSize < 24) {
                setBarsize(barSize);
            } else {
                setBarsize(24);
            }
        }
    }, [totalItems]);

    return { barChartProps: { ...rest, ...barChartProps, barsize }, ref };
}
