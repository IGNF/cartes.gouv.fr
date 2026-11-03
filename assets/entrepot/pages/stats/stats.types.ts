import type { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

import type { ComponentKey } from "@/i18n/types";

export const statsScopes = ["datastore", "user"] as const;
export type StatsScope = (typeof statsScopes)[number];

export type StatsTranslator = TranslationFunction<"Stats", ComponentKey>;

export type SelectOption = { value: string; label: string };

// option du sélecteur Service : un service publié (offering) ou l'agrégat "tous les X" (endpoint)
export type ServiceOption = {
    kind: "endpoint" | "offering";
    id: string;
    label: string;
    group: string;
};

type ParamDefBase<TData> = {
    key: string;
    label: (t: StatsTranslator) => string;
    queryKey: (deps: Record<string, string>) => string[];
    queryFn: (deps: Record<string, string>, options?: RequestInit) => Promise<TData>;
    dependsOn?: string[];
};

// toOptions en syntaxe méthode : paramètre bivariant, pour ranger des ParamDef de données différentes dans ParamDef[]
export type SelectParamDef<TData = unknown> = ParamDefBase<TData> & {
    kind: "select";
    toOptions(this: void, data: TData, t: StatsTranslator): SelectOption[];
};

export type ServiceParamDef<TData = unknown> = ParamDefBase<TData> & {
    kind: "service";
    toOptions(this: void, data: TData, t: StatsTranslator): ServiceOption[];
};

export type ParamDef = SelectParamDef | ServiceParamDef;

export type StatsRequest = { route: string; routeParams: Record<string, string> };

export type StatsEntityConfig = {
    label: (t: StatsTranslator) => string;
    params: ParamDef[];
    // dérive la route et ses params depuis les valeurs résolues ; undefined si sélection incomplète
    getStatsRequest: (resolved: Record<string, string>) => StatsRequest | undefined;
};

export type StatsScopeConfig = {
    param: ParamDef | null; // sélecteur de périmètre (Entrepôt) ; null pour le scope user
    entities: Record<string, StatsEntityConfig>;
};
