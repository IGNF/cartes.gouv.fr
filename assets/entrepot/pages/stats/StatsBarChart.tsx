import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useMemo, useState } from "react";

import { HitStatisticsDto, StatsAggregation, StatsType } from "@/@types/stats";
import LoadingText from "@/components/Utils/LoadingText";
import { IUseBarChartOptions } from "@/hooks/useBarChart";
import Chart from "@/pages/Chart";

interface StatsBarChartProps {
    stats?: HitStatisticsDto;
    startDate?: Date;
    endDate?: Date;
}
export default function StatsBarChart(props: StatsBarChartProps) {
    const { stats, startDate, endDate } = props;

    const [dataType, setDataType] = useState(StatsType.DATA_TRANSFERT);

    const chartProps: IUseBarChartOptions | null = useMemo(() => {
        if (!stats) {
            return null;
        }
        return { aggregation: StatsAggregation.DAY, data: stats, type: dataType, startDate, endDate };
    }, [stats, dataType, startDate, endDate]);

    if (!stats) {
        return <div>Pas de données</div>;
    }

    return (
        <div>
            <Select
                label="Type de données"
                options={[
                    { label: "Volume de données transférées", value: StatsType.DATA_TRANSFERT },
                    { label: "Nombre de hits", value: StatsType.HITS },
                ]}
                nativeSelectProps={{
                    value: dataType,
                    onChange: (e) => setDataType(e.currentTarget.value as StatsType),
                }}
            />

            {!chartProps ? (
                <LoadingText className={fr.cx("fr-ml-2w")} withSpinnerIcon as="p" />
            ) : (
                <Chart {...chartProps} name={[dataType === StatsType.DATA_TRANSFERT ? "Volume de données transférées" : "Nombre de hits"]} />
            )}
        </div>
    );
}
