import Select from "@codegouvfr/react-dsfr/SelectNext";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { delta } from "@/utils";
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
        queryKey: param.queryKey(relevantDeps),
        queryFn: ({ signal }) => param.queryFn(relevantDeps, { signal }),
        select: param.toOptions,
        enabled: depsReady,
        staleTime: delta.hours(1),
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
