import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { HitStatisticsDto } from "@/@types/stats";
import DateRangePicker from "@/components/Input/DateRangePicker";
import Main from "@/components/Layout/Main";
import Skeleton from "@/components/Utils/Skeleton";
import { useTranslation } from "@/i18n";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";
import { routes, useRoute } from "@/router/router";
import DynamicParamSelector from "./DynamicParamSelector";
import StatsBarChart from "./StatsBarChart";
import { statsConfig, StatsScope } from "./statsConfig";

function initDate(offsetMonths = 0): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (offsetMonths) {
        d.setMonth(d.getMonth() - offsetMonths);
    }
    return d;
}

export default function Stats() {
    const { params } = useRoute();
    const scope = params?.["scope"] as StatsScope;

    const { t } = useTranslation("Stats");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const rawScopeConfig = statsConfig[scope];
    const scopeDisabled = rawScopeConfig?.disabled ?? false;
    const scopeConfig = scopeDisabled ? undefined : rawScopeConfig;
    const entities = scopeConfig?.entities ?? {};
    const entityTypeKeys = Object.keys(entities);

    const [entityTypeKey, setEntityTypeKey] = useState(() => entityTypeKeys[0]);
    const [resolvedParams, setResolvedParams] = useState<Record<string, string>>({});

    const [startDate, setStartDate] = useState<Date | undefined>(() => initDate(3));
    const [endDate, setEndDate] = useState<Date | undefined>(() => initDate());

    useEffect(() => {
        setEntityTypeKey(Object.keys(statsConfig[scope]?.disabled ? {} : (statsConfig[scope]?.entities ?? {}))[0]);
        setResolvedParams({});
    }, [scope]);

    const currentConfig = entities[entityTypeKey];

    const handleEntityTypeChange = (key: string) => {
        setEntityTypeKey(key);
        setResolvedParams({});
    };

    const handleParamChange = useCallback(
        (key: string, value: string) => {
            setResolvedParams((prev) => {
                const keysToReset = currentConfig?.params.filter((p) => p.dependsOn?.includes(key)).map((p) => p.key) ?? [];
                const next = { ...prev, [key]: value };
                keysToReset.forEach((k) => delete next[k]);
                return next;
            });
        },
        [currentConfig]
    );

    const allParamsResolved = !!currentConfig && currentConfig.params.every((p) => !!resolvedParams[p.key]);

    const dateQuery = useMemo(
        () => ({
            start: startDate?.toISOString(),
            end: endDate?.toISOString(),
            details: true,
        }),
        [startDate, endDate]
    );

    const statsQuery = useQuery({
        queryKey: [scope, entityTypeKey, "stats", currentConfig?.apiRoute, resolvedParams, dateQuery],
        queryFn: ({ signal }) => {
            const url = SymfonyRouting.generate(currentConfig!.apiRoute, { ...resolvedParams, ...dateQuery });
            return jsonFetch<HitStatisticsDto>(url, { signal });
        },
        enabled: !!currentConfig && allParamsResolved && !!startDate && !!endDate,
        refetchOnWindowFocus: false,
    });

    const entityTypeOptions = entityTypeKeys.map((key) => ({
        value: key,
        label: entities[key].label,
    }));

    return (
        <Main
            title={t("scope_title", { scope: scope })}
            classes={{
                container: fr.cx("fr-container", "fr-mb-4v"),
            }}
            customBreadcrumbProps={{
                homeLinkProps: routes.dashboard().link,
                segments: [
                    {
                        label: tBreadcrumb("discover_publish"),
                        linkProps: routes.discover_publish().link,
                    },
                    {
                        label: tBreadcrumb("stats_scope_selection"),
                        linkProps: routes.stats_scope_selection().link,
                    },
                ],
                currentPageLabel: scopeConfig?.label ?? "",
            }}
        >
            <h1>{t("scope_title", { scope: scope })}</h1>

            {!currentConfig ? (
                <p className={fr.cx("fr-m-0")}>Aucune statistique disponible pour ce périmètre.</p>
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        {entityTypeKeys.length > 1 && (
                            <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                                <Select
                                    label="Type d'entité"
                                    options={entityTypeOptions}
                                    nativeSelectProps={{
                                        value: entityTypeKey,
                                        onChange: (e) => handleEntityTypeChange(e.currentTarget.value),
                                    }}
                                />
                            </div>
                        )}

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
                            <DateRangePicker
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(start, end) => {
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                            />

                            <div className={fr.cx("fr-py-3v")}>
                                {statsQuery.isLoading ? (
                                    <Skeleton count={1} rectangleHeight={400} />
                                ) : statsQuery.isError ? (
                                    <p className={fr.cx("fr-m-0")}>{t("error_loading")}</p>
                                ) : statsQuery.data !== undefined ? (
                                    <StatsBarChart stats={statsQuery.data} startDate={startDate} endDate={endDate} />
                                ) : (
                                    <p className={fr.cx("fr-m-0")}>Pas de données</p>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </Main>
    );
}
