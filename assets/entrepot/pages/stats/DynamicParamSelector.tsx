import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { useTranslation } from "@/i18n";
import { delta } from "@/utils";
import GroupedServiceSelect from "./GroupedServiceSelect";
import type { ParamDef, SelectParamDef, ServiceParamDef, StatsTranslator } from "./stats.types";

interface DynamicParamSelectorProps {
    param: ParamDef;
    resolvedDeps: Record<string, string>;
    value: string | undefined;
    onChange: (key: string, value: string) => void;
    /** valeurs à retirer des options (ex. entrepôt bac à sable) */
    excludeValues?: string[];
}

// Dispatcher : narrowing avant les hooks pour un typage exact de toOptions
export default function DynamicParamSelector(props: DynamicParamSelectorProps) {
    return props.param.kind === "service" ? <ServiceParamField {...props} param={props.param} /> : <SelectParamField {...props} param={props.param} />;
}

// Requête d'options d'un ParamDef (aucune auto-sélection : les selects restent vides par défaut)
function useParamOptions<TOption>(
    param: ParamDef,
    resolvedDeps: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toOptions: (data: any, t: StatsTranslator) => TOption[],
    t: StatsTranslator
) {
    const relevantDeps = useMemo(
        () => Object.fromEntries((param.dependsOn ?? []).map((dep) => [dep, resolvedDeps[dep] ?? ""])),
        [param.dependsOn, resolvedDeps]
    );
    const depsReady = !param.dependsOn || param.dependsOn.every((dep) => !!resolvedDeps[dep]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const select = useCallback((data: any) => toOptions(data, t), [toOptions, t]);

    const { data: options = [], isLoading } = useQuery({
        queryKey: param.queryKey(relevantDeps),
        queryFn: ({ signal }) => param.queryFn(relevantDeps, { signal }),
        select,
        enabled: depsReady,
        staleTime: delta.hours(1),
        refetchOnWindowFocus: false,
    });

    return { options, isLoading, depsReady };
}

function SelectParamField(props: DynamicParamSelectorProps & { param: SelectParamDef }) {
    const { param, resolvedDeps, value, onChange, excludeValues } = props;

    const { t } = useTranslation("Stats");
    const { options, isLoading, depsReady } = useParamOptions(param, resolvedDeps, param.toOptions, t);

    const displayOptions = useMemo(
        () => (excludeValues?.length ? options.filter((option) => !excludeValues.includes(option.value)) : options),
        [options, excludeValues]
    );
    const isDisabled = !depsReady || isLoading || displayOptions.length === 0;

    return (
        <Select
            label={param.label(t)}
            placeholder={isLoading ? t("options_loading") : depsReady && displayOptions.length === 0 ? t("no_options") : undefined}
            disabled={isDisabled}
            options={displayOptions}
            nativeSelectProps={{
                value: value ?? "",
                onChange: (e) => onChange(param.key, e.currentTarget.value),
            }}
        />
    );
}

function ServiceParamField(props: DynamicParamSelectorProps & { param: ServiceParamDef }) {
    const { param, resolvedDeps, value, onChange } = props;

    const { t } = useTranslation("Stats");
    const { options, isLoading, depsReady } = useParamOptions(param, resolvedDeps, param.toOptions, t);

    // états sans options : même rendu que les selects standard (SelectNext désactivé + placeholder)
    if (!depsReady || isLoading || options.length === 0) {
        return <Select label={param.label(t)} placeholder={isLoading ? t("options_loading") : depsReady ? t("no_options") : undefined} disabled options={[]} />;
    }

    return <GroupedServiceSelect label={param.label(t)} options={options} value={value} onChange={(encoded) => onChange(param.key, encoded)} />;
}
