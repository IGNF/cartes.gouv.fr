import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { BarChart } from "@codegouvfr/react-dsfr/Chart/BarChart";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo, useRef, useState } from "react";
import { tss } from "tss-react";

import { StatsType } from "@/@types/stats";
import { IUseBarChartOptions, useBarChart } from "@/hooks/useBarChart";
import { useTranslation } from "@/i18n";
import { niceBytes, saveBlob } from "@/utils";

export default function Chart(props: IUseBarChartOptions) {
    const { barChartProps, ref: chartContainerRef } = useBarChart(props);
    const chartRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState<"chart" | "table">("chart");

    const { t } = useTranslation("Stats");
    const { classes } = useStyles();

    const tableHeaders = useMemo(() => [t("date_column"), t("data_type", { type: props.type as StatsType })], [props.type, t]);
    const tableData: string[][] = useMemo(() => {
        const x = barChartProps.x.flat();
        const y = barChartProps.y.flat();

        if (x.length === 0 || y.length === 0) {
            return [];
        }

        const data: string[][] = x.reduce((acc, xValue, index) => {
            const yValue = y[index];
            acc.push([xValue, niceBytes(yValue.toString())]);
            return acc;
        }, [] as string[][]);

        return data;
    }, [barChartProps]);

    function handleExportChart(fileName = "chart.png") {
        const canvas = chartRef.current?.querySelector("canvas");
        if (!canvas) return;

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                void saveBlob(blob, {
                    fileName,
                    description: "Image PNG",
                    mimeType: "image/png",
                    extension: ".png",
                });
            },
            "image/png",
            1
        );
    }

    function handleExportData(data: string[][], fileName = "data.csv") {
        const escapeCsvCell = (value: string): string => {
            const escapedValue = value.replaceAll('"', '""');

            return /[;"\n\r]/.test(escapedValue) ? `"${escapedValue}"` : escapedValue;
        };

        const csvRows = [tableHeaders, ...data].map((row) => row.map(escapeCsvCell).join(";"));
        const csvContent = `\uFEFF${csvRows.join("\r\n")}`;
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

        void saveBlob(blob, {
            fileName,
            description: "Fichier CSV",
            mimeType: "text/csv",
            extension: ".csv",
        });
    }

    return (
        <>
            <div className={classes.buttonsContainer}>
                <SegmentedControl
                    legend={t("view_mode_legend")}
                    hideLegend={true}
                    segments={[
                        {
                            label: t("view_chart"),
                            iconId: "ri-bar-chart-line",
                            nativeInputProps: {
                                checked: view === "chart",
                                onChange: () => setView("chart"),
                            },
                        },
                        {
                            label: t("view_table"),
                            iconId: "ri-table-line",
                            nativeInputProps: {
                                checked: view === "table",
                                onChange: () => setView("table"),
                            },
                        },
                    ]}
                    small
                />
                <ButtonsGroup
                    buttons={[
                        {
                            iconId: "ri-export-fill",
                            children: t("export_chart"),
                            priority: "tertiary no outline",
                            onClick: () => handleExportChart(),
                        },
                        {
                            iconId: "ri-numbers-fill",
                            children: t("export_data"),
                            priority: "tertiary no outline",
                            onClick: () => handleExportData(tableData),
                        },
                    ]}
                    buttonsSize="small"
                    inlineLayoutWhen="lg and up"
                />
            </div>
            <div ref={chartContainerRef} className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col", "fr-col-12")}>
                    {view === "chart" ? (
                        <BarChart className={classes.chart} ref={chartRef} {...barChartProps} />
                    ) : (
                        <Table data={tableData} bordered headers={tableHeaders} fixed />
                    )}
                </div>
            </div>
        </>
    );
}

const useStyles = tss.create(() => ({
    buttonsContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "1rem",

        ["& > ul > li > button"]: {
            marginBottom: "0 !important",
        },
    },
    chart: {
        flex: 1,
    },
}));
