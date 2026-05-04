import { fr } from "@codegouvfr/react-dsfr";
import { TagProps } from "@codegouvfr/react-dsfr/Tag";
import TagsGroup from "@codegouvfr/react-dsfr/TagsGroup";
import { useState } from "react";

import DatePicker from "./DatePicker";

interface DateRangePickerProps {
    startDate: Date | undefined;
    endDate: Date | undefined;
    onChange: (start: Date | undefined, end: Date | undefined) => void;
}

type Shortcut = "1m" | "3m" | "6m" | "1an" | "custom";

const SHORTCUTS = [
    { key: "1m", label: "1 mois" },
    { key: "3m", label: "3 mois" },
    { key: "6m", label: "6 mois" },
    { key: "1an", label: "1 an" },
    { key: "custom", label: "Personnalisée" },
] as const;

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function stripTime(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

const DateRangePicker = ({ startDate, endDate, onChange }: DateRangePickerProps) => {
    const [selectedShortcut, setSelectedShortcut] = useState<Shortcut>("3m");

    const handleShortcut = (shortcut: Exclude<Shortcut, "custom">) => {
        const today = stripTime(new Date());
        const start = new Date(today);

        if (shortcut === "1m") {
            start.setMonth(start.getMonth() - 1);
        } else if (shortcut === "3m") {
            start.setMonth(start.getMonth() - 3);
        } else if (shortcut === "6m") {
            start.setMonth(start.getMonth() - 6);
        } else {
            start.setFullYear(start.getFullYear() - 1);
        }

        setSelectedShortcut(shortcut);
        onChange(start, today);
    };

    const handleStartDateChange = (value: Date | undefined) => {
        setSelectedShortcut("custom");
        if (!value) {
            onChange(undefined, endDate);
            return;
        }
        const d = stripTime(value);
        onChange(endDate && d >= endDate ? addDays(endDate, -1) : d, endDate);
    };

    const handleEndDateChange = (value: Date | undefined) => {
        setSelectedShortcut("custom");
        if (!value) {
            onChange(startDate, undefined);
            return;
        }
        const today = stripTime(new Date());
        let d = stripTime(value);
        if (d > today) d = today;
        if (startDate && d <= startDate) d = addDays(startDate, 1);
        onChange(startDate, d);
    };

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={fr.cx("fr-label")}>Période</label>
                <TagsGroup
                    tags={
                        SHORTCUTS.map(({ key, label }) => ({
                            children: label,
                            nativeButtonProps: {
                                onClick: () => {
                                    if (key === "custom") {
                                        setSelectedShortcut("custom");
                                    } else {
                                        handleShortcut(key);
                                    }
                                },
                            },
                            pressed: selectedShortcut === key,
                        })) as unknown as [TagProps, ...TagProps[]]
                    }
                />
            </div>

            {selectedShortcut === "custom" && (
                <>
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                        <DatePicker
                            label="Début"
                            value={startDate}
                            onChange={handleStartDateChange}
                            maxDate={endDate ? addDays(endDate, -1) : undefined}
                            disableFuture
                            state={!startDate ? "error" : "default"}
                            stateRelatedMessage={!startDate ? "Veuillez sélectionner une date" : ""}
                        />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                        <DatePicker
                            label="Fin"
                            value={endDate}
                            onChange={handleEndDateChange}
                            minDate={startDate ? addDays(startDate, 1) : undefined}
                            disableFuture
                            state={!endDate ? "error" : "default"}
                            stateRelatedMessage={!endDate ? "Veuillez sélectionner une date" : ""}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default DateRangePicker;
