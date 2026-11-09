import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import type { AutocompleteProps, CreateFilterOptionsConfig } from "@mui/material";
import { type ReactNode, type Ref, type SyntheticEvent, useState } from "react";
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
    /** Clé React Query construite depuis le terme recherché, ex. `(search) => ["communes", search]` */
    queryKey: (search: string) => QueryKey;

    /** Récupère les options du terme recherché */
    queryFn: (search: string, signal: AbortSignal) => Promise<T[]>;

    /** Nombre minimum de caractères pour déclencher la recherche. Défaut : 3. */
    minChars?: number;

    /** Délai de debounce en millisecondes. Défaut : 500. */
    debounceMs?: number;

    /** Options React Query additionnelles (ex. `staleTime`), hors `queryKey`, `queryFn` et `enabled` */
    queryOptions?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn" | "enabled">;

    /** Surcharge du filtre client-side. Défaut : identité, filtrage délégué au serveur. */
    filterOptions?: AutocompleteProps<T, M, D, F>["filterOptions"];

    /** Texte affiché pendant le chargement. Défaut : valeur i18n. */
    loadingText?: ReactNode;

    /** Texte affiché quand la liste est vide. Défaut : message contextuel i18n. */
    noOptionsText?: ReactNode;
}

// recherche asynchrone : saisie affichée immédiatement, requête partie après le délai de debounce
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

    // reflet immédiat de l’input : la liste se vide dans le même rendu que l’input
    const [inputValue, setInputValue] = useState("");
    // Seuil/affichage évalués sur l'état immédiat → réagit sans délai
    const trimmedInput = inputValue.trim();
    // Terme debouncé (déjà trimmé) : déclenche la requête réseau uniquement après `debounceMs`.
    const [debouncedSearch] = useDebouncedValue(trimmedInput, debounceMs);

    const hasMinChars = trimmedInput.length >= minChars;
    // Requête déclenchée uniquement si le terme debouncé atteint le seuil
    const enabled = debouncedSearch.length >= minChars;
    // requête pas encore partie : chargement affiché plutôt qu’un « aucun résultat » passager
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

    // relayé à l’appelant pour un champ freeSolo contrôlé (ex. React Hook Form)
    const handleInputChange = (event: SyntheticEvent, value: string, reason: Parameters<NonNullable<AutocompleteProps<T, M, D, F>["onInputChange"]>>[2]) => {
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
