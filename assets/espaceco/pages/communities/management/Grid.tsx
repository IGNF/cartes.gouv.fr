import { FC } from "react";
import { useForm } from "react-hook-form";
import { Grid } from "../../../../@types/espaceco";
import { useTranslation } from "../../../../i18n/i18n";
import GridList from "./GridList";

type GridProps = {
    grids: Grid[];
};

type GridForm = {
    grids: string[];
};

const Grid: FC<GridProps> = ({ grids }) => {
    const { t } = useTranslation("ManageCommunity");

    const form = useForm<GridForm>({
        mode: "onSubmit",
        values: {
            grids: Array.from(grids, (g) => g.name),
        },
    });
    const { setValue: setFormValue } = form;

    return (
        <>
            <h3>{t("grid.grids")}</h3>
            {t("grid.explain")}
            <GridList
                grids={grids}
                onChange={(grids) => {
                    setFormValue(
                        "grids",
                        Array.from(grids, (g) => g.name)
                    );
                }}
            />
        </>
    );
};

export default Grid;
