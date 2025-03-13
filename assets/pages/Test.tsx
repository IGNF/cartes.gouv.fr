import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import { fr } from "@codegouvfr/react-dsfr";

import Main from "@/components/Layout/Main";
import { HitStatisticsDto, StatsAggregation, StatsType } from "@/@types/stats";

import dataMonth from "./stats-month.json";
import dataDay from "./stats-day.json";
import dataDay1 from "./stats-day-1.json";
import dataDay2 from "./stats-day-2.json";
import dataDay3 from "./stats-day-3.json";
import dataDay4 from "./stats-day-4.json";
import dataDay5 from "./stats-day-5.json";
import Chart from "./Chart";

// const dataRangeOptions = Object.entries(StatsAggregation)
//     .filter(([, value]) => typeof value === "number")
//     .map(([key, value]) => ({ value: String(value), label: key }));
const dataRangeOptions = [
    { value: "month", label: "Février 2025" },
    { value: "day", label: "3 mars 2025" },
    { value: "paginated", label: "3 mars 2025 paginée" },
];
const dataTypeOptions = Object.entries(StatsType).map(([key, value]) => ({ value, label: key }));

function delay(data: HitStatisticsDto): Promise<HitStatisticsDto> {
    return new Promise((resolve) => setTimeout(() => resolve(data), 500));
}

export default function Test() {
    const [dataRange, setDataRange] = useState("month");
    const [dataType, setDataType] = useState(StatsType.DATA_TRANSFERT);
    const [page, setPage] = useState(1);

    const { data } = useQuery<HitStatisticsDto>({
        queryKey: ["test", dataRange, page],
        queryFn: () => {
            if (dataRange === "month") {
                return delay(dataMonth);
            } else if (dataRange === "day") {
                return delay(dataDay);
            } else if (page === 1) {
                return delay(dataDay1);
            } else if (page === 2) {
                return delay(dataDay2);
            } else if (page === 3) {
                return delay(dataDay3);
            } else if (page === 4) {
                return delay(dataDay4);
            }
            return delay(dataDay5);
        },
    });

    const chartProps = useMemo(() => {
        if (!data) {
            return null;
        }
        if (dataRange === "month") {
            return {
                aggregation: StatsAggregation.DAY,
                data,
                endDate: new Date(2025, 2, 1),
                startDate: new Date(2025, 1, 1),
                type: dataType,
            };
        }
        if (dataRange === "paginated") {
            return { aggregation: StatsAggregation.MINUTES, data, page, totalPage: 5, type: dataType };
        }
        return { aggregation: StatsAggregation.MINUTES, data, type: dataType };
    }, [data, dataRange, dataType, page]);

    function onDateRangeChange(event) {
        setDataRange(event.target.value);
        setPage(1);
    }

    function onDateTypeChange(event) {
        setDataType(event.target.value as StatsType);
    }

    return (
        <Main title="Test">
            <Select
                label="Data"
                options={dataRangeOptions}
                nativeSelectProps={{
                    value: String(dataRange),
                    onChange: onDateRangeChange,
                }}
            />
            <Select
                label="Type"
                options={dataTypeOptions}
                nativeSelectProps={{
                    value: dataType,
                    onChange: onDateTypeChange,
                }}
            />
            {!chartProps ? <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon={true} /> : <Chart {...chartProps} onPageChange={setPage} />}
        </Main>
    );
}
