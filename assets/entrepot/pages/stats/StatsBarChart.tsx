import { fr } from "@codegouvfr/react-dsfr";

import { HitStatisticsDto, StatsAggregation, StatsType } from "@/@types/stats";
import { IUseBarChartOptions } from "@/hooks/useBarChart";
import Chart from "@/pages/Chart";
import { niceBytes } from "@/utils";

interface StatsBarChartProps {
    stats: HitStatisticsDto;
    startDate?: Date;
    endDate?: Date;
}
export default function StatsBarChart(props: StatsBarChartProps) {
    const { stats, startDate, endDate } = props;

    const chartProps: IUseBarChartOptions = { aggregation: StatsAggregation.DAY, data: stats, type: StatsType.DATA_TRANSFERT, startDate, endDate };

    if (!stats.total?.begin_date) {
        return <p className={fr.cx("fr-m-0")}>Aucune donnée trouvée</p>;
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

                <Chart {...chartProps} type={StatsType.DATA_TRANSFERT} name={["Volume de données transférées"]} />
                <Chart {...chartProps} type={StatsType.HITS} name={["Nombre de hits"]} color={["blue-cumulus"]} />
            </div>
        </div>
    );
}
