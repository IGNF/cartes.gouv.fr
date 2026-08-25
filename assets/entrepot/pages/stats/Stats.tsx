import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { HitStatisticsDto } from "@/@types/stats";
import DateRangePicker from "@/components/Input/DateRangePicker";
import Main from "@/components/Layout/Main";
import Skeleton from "@/components/Utils/Skeleton";
import { sandboxCommunityId } from "@/env";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { useTranslation } from "@/i18n";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";
import { routes, useRoute } from "@/router/router";
import { findMembership } from "@/utils";
import DynamicParamSelector from "./DynamicParamSelector";
import type { StatsScope, StatsScopeConfig } from "./stats.types";
import StatsBarChart from "./StatsBarChart";
import { statsConfig } from "./statsConfig";

// Aucune entité pré-sélectionnée, sauf si le scope n'en a qu'une (le select est alors masqué)
function initEntityTypeKey(scope: StatsScope): string | undefined {
    const keys = Object.keys(statsConfig[scope]?.entities ?? {});
    return keys.length === 1 ? keys[0] : undefined;
}

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

    const scopeConfig: StatsScopeConfig | undefined = statsConfig[scope];
    const entities = scopeConfig?.entities ?? {};
    const entityTypeKeys = Object.keys(entities);
    const scopeParam = scopeConfig?.param ?? null;

    const [entityTypeKey, setEntityTypeKey] = useState<string | undefined>(() => initEntityTypeKey(scope));
    const [resolvedParams, setResolvedParams] = useState<Record<string, string>>({});

    const [startDate, setStartDate] = useState<Date | undefined>(() => initDate(1));
    const [endDate, setEndDate] = useState<Date | undefined>(() => initDate());

    useEffect(() => {
        setEntityTypeKey(initEntityTypeKey(scope));
        setResolvedParams({});
    }, [scope]);

    // périmètre entrepôt : détection "aucun entrepôt" et exclusion du bac à sable
    const isDatastoreScope = scope === "datastore";
    const userQuery = useUserQuery();
    const sandboxId = sandboxCommunityId !== null ? findMembership(userQuery.data, { communityId: sandboxCommunityId })?.community?.datastore : undefined;

    const nonSandboxDatastoreCount = useMemo(
        () =>
            (userQuery.data?.communities_member ?? []).filter(
                (cm) => cm.community?.datastore && (sandboxId === undefined || cm.community.datastore !== sandboxId)
            ).length,
        [userQuery.data, sandboxId]
    );
    const datastoreScopeReady = !isDatastoreScope || !userQuery.isPending;
    const hasNoDatastore = isDatastoreScope && datastoreScopeReady && nonSandboxDatastoreCount === 0;

    const currentConfig = entityTypeKey ? entities[entityTypeKey] : undefined;

    // Combinaison du param de périmètre + params de l'entité pour la résolution et les resets
    const allParams = useMemo(() => (scopeParam ? [scopeParam, ...(currentConfig?.params ?? [])] : (currentConfig?.params ?? [])), [scopeParam, currentConfig]);

    const handleEntityTypeChange = (key: string) => {
        setEntityTypeKey(key);
        // Conserver uniquement le param de périmètre (ex. entrepôt déjà choisi) ; purger le reste
        setResolvedParams((prev) => (scopeParam && prev[scopeParam.key] ? { [scopeParam.key]: prev[scopeParam.key] } : {}));
    };

    const handleParamChange = useCallback(
        (key: string, value: string) => {
            setResolvedParams((prev) => {
                const keysToReset = allParams.filter((p) => p.dependsOn?.includes(key)).map((p) => p.key);
                const next = { ...prev, [key]: value };
                keysToReset.forEach((k) => delete next[k]);
                return next;
            });
        },
        [allParams]
    );

    const allParamsResolved = !!currentConfig && allParams.every((p) => !!resolvedParams[p.key]);

    const dateQuery = useMemo(
        () => ({
            start: startDate?.toISOString(),
            end: endDate?.toISOString(),
            details: true,
        }),
        [startDate, endDate]
    );

    // route + params dérivés des valeurs résolues (endpoint/offering pour le param service)
    const request = currentConfig?.getStatsRequest(resolvedParams);

    const statsQuery = useQuery({
        queryKey: [scope, entityTypeKey, "stats", request?.route, request?.routeParams, dateQuery],
        queryFn: ({ signal }) => {
            const url = SymfonyRouting.generate(request!.route, { ...request!.routeParams, ...dateQuery });
            return jsonFetch<HitStatisticsDto>(url, { signal });
        },
        enabled: !!request && allParamsResolved && !!startDate && !!endDate,
        refetchOnWindowFocus: false,
    });

    const entityTypeOptions = entityTypeKeys.map((key) => ({
        value: key,
        label: entities[key].label(t),
    }));

    return (
        <Main
            title={t("scope_title", { scope })}
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
                currentPageLabel: t("scope_title", { scope }),
            }}
        >
            <h1>{t("scope_title", { scope })}</h1>

            <div className={fr.cx("fr-mb-3w")}>
                {!scopeConfig ? (
                    <p className={fr.cx("fr-m-0")}>{t("no_stats_for_scope")}</p>
                ) : isDatastoreScope && !datastoreScopeReady ? (
                    <Skeleton count={1} rectangleHeight={80} />
                ) : hasNoDatastore ? (
                    <p className={fr.cx("fr-m-0")}>{t("no_datastore_message")}</p>
                ) : (
                    <>
                        {isDatastoreScope && <p>{t("datastore_intro")}</p>}
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            {scopeParam && (
                                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                                    <DynamicParamSelector
                                        param={scopeParam}
                                        resolvedDeps={resolvedParams}
                                        value={resolvedParams[scopeParam.key]}
                                        onChange={handleParamChange}
                                        excludeValues={sandboxId ? [sandboxId] : undefined}
                                    />
                                </div>
                            )}

                            {entityTypeKeys.length > 1 && (
                                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                                    <Select
                                        label={t("entity_select_label", { scope })}
                                        options={entityTypeOptions}
                                        nativeSelectProps={{
                                            value: entityTypeKey ?? "",
                                            onChange: (e) => handleEntityTypeChange(e.currentTarget.value),
                                        }}
                                    />
                                </div>
                            )}

                            {currentConfig?.params.map((param) => (
                                <div className={fr.cx("fr-col-12", "fr-col-md-4")} key={param.key}>
                                    <DynamicParamSelector
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
                                        <p className={fr.cx("fr-m-0")}>{t("no_data")}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </Main>
    );
}
