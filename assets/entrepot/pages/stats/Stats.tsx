import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { HitStatisticsDto } from "@/@types/stats";
import DatePicker from "@/components/Input/DatePicker";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";
import DynamicParamSelector from "./DynamicParamSelector";
import StatsBarChart from "./StatsBarChart";
import { statsConfig } from "./statsConfig";

function dateStripTime(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export default function Stats() {
    const config = statsConfig;
    const entityTypeKeys = Object.keys(config);

    const [entityTypeKey, setEntityTypeKey] = useState(entityTypeKeys[0]);
    const [resolvedParams, setResolvedParams] = useState<Record<string, string>>({});

    type Shortcut = "3m" | "6m" | "1an";
    const [selectedShortcut, setSelectedShortcut] = useState<Shortcut | null>(null);

    const [startDate, setStartDate] = useState<Date | undefined>(() => {
        const d = new Date();
        d.setMonth(0, 1);
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

    const handleShortcut = (shortcut: Shortcut) => {
        const today = dateStripTime(new Date());
        const start = new Date(today);
        if (shortcut === "3m") start.setMonth(start.getMonth() - 3);
        else if (shortcut === "6m") start.setMonth(start.getMonth() - 6);
        else start.setFullYear(start.getFullYear() - 1);
        setStartDate(start);
        setEndDate(today);
        setSelectedShortcut(shortcut);
    };

    const handleStartDateChange = (value: Date | undefined) => {
        setSelectedShortcut(null);
        if (!value) {
            setStartDate(undefined);
            return;
        }
        const d = dateStripTime(value);
        setStartDate(endDate && d > endDate ? endDate : d);
    };

    const handleEndDateChange = (value: Date | undefined) => {
        setSelectedShortcut(null);
        if (!value) {
            setEndDate(undefined);
            return;
        }
        const today = dateStripTime(new Date());
        let d = dateStripTime(value);
        if (d > today) d = today;
        if (startDate && d < startDate) d = startDate;
        setEndDate(d);
    };

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
        <Main
            title="Statistiques"
            classes={{
                container: fr.cx("fr-container", "fr-mb-4v"),
            }}
        >
            <h1>Statistiques</h1>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <Select
                        label="Type d'entité"
                        options={entityTypeOptions.filter((option) => !option.disabled)}
                        nativeSelectProps={{
                            value: entityTypeKey,
                            onChange: (e) => handleEntityTypeChange(e.currentTarget.value),
                        }}
                    />
                </div>

                {currentConfig.params.map((param) => (
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")} key={param.key}>
                        <DynamicParamSelector
                            key={param.key}
                            param={param}
                            resolvedDeps={resolvedParams}
                            value={resolvedParams[param.key]}
                            onChange={handleParamChange}
                        />
                    </div>
                ))}
            </div>

            {allParamsResolved && (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--middle")}>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                            <DatePicker
                                label="Début"
                                value={startDate}
                                onChange={handleStartDateChange}
                                state={!startDate ? "error" : "default"}
                                stateRelatedMessage={!startDate ? "Veuillez sélectionner une date" : ""}
                                disableFuture
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                            <DatePicker
                                label="Fin"
                                value={endDate}
                                onChange={handleEndDateChange}
                                state={!endDate ? "error" : "default"}
                                stateRelatedMessage={!endDate ? "Veuillez sélectionner une date" : ""}
                                disableFuture
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                            {(
                                [
                                    { key: "3m", label: "3 mois" },
                                    { key: "6m", label: "6 mois" },
                                    { key: "1an", label: "1 an" },
                                ] as { key: Shortcut; label: string }[]
                            ).map(({ key, label }) => (
                                <Tag
                                    key={key}
                                    nativeButtonProps={{
                                        onClick: () => handleShortcut(key),
                                    }}
                                    className={fr.cx("fr-mr-1v")}
                                    pressed={selectedShortcut === key}
                                >
                                    {label}
                                </Tag>
                            ))}
                        </div>
                    </div>

                    <div className={fr.cx("fr-py-3v")}>
                        {currentConfig.disabled ? (
                            <p className={fr.cx("fr-m-0")}>{currentConfig.disabledReason ?? "Ce type d'entité n'est pas encore disponible."}</p>
                        ) : statsQuery.isLoading ? (
                            <LoadingText withSpinnerIcon as="p" />
                        ) : statsQuery.data !== undefined ? (
                            <StatsBarChart stats={statsQuery.data} startDate={startDate} endDate={endDate} />
                        ) : (
                            <p className={fr.cx("fr-m-0")}>Pas de données</p>
                        )}
                    </div>
                </>
            )}
        </Main>
    );
}
