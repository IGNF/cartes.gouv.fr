import { fr } from "@codegouvfr/react-dsfr";

import { HitStatisticsDto, StatsType } from "@/@types/stats";
import { IUseBarChartOptions } from "@/hooks/useBarChart";
import Chart from "@/pages/Chart";
import { niceBytes } from "@/utils";
import { useTranslation } from "@/i18n";

interface StatsBarChartProps {
    stats: HitStatisticsDto;
    startDate?: Date;
    endDate?: Date;
}
export default function StatsBarChart(props: StatsBarChartProps) {
    const { stats, startDate, endDate } = props;
    const chartProps: IUseBarChartOptions = { data: stats, type: StatsType.DATA_TRANSFER, startDate, endDate };

    const { t } = useTranslation("Stats");

    if (!stats.total?.begin_date) {
        return <p className={fr.cx("fr-m-0")}>Aucune donnée trouvée</p>;
    }

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col")}>
                <ul className={fr.cx("fr-raw-list", "fr-mb-4v")}>
                    <li>
                        <strong>{t("data_type", { type: StatsType.DATA_TRANSFER })}</strong> :{" "}
                        {stats.total?.data_transfer ? niceBytes(stats.total?.data_transfer.toString()) : "inconnu"}
                    </li>
                    <li>
                        <strong>{t("data_type", { type: StatsType.HITS })}</strong> : {stats.total?.hits}
                    </li>
                </ul>

                <Chart {...chartProps} name={[t("data_type", { type: StatsType.DATA_TRANSFER })]} className={fr.cx("fr-mb-4v")} />
                <Chart {...chartProps} type={StatsType.HITS} name={[t("data_type", { type: StatsType.HITS })]} color={["blue-cumulus"]} />
            </div>
        </div>
    );
}
