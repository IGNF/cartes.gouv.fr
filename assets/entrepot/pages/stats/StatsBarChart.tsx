import { fr } from "@codegouvfr/react-dsfr";
import { useMemo } from "react";

import { HitStatisticsDto, StatsAggregation, StatsType } from "@/@types/stats";
import LoadingText from "@/components/Utils/LoadingText";
import { IUseBarChartOptions } from "@/hooks/useBarChart";
import Chart from "@/pages/Chart";
import { niceBytes } from "@/utils";

interface StatsBarChartProps {
    stats?: HitStatisticsDto;
    startDate?: Date;
    endDate?: Date;
}
export default function StatsBarChart(props: StatsBarChartProps) {
    const { stats, startDate, endDate } = props;

    const dataTransferChartProps: IUseBarChartOptions | null = useMemo(() => {
        if (!stats) {
            return null;
        }
        return { aggregation: StatsAggregation.DAY, data: stats, type: StatsType.DATA_TRANSFERT, startDate, endDate };
    }, [stats, startDate, endDate]);

    const hitsChartProps: IUseBarChartOptions | null = useMemo(() => {
        if (!stats) {
            return null;
        }
        return { aggregation: StatsAggregation.DAY, data: stats, type: StatsType.HITS, startDate, endDate };
    }, [stats, startDate, endDate]);

    if (!stats) {
        return <div>Pas de données</div>;
    }

    if (!stats.total?.begin_date) {
        return <div>Aucune donnée trouvée</div>;
    }

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col")}>
                <ul className={fr.cx("fr-raw-list")}>
                    <li>
                        <strong>Volume de données transférées</strong> :{" "}
                        {stats.total?.data_transfer ? niceBytes(stats.total?.data_transfer.toString()) : "inconnu"}
                    </li>
                    <li>
                        <strong>Nombre de hits</strong> : {stats.total?.hits}
                    </li>
                </ul>

                {!dataTransferChartProps ? (
                    <LoadingText className={fr.cx("fr-ml-2w")} withSpinnerIcon as="p" />
                ) : (
                    <Chart {...dataTransferChartProps} name={["Volume de données transférées"]} />
                )}
                {!hitsChartProps ? (
                    <LoadingText className={fr.cx("fr-ml-2w")} withSpinnerIcon as="p" />
                ) : (
                    <Chart {...hitsChartProps} name={["Nombre de hits"]} color={["blue-cumulus"]} />
                )}
            </div>
        </div>
    );
}
