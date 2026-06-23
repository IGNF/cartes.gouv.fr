import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import type { AutocompleteProps, CreateFilterOptionsConfig } from "@mui/material";
import { type ReactNode, type Ref, useState } from "react";
import { symToStr } from "tsafe/symToStr";

import { useTranslation } from "@/i18n/i18n";
import AutocompleteSelect from "./AutocompleteSelect";

// Props gérées par le wrapper (ne doivent pas être passées par l'appelant).
// onInputChange est relayé à l'appelant (utile pour les champs freeSolo contrôlés par RHF).
type WrapperOwnedProps = "options" | "loading" | "loadingText" | "noOptionsText" | "filterOptions";

// Props d'affichage issues de AutocompleteSelect
interface AutocompleteSelectDisplayProps<T> {
    id?: string;
    label: ReactNode;
    hintText?: ReactNode;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    searchFilter?: CreateFilterOptionsConfig<T>;
}

interface AsyncAutocompleteSelectProps<T, M extends boolean | undefined = false, D extends boolean | undefined = false, F extends boolean | undefined = false>
    extends AutocompleteSelectDisplayProps<T>, Omit<AutocompleteProps<T, M, D, F>, "renderInput" | WrapperOwnedProps | "ref"> {
    /** Ref transmise à l'input sous-jacent (parité RHF focus-on-error). */
    ref?: Ref<HTMLInputElement>;
    /**
     * Construit la query key React Query à partir du terme de recherche debouncé.
     * Exemple : `(search) => ["communes", search]`
     */
    queryKey: (search: string) => QueryKey;

    /**
     * Fonction de récupération des options. Doit résoudre un tableau de T[].
     * Exemple : `(search, signal) => jsonFetch(\`/api?q=\${search}\`, { signal })`
     */
    queryFn: (search: string, signal: AbortSignal) => Promise<T[]>;

    /** Nombre minimum de caractères pour déclencher la recherche. Défaut : 3. */
    minChars?: number;

    /** Délai de debounce en millisecondes. Défaut : 500. */
    debounceMs?: number;

    /**
     * Options React Query additionnelles (ex. `staleTime`).
     * `queryKey`, `queryFn` et `enabled` ne peuvent pas être surchargés ici.
     */
    queryOptions?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn" | "enabled">;

    /** Surcharge du filtre client-side. Défaut : identité — filtrage délégué au serveur. */
    filterOptions?: AutocompleteProps<T, M, D, F>["filterOptions"];

    /** Texte affiché pendant le chargement. Défaut : valeur i18n. */
    loadingText?: ReactNode;

    /** Texte affiché quand la liste est vide. Défaut : message contextuel i18n. */
    noOptionsText?: ReactNode;
}

/**
 * Wrapper générique de `AutocompleteSelect` pour les recherches asynchrones.
 *
 * Encapsule : debounce, React Query (déclenchement conditionnel, keepPreviousData,
 * annulation via AbortSignal), et les états loading / seuil minimum / aucun résultat.
 *
 * L'appelant fournit `queryKey` et `queryFn` ; il reste entièrement agnostique de
 * l'API sous-jacente. La sélection (`onChange`) est transmise telle quelle.
 *
 * Architecture à deux états :
 * - `inputValue` (immédiat) : miroir exact de ce que MUI affiche dans l'input.
 *   Pilote l'affichage de la liste (options, noOptionsText) dans le même render.
 * - `debouncedSearch` (debouncé) : déclenche la requête réseau après `debounceMs`.
 *   Évite de spammer l'API à chaque frappe sans ralentir la réactivité visuelle.
 *
 * Grâce à cette séparation, la liste se vide immédiatement quand MUI vide l'input
 * (ex. sélection d'une option en mode multiple) sans attendre la fin du debounce.
 *
 * @example
 * <AsyncAutocompleteSelect<Commune>
 *     label="Commune"
 *     queryKey={(s) => ["communes", s]}
 *     queryFn={(s, signal) => fetchCommunes(s, signal)}
 *     getOptionLabel={(o) => o.nom}
 *     onChange={(_, v) => setValue(v)}
 * />
 */
function AsyncAutocompleteSelect<T, M extends boolean | undefined = false, D extends boolean | undefined = false, F extends boolean | undefined = false>(
    props: AsyncAutocompleteSelectProps<T, M, D, F>
) {
    const {
        queryKey,
        queryFn,
        minChars = 3,
        debounceMs = 500,
        queryOptions,
        filterOptions,
        loadingText: loadingTextProp,
        noOptionsText: noOptionsTextProp,
        onInputChange: consumerOnInputChange,
        ...rest
    } = props;

    const { t } = useTranslation("AutocompleteSelect");

    // État immédiat : suit exactement ce que MUI affiche dans l'input.
    // Permet de vider la liste dans le même render que le vidage de l'input.
    const [inputValue, setInputValue] = useState("");
    // Seuil/affichage évalués sur l'état immédiat → réagit sans délai
    const trimmedInput = inputValue.trim();
    // Terme debouncé (déjà trimmé) : déclenche la requête réseau uniquement après `debounceMs`.
    const [debouncedSearch] = useDebouncedValue(trimmedInput, debounceMs);

    const hasMinChars = trimmedInput.length >= minChars;
    // Requête déclenchée uniquement si le terme debouncé atteint le seuil
    const enabled = debouncedSearch.length >= minChars;
    // Vrai pendant la fenêtre debounce : l'utilisateur a tapé ≥ N caractères mais
    // la requête n'est pas encore partie → on affiche le loader pour éviter un flash
    // « aucun résultat » avant que la réponse n'arrive.
    const debouncePending = hasMinChars && trimmedInput !== debouncedSearch;

    const { data, isFetching } = useQuery<T[]>({
        queryKey: queryKey(debouncedSearch),
        queryFn: ({ signal }) => queryFn(debouncedSearch, signal),
        enabled,
        placeholderData: keepPreviousData,
        ...queryOptions,
    });

    // Message contextuel adapté à l'état courant (basé sur inputValue, pas le terme debouncé)
    const resolvedNoOptionsText = noOptionsTextProp ?? (hasMinChars ? t("no_options") : t("min_chars", { minChars }));

    // Refléter MUI sans condition — typing, clear et reset-sur-sélection passent tous par là.
    // C'est la source de vérité unique sur ce qui est affiché dans l'input.
    // On transfère également l'événement à l'appelant pour permettre un champ freeSolo contrôlé (ex. RHF).
    const handleInputChange = (
        event: React.SyntheticEvent,
        value: string,
        reason: Parameters<NonNullable<AutocompleteProps<T, M, D, F>["onInputChange"]>>[2]
    ) => {
        setInputValue(value);
        consumerOnInputChange?.(event, value, reason);
    };

    return (
        <AutocompleteSelect<T, M, D, F>
            {...(rest as Parameters<typeof AutocompleteSelect<T, M, D, F>>[0])}
            options={hasMinChars ? (data ?? []) : []}
            loading={hasMinChars && (debouncePending || isFetching)}
            loadingText={loadingTextProp ?? t("loading")}
            noOptionsText={resolvedNoOptionsText}
            filterOptions={filterOptions ?? ((x) => x)}
            onInputChange={handleInputChange}
        />
    );
}

AsyncAutocompleteSelect.displayName = symToStr({ AsyncAutocompleteSelect });

export default AsyncAutocompleteSelect;
