import { fr } from "@codegouvfr/react-dsfr";
import { createFilterOptions, FilterOptionsState } from "@mui/material";
import { ReactNode, useCallback, useMemo } from "react";
import { useStyles } from "tss-react/mui";

import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { useTranslation } from "@/i18n";
import { encodeServiceValue } from "./statsConfig";
import type { ServiceOption } from "./stats.types";

interface GroupedServiceSelectProps {
    label: ReactNode;
    options: ServiceOption[];
    /** valeur encodée "endpoint:<id>" | "offering:<id>" ; vide = aucune sélection */
    value: string | undefined;
    onChange: (encodedValue: string) => void;
}

// la recherche ne porte que sur les services : les agrégats "tous les X" sont exclus du filtrage
const offeringsFilter = createFilterOptions<ServiceOption>({ ignoreAccents: true, ignoreCase: true, limit: 50 });

export default function GroupedServiceSelect(props: GroupedServiceSelectProps) {
    const { label, options, value, onChange } = props;

    const { t } = useTranslation("Stats");
    const { t: tCommon } = useTranslation("Common");
    const { css } = useStyles();

    const selected = useMemo(() => options.find((option) => encodeServiceValue(option) === value) ?? null, [options, value]);

    const filterOptions = useCallback((opts: ServiceOption[], state: FilterOptionsState<ServiceOption>) => {
        if (state.inputValue.trim() === "") {
            return opts;
        }
        return offeringsFilter(
            opts.filter((option) => option.kind === "offering"),
            state
        );
    }, []);

    const groupHeaderClassName = css({
        position: "sticky",
        top: "0",
        zIndex: 1,
        backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
        color: fr.colors.decisions.text.actionHigh.blueFrance.default,
        padding: "8px 16px",
        lineHeight: "1.5rem",
        fontWeight: "bold",
        fontSize: "0.9rem",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
    });

    return (
        <AutocompleteSelect<ServiceOption, false>
            label={label}
            placeholder={tCommon("select_option")}
            multiple={false}
            options={options}
            value={selected}
            onChange={(_, option) => onChange(option ? encodeServiceValue(option) : "")}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(a, b) => a.kind === b.kind && a.id === b.id}
            groupBy={(option) => option.group}
            renderGroup={(params) => (
                <li key={params.key}>
                    <div className={groupHeaderClassName}>{params.group}</div>
                    <ul className={fr.cx("fr-p-0", "fr-m-0")}>{params.children}</ul>
                </li>
            )}
            filterOptions={filterOptions}
            noOptionsText={t("service_select_no_match")}
        />
    );
}
