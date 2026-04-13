import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import type { ParamDef } from "./statsConfig";

interface DynamicParamSelectorProps {
    param: ParamDef;
    resolvedDeps: Record<string, string>;
    value: string | undefined;
    onChange: (key: string, value: string) => void;
}

export default function DynamicParamSelector({ param, resolvedDeps, value, onChange }: DynamicParamSelectorProps) {
    const relevantDeps = useMemo(
        () => Object.fromEntries((param.dependsOn ?? []).map((dep) => [dep, resolvedDeps[dep] ?? ""])),
        [param.dependsOn, resolvedDeps]
    );

    const depsReady = !param.dependsOn || param.dependsOn.every((dep) => !!resolvedDeps[dep]);

    const { data: options = [], isLoading } = useQuery({
        queryKey: ["stats_param_options", param.key, relevantDeps],
        queryFn: () => param.fetchOptions(relevantDeps),
        enabled: depsReady,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Auto-sélection de la première option
    useEffect(() => {
        if (options.length > 0 && !value) {
            onChange(param.key, options[0].value);
        }
    }, [options, value, onChange, param.key]);

    const isDisabled = !depsReady || isLoading || options.length === 0;
    const displayOptions = options.length > 0 ? options : [{ value: "", label: isLoading ? "Chargement…" : "Aucune option" }];

    return (
        <Select
            label={param.label}
            disabled={isDisabled}
            options={displayOptions}
            nativeSelectProps={{
                value: value ?? "",
                onChange: (e) => onChange(param.key, e.currentTarget.value),
            }}
        />
    );
}
