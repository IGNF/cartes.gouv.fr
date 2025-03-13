import { BarChart } from "@codegouvfr/react-dsfr/Chart/BarChart";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

import { IUseBarChartOptions, useBarChart } from "@/hooks/useBarChart";

export interface IChartProps extends IUseBarChartOptions {
    page?: number;
    onPageChange?: (page: number) => void;
    totalPage?: number;
}

export default function Chart(props: IChartProps) {
    const { page = 1, onPageChange, totalPage = 1, ...options } = props;
    const { barChartProps, ref } = useBarChart(options);
    const { classes } = useStyles();

    function handlePageChange(page) {
        return () => onPageChange?.(Math.max(Math.min(page, totalPage), 1));
    }

    return (
        <div ref={ref} className={classes.root}>
            {totalPage > 2 && (
                <Button
                    className={classes.prev}
                    iconId="fr-icon-arrow-left-s-line"
                    onClick={handlePageChange(page - 1)}
                    priority="tertiary no outline"
                    title="Page précédente"
                    disabled={page === 1}
                />
            )}
            <BarChart className={classes.chart} {...barChartProps} />
            {totalPage > 2 && (
                <Button
                    className={classes.next}
                    iconId="fr-icon-arrow-right-s-line"
                    onClick={handlePageChange(page + 1)}
                    priority="tertiary no outline"
                    title="Page suivante"
                    disabled={page === totalPage}
                />
            )}
        </div>
    );
}

const useStyles = tss.create(() => ({
    root: {
        display: "flex",
        alignItems: "center",
    },
    chart: {
        flex: 1,
    },
    prev: {},
    next: {},
}));
