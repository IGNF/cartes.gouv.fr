import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { HitStatisticsDto } from "@/@types/stats";
import DatePicker from "@/components/Input/DatePicker";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";
import DynamicParamSelector from "./DynamicParamSelector";
import StatsBarChart from "./StatsBarChart";
import { buildStatsConfig } from "./statsConfig";

function dateStripTime(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function Stats() {
    const { datastoreList } = useDatastoreSelection();

    const config = useMemo(() => buildStatsConfig(datastoreList), [datastoreList]);
    const entityTypeKeys = Object.keys(config);

    const [entityTypeKey, setEntityTypeKey] = useState(entityTypeKeys[0]);
    const [resolvedParams, setResolvedParams] = useState<Record<string, string>>({});

    const [startDate, setStartDate] = useState<Date | undefined>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        return dateStripTime(d);
    });
    const [endDate, setEndDate] = useState<Date | undefined>(() => dateStripTime(new Date()));

    const currentConfig = config[entityTypeKey];

    const handleEntityTypeChange = (key: string) => {
        setEntityTypeKey(key);
        setResolvedParams({});
    };

    const handleParamChange = useCallback(
        (key: string, value: string) => {
            setResolvedParams((prev) => {
                const keysToReset = currentConfig.params.filter((p) => p.dependsOn?.includes(key)).map((p) => p.key);
                const next = { ...prev, [key]: value };
                keysToReset.forEach((k) => delete next[k]);
                return next;
            });
        },
        [currentConfig]
    );

    const allParamsResolved = currentConfig.params.every((p) => !!resolvedParams[p.key]);

    const dateQuery = useMemo(
        () => ({
            start: startDate?.toISOString(),
            end: endDate?.toISOString(),
            details: true,
        }),
        [startDate, endDate]
    );

    const statsQuery = useQuery({
        queryKey: ["stats", entityTypeKey, currentConfig.apiRoute, resolvedParams, dateQuery],
        queryFn: ({ signal }) => {
            const url = SymfonyRouting.generate(currentConfig.apiRoute, { ...resolvedParams, ...dateQuery });
            return jsonFetch<HitStatisticsDto>(url, { signal });
        },
        enabled: !currentConfig.disabled && allParamsResolved && !!startDate && !!endDate,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });

    const entityTypeOptions = entityTypeKeys.map((key) => ({
        value: key,
        label: config[key].disabled ? `${config[key].label} (non disponible)` : config[key].label,
        disabled: config[key].disabled,
    }));

    return (
        <Main title="Statistiques">
            <h1>Statistiques</h1>

            <Select
                label="Type d'entité"
                options={entityTypeOptions.filter((option) => !option.disabled)}
                nativeSelectProps={{
                    value: entityTypeKey,
                    onChange: (e) => handleEntityTypeChange(e.currentTarget.value),
                }}
            />

            {currentConfig.params.map((param) => (
                <DynamicParamSelector
                    key={param.key}
                    param={param}
                    resolvedDeps={resolvedParams}
                    value={resolvedParams[param.key]}
                    onChange={handleParamChange}
                />
            ))}

            <div style={{ display: "flex", gap: fr.spacing("4v") }}>
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

            {currentConfig.disabled ? (
                <p className={fr.cx("fr-mt-2w")}>{currentConfig.disabledReason ?? "Ce type d'entité n'est pas encore disponible."}</p>
            ) : statsQuery.isLoading ? (
                <LoadingText className={fr.cx("fr-ml-2w")} withSpinnerIcon as="p" />
            ) : statsQuery.data !== undefined ? (
                <StatsBarChart stats={statsQuery.data} startDate={startDate} endDate={endDate} />
            ) : (
                "Pas de données"
            )}
        </Main>
    );
}
