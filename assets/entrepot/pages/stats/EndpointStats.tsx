import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import DatePicker from "@/components/Input/DatePicker";
import DatastoreMain from "@/components/Layout/DatastoreMain";
import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import StatsBarChart from "./StatsBarChart";
import LoadingText from "@/components/Utils/LoadingText";

function dateStripTime(date: Date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

interface EndpointStatsProps {
    datastoreId: string;
}

export default function EndpointStats(props: EndpointStatsProps) {
    const { datastoreId } = props;

    const { datastore } = useDatastore();
    const endpoints =
        datastore?.endpoints?.sort((a, b) => {
            if (a.endpoint.technical_name.toLowerCase() < b.endpoint.technical_name.toLowerCase()) return -1;
            if (a.endpoint.technical_name.toLowerCase() > b.endpoint.technical_name.toLowerCase()) return 1;
            return 0;
        }) ?? [];

    const [endpointId, setEndpointId] = useState<string | undefined>(endpoints?.[0]?.endpoint._id);

    const [startDate, setStartDate] = useState<Date | undefined>(() => {
        const now = new Date();
        now.setDate(now.getDate() - 90);
        return dateStripTime(now);
    });
    const [endDate, setEndDate] = useState<Date | undefined>(() => dateStripTime(new Date()));

    const query = useMemo(
        () => ({
            start: startDate ? startDate.toISOString() : undefined,
            end: endDate ? endDate.toISOString() : undefined,
            details: true,
        }),
        [startDate, endDate]
    );
    const statsQuery = useQuery({
        queryKey: RQKeys.datastore_endpoint_stats(datastoreId, endpointId ?? "", query),
        queryFn: ({ signal }) => api.datastore.getEndpointStats(datastoreId, endpointId ?? "", query, { signal }),
        enabled: !!endpointId && !!startDate && !!endDate,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });

    const { data } = statsQuery;

    return (
        <DatastoreMain title="Stats" datastoreId={datastoreId}>
            <h1>Statistiques de l’endpoint {endpointId}</h1>

            <Select
                label="Endpoint"
                options={endpoints.map((endpoint) => ({
                    label: endpoint.endpoint.name,
                    value: endpoint.endpoint._id,
                }))}
                nativeSelectProps={{
                    value: endpointId,
                    onChange: (e) => {
                        setEndpointId(e.currentTarget.value);
                    },
                }}
            />

            <div
                style={{
                    display: "flex",
                    gap: fr.spacing("4v"),
                }}
            >
                <DatePicker
                    label="Début"
                    value={startDate}
                    onChange={(value) => setStartDate(value)}
                    state={!startDate ? "error" : "default"}
                    stateRelatedMessage={!startDate ? "Veuillez sélectionner une date" : ""}
                    disableFuture
                />
                <DatePicker
                    label="Fin"
                    value={endDate}
                    onChange={(value) => setEndDate(value)}
                    state={!endDate ? "error" : "default"}
                    stateRelatedMessage={!endDate ? "Veuillez sélectionner une date" : ""}
                    disableFuture
                />
            </div>

            {statsQuery.isLoading ? (
                <LoadingText className={fr.cx("fr-ml-2w")} withSpinnerIcon as="p" />
            ) : (
                <StatsBarChart stats={data} startDate={startDate} endDate={endDate} />
            )}
        </DatastoreMain>
    );
}
